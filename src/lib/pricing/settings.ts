import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Pricing configuration stored in SiteSetting key "pricing".
 * Controls the global international pricing toggle and the currency
 * conversion table used to display local prices for non-IN visitors.
 */
export interface CurrencyConfig {
  rate: number; // 1 INR -> this many units
  symbol: string;
  locale: string;
  label: string;
}

export interface PricingSettings {
  enabled: boolean; // global pricing toggle (ON = international markup applied)
  markup: number; // e.g. 0.3 = 30% added on top of the base INR price
  baseCountry: string; // country code that keeps the base INR price ("IN")
  currencies: Record<string, CurrencyConfig>;
  disclosure: string; // short note shown next to converted prices
}

export const DEFAULT_PRICING: PricingSettings = {
  enabled: false,
  markup: 0.3,
  baseCountry: "IN",
  currencies: {
    USD: { rate: 0.012, symbol: "$", locale: "en-US", label: "US Dollar" },
    EUR: { rate: 0.011, symbol: "â‚¬", locale: "de-DE", label: "Euro" },
    GBP: { rate: 0.0095, symbol: "Â£", locale: "en-GB", label: "British Pound" },
  },
  disclosure: "Approximate price for your region. Final payment is collected in INR.",
};

function isPricingSettings(v: unknown): v is PricingSettings {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (typeof o.enabled !== "boolean" || typeof o.markup !== "number") return false;
  if (typeof o.baseCountry !== "string") return false;
  if (!o.currencies || typeof o.currencies !== "object") return false;
  for (const c of Object.values(o.currencies as Record<string, unknown>)) {
    const cc = c as Record<string, unknown>;
    if (typeof cc.rate !== "number" || typeof cc.symbol !== "string" || typeof cc.locale !== "string") return false;
  }
  return true;
}

function mergeSettings(raw: unknown): PricingSettings {
  if (!isPricingSettings(raw)) return DEFAULT_PRICING;
  return {
    enabled: raw.enabled,
    markup: raw.markup,
    baseCountry: raw.baseCountry,
    currencies: { ...DEFAULT_PRICING.currencies, ...raw.currencies },
    disclosure: typeof raw.disclosure === "string" ? raw.disclosure : DEFAULT_PRICING.disclosure,
  };
}

/** Read the pricing settings (cached once per request). */
export const getPricingSettings = cache(async (): Promise<PricingSettings> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "pricing" } });
    return mergeSettings(row?.value);
  } catch (e) {
    console.error("[pricing] getPricingSettings failed:", e);
    return DEFAULT_PRICING;
  }
});

/** Meta about the last pricing engine run, stored alongside the settings. */
export interface PricingRunMeta {
  lastRunAt: string | null;
  lastRunSummary: Record<string, unknown> | null;
  lastImageRunAt: string | null;
  lastImageRunSummary: Record<string, unknown> | null;
}

export const EMPTY_RUN_META: PricingRunMeta = {
  lastRunAt: null,
  lastRunSummary: null,
  lastImageRunAt: null,
  lastImageRunSummary: null,
};

function isRunMeta(v: unknown): v is PricingRunMeta {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    (o.lastRunAt === null || typeof o.lastRunAt === "string") &&
    (o.lastRunSummary === null || typeof o.lastRunSummary === "object") &&
    (o.lastImageRunAt === null || typeof o.lastImageRunAt === "string") &&
    (o.lastImageRunSummary === null || typeof o.lastImageRunSummary === "object")
  );
}

/** Read the last-run meta stored in the same SiteSetting row. */
export const getPricingRunMeta = cache(async (): Promise<PricingRunMeta> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "pricing" } });
    const v = row?.value;
    if (v && typeof v === "object" && "meta" in (v as object)) {
      const meta = (v as { meta?: unknown }).meta;
      if (isRunMeta(meta)) return meta;
    }
  } catch (e) {
    console.error("[pricing] getPricingRunMeta failed:", e);
  }
  return EMPTY_RUN_META;
});

/** Persist settings + run meta in one upsert. */
export async function savePricingSettings(
  settings: PricingSettings,
  meta?: PricingRunMeta
): Promise<void> {
  const existing = await prisma.siteSetting.findUnique({ where: { key: "pricing" } });
  const prev = existing?.value && typeof existing.value === "object"
    ? (existing.value as Record<string, unknown>)
    : {};
  const mergedMeta: Record<string, unknown> | null | undefined = meta
    ? ({ ...meta } as Record<string, unknown>)
    : (prev.meta as Record<string, unknown> | undefined);
  const value: Record<string, unknown> = {
    ...prev,
    ...settings,
    meta: mergedMeta ?? null,
  };
  await prisma.siteSetting.upsert({
    where: { key: "pricing" },
    update: { value: value as never },
    create: { key: "pricing", value: value as never },
  });
}

/** Persist only the run meta (used after each engine run). */
export async function savePricingRunMeta(meta: PricingRunMeta): Promise<void> {
  const existing = await prisma.siteSetting.findUnique({ where: { key: "pricing" } });
  const prev = existing?.value && typeof existing.value === "object"
    ? (existing.value as Record<string, unknown>)
    : {};
  const value: Record<string, unknown> = {
    ...prev,
    meta: { ...meta } as Record<string, unknown>,
  };
  await prisma.siteSetting.upsert({
    where: { key: "pricing" },
    update: { value: value as never },
    create: { key: "pricing", value: value as never },
  });
}
