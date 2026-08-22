import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchCompetitorPrices, type CompetitorPriceResult } from "@/lib/pricing/competitors";
import { getPricingRunMeta, savePricingRunMeta, getPricingSettings, type PricingRunMeta } from "@/lib/pricing/settings";

/**
 * Dynamic pricing engine (safe version).
 *
 * - Physical products (Product):  price = competitor * 0.99, never below
 *   the floor (explicit priceFloor, or costPrice * 1.15 when set).
 * - Digital services (Service):   price = competitor * 1.05 (premium
 *   perception), optionally floored by an explicit priceFloor.
 *
 * The engine only touches products with a competitorPrice and a usable
 * floor. Every change is written to the PriceChange audit table with the
 * source (cron | admin). It is intentionally conservative: no price is
 * ever lowered below the floor, no inactive item is touched, and the run
 * stops when the time budget is exhausted. Runs are triggered manually
 * from the admin dashboard (one-click refresh) or via local scripts.
 *
 * Automation settings (SiteSetting "pricing"):
 * - autoUpdateEnabled=false -> every non-forced run is frozen (no price
 *   changes at all). Only the explicit "Reset All Prices to Auto-Update
 *   Rules" button (force=true) can change prices while frozen.
 * - priceSource="manual" -> the price is a manual override and is never
 *   touched by the engine unless force=true (the reset button).
 */

export type PricingKind = "physical" | "digital";

export interface ComputeInput {
  kind: PricingKind;
  competitorPrice: number | Prisma.Decimal;
  costPrice?: Prisma.Decimal | number | null;
  priceFloor?: Prisma.Decimal | number | null;
}

export interface ComputeResult {
  price: Prisma.Decimal;
  floorUsed: Prisma.Decimal | null;
  reason: string;
}

const DEC = (v: Prisma.Decimal | number | string): Prisma.Decimal => {
  const d = v instanceof Prisma.Decimal ? v : new Prisma.Decimal(v);
  return d;
};

/**
 * Core formula. Returns null when no floor can be determined (the engine
 * refuses to price items it cannot protect with a floor).
 */
export function computeTargetPrice(input: ComputeInput): ComputeResult | null {
  const competitor = DEC(input.competitorPrice);
  if (competitor.lte(0)) return null;

  const candidate =
    input.kind === "physical"
      ? competitor.mul(0.99)
      : competitor.mul(1.05);

  let floor: Prisma.Decimal | null = null;
  if (input.priceFloor !== null && input.priceFloor !== undefined) {
    floor = DEC(input.priceFloor);
  } else if (input.kind === "physical" && input.costPrice !== null && input.costPrice !== undefined) {
    floor = DEC(input.costPrice).mul(1.15);
  }

  if (floor === null) return null; // no floor -> refuse (safe default)

  const price = Prisma.Decimal.max(candidate, floor).toDecimalPlaces(2);
  const reason =
    price.equals(candidate)
      ? `competitor-based price ${input.kind === "physical" ? "(×0.99)" : "(×1.05)"}`
      : `raised to floor ${floor.toString()} (min margin/floor protection)`;
  return { price, floorUsed: floor, reason };
}

export interface PriceUpdateSummary {
  source: string;
  frozen: boolean; // auto-update toggle is OFF -> no prices changed
  fetched: number;
  fetchedErrors: number;
  noResults: number;
  priced: number;
  changed: number;
  unchanged: number;
  manualSkipped: number; // manual overrides left untouched
  skippedNoFloor: number;
  skippedInactive: number;
  budgetExhausted: boolean;
  notes: string[];
}

interface ProductRow {
  id: string;
  name: string;
  price: Prisma.Decimal;
  competitorPrice: Prisma.Decimal | null;
  costPrice: Prisma.Decimal | null;
  priceFloor: Prisma.Decimal | null;
  priceSource: string;
}

interface ServiceRow {
  id: string;
  name: string;
  price: Prisma.Decimal | null;
  priceLabel: string | null;
  competitorPrice: Prisma.Decimal | null;
  priceFloor: Prisma.Decimal | null;
  priceSource: string;
}

export interface RunOptions {
  source?: "cron" | "admin";
  timeBudgetMs?: number;
  fetchLimit?: number; // max items to query per run
  onlyIds?: string[]; // restrict to specific products (admin single-item run)
  force?: boolean; // "Reset All Prices to Auto-Update Rules" - ignores manual overrides + toggle
}

const hour = 60 * 60 * 1000;
const week = 7 * 24 * hour;

/**
 * Apply the formula to an item and record an audit row when the price
 * actually changes.
 */
async function applyFormulaAndAudit(
  kind: PricingKind,
  item: { id: string; price: Prisma.Decimal | null; competitorPrice: Prisma.Decimal | null; priceSource: string },
  costPrice: Prisma.Decimal | null,
  priceFloor: Prisma.Decimal | null,
  source: "cron" | "admin",
  summary: PriceUpdateSummary,
  force: boolean
): Promise<void> {
  if (item.price === null || item.competitorPrice === null) return;
  if (item.priceSource === "manual" && !force) {
    summary.manualSkipped += 1;
    return;
  }
  const computed = computeTargetPrice({ kind, competitorPrice: item.competitorPrice, costPrice, priceFloor });
  if (!computed) {
    summary.skippedNoFloor += 1;
    return;
  }
  summary.priced += 1;
  if (computed.price.equals(item.price)) {
    summary.unchanged += 1;
    return;
  }
  const data = {
    price: computed.price,
    priceSource: "competitor" as const,
    priceReviewedAt: new Date(),
  };
  const audit = {
    oldValue: item.price,
    newValue: computed.price,
    field: "price",
    reason: computed.reason,
    source,
  };
  if (kind === "physical") {
    await prisma.product.update({
      where: { id: item.id },
      data: { ...data, priceChanges: { create: audit } },
    });
  } else {
    await prisma.service.update({
      where: { id: item.id },
      data: { ...data, priceChanges: { create: audit } },
    });
  }
  summary.changed += 1;
}

function deadline(ms: number): { until: number; spent(): boolean } {
  const until = Date.now() + ms;
  return { until, spent: () => Date.now() >= until };
}

/**
 * Main job entry point used by the admin dashboard buttons and the local
 * sweep script. Never throws - returns a summary.
 */
export async function runPriceUpdate(options: RunOptions = {}): Promise<PriceUpdateSummary> {
  const { source = "cron", timeBudgetMs = 8000, fetchLimit = 40, onlyIds, force = false } = options;
  const summary: PriceUpdateSummary = {
    source,
    frozen: false,
    fetched: 0,
    fetchedErrors: 0,
    noResults: 0,
    priced: 0,
    changed: 0,
    unchanged: 0,
    manualSkipped: 0,
    skippedNoFloor: 0,
    skippedInactive: 0,
    budgetExhausted: false,
    notes: [],
  };
  const t = deadline(timeBudgetMs);

  try {
    // 0) Automation gate: when the "Enable Auto-Update Pricing" toggle is
    //    OFF, every non-forced run is frozen. Only the admin "Reset All
    //    Prices to Auto-Update Rules" button (force=true) may change prices.
    const pricingSettings = await getPricingSettings();
    if (!force && !pricingSettings.autoUpdateEnabled) {
      summary.frozen = true;
      summary.notes.push(
        "Auto-update is OFF - prices frozen. Enable 'Enable Auto-Update Pricing' in Pricing Automation Settings, or use 'Reset All Prices to Auto-Update Rules' to force a sweep."
      );
      await saveRunMeta(source, summary);
      return summary;
    }

    // 1) Refresh competitor prices first (SerpApi) so the formula below
    //    runs against the freshest data. Skipped when the key is missing.
    const dormant = !process.env.SERPAPI_API_KEY;
    if (!dormant && !t.spent()) {
      const staleCutoff = new Date(Date.now() - week);
      const toFetch = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [{ competitorPrice: null }, { priceReviewedAt: null }, { priceReviewedAt: { lt: staleCutoff } }],
          ...(onlyIds ? { id: { in: onlyIds } } : {}),
        },
        select: { id: true, name: true, subcategory: true, material: true, category: { select: { name: true } } },
        take: fetchLimit,
        orderBy: { priceReviewedAt: "asc" },
      });
      const serviceFetch = await prisma.service.findMany({
        where: {
          isActive: true,
          OR: [{ competitorPrice: null }, { priceReviewedAt: null }, { priceReviewedAt: { lt: staleCutoff } }],
          ...(onlyIds ? { id: { in: onlyIds } } : {}),
        },
        select: { id: true, name: true },
        take: fetchLimit,
        orderBy: { priceReviewedAt: "asc" },
      });

      const queries = [
        ...toFetch.map((p) => ({
          id: `product:${p.id}`,
          query: [p.name, p.category?.name].filter(Boolean).join(" "),
        })),
        ...serviceFetch.map((s) => ({ id: `service:${s.id}`, query: s.name })),
      ];

      if (queries.length > 0) {
        const results = await fetchCompetitorPrices(queries);
        const updates: Array<Promise<unknown>> = [];
        const reviewedAt = new Date();
        for (const [key, value] of results) {
          if (t.spent()) { summary.budgetExhausted = true; break; }
          const [kind, id] = key.split(":");
          if (kind !== "product" && kind !== "service") continue;
          if (value === null) { summary.noResults += 1; continue; }
          if ("error" in value) { summary.fetchedErrors += 1; continue; }
          const r = value as CompetitorPriceResult;
          summary.fetched += 1;
          updates.push(
            kind === "product"
              ? prisma.product.update({ where: { id }, data: { competitorPrice: r.price, priceReviewedAt: reviewedAt } })
              : prisma.service.update({ where: { id }, data: { competitorPrice: r.price, priceReviewedAt: reviewedAt } })
          );
          if (updates.length >= 10) {
            await Promise.all(updates.splice(0));
          }
        }
        if (updates.length > 0) await Promise.all(updates);
      }
    } else if (dormant) {
      summary.notes.push("SERPAPI_API_KEY not set - competitor refresh skipped (dormant).");
    }

    // 2) Apply the formula to every item that has a competitor price:
    //    physical -> competitor x 0.99, never below floor (explicit or cost x 1.15);
    //    digital  -> competitor x 1.05, never below explicit floor.
    const products: ProductRow[] = await prisma.product.findMany({
      where: { isActive: true, competitorPrice: { not: null }, ...(onlyIds ? { id: { in: onlyIds } } : {}) },
      select: { id: true, name: true, price: true, competitorPrice: true, costPrice: true, priceFloor: true, priceSource: true },
      orderBy: { name: "asc" },
    });
    for (const p of products) {
      if (t.spent()) { summary.budgetExhausted = true; break; }
      await applyFormulaAndAudit("physical", p, p.costPrice, p.priceFloor, source, summary, force);
    }

    const services: ServiceRow[] = await prisma.service.findMany({
      where: { isActive: true, competitorPrice: { not: null }, ...(onlyIds ? { id: { in: onlyIds } } : {}) },
      select: { id: true, name: true, price: true, priceLabel: true, competitorPrice: true, priceFloor: true, priceSource: true },
      orderBy: { name: "asc" },
    });
    for (const s of services) {
      if (t.spent()) { summary.budgetExhausted = true; break; }
      if (s.priceLabel) {
        // Label-priced services keep their manual label; competitor data is
        // still stored for review but never overwrites a hand-written label.
        summary.unchanged += 1;
        continue;
      }
      await applyFormulaAndAudit("digital", s, null, s.priceFloor, source, summary, force);
    }

    // 3) Persist run meta for the admin dashboard (keeps image-run fields).
    await saveRunMeta(source, summary);
  } catch (e) {
    console.error("[pricing] runPriceUpdate failed:", e);
    summary.notes.push(`Error: ${e instanceof Error ? e.message : String(e)}`);
  }

  return summary;
}

/** Persist last-run meta, preserving the image-pipeline fields. */
async function saveRunMeta(
  source: "cron" | "admin",
  summary: PriceUpdateSummary
): Promise<void> {
  const prevMeta = await getPricingRunMeta();
  const meta: PricingRunMeta = {
    lastRunAt: new Date().toISOString(),
    lastRunSummary: { ...summary, notes: summary.notes } as unknown as Record<string, unknown>,
    lastImageRunAt: prevMeta.lastImageRunAt,
    lastImageRunSummary: prevMeta.lastImageRunSummary,
  };
  await savePricingRunMeta(meta);
}
