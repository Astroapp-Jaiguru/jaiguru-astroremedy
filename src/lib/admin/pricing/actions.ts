"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { runPriceUpdate } from "@/lib/pricing/engine";
import {
  DEFAULT_PRICING,
  getPricingSettings,
  savePricingSettings,
  type PricingSettings,
} from "@/lib/pricing/settings";
import { assignImagesForMissing } from "@/lib/images/pipeline";

export interface PricingFormState {
  error?: string;
  success?: boolean;
}

export interface JobFormState {
  error?: string;
  success?: boolean;
  message?: string;
}

function num(fd: FormData, key: string): number {
  const v = fd.get(key);
  if (typeof v !== "string" || v.trim() === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function symbol(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : "$";
}

function locale(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : "en-US";
}

function text(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Save the global pricing settings (international markup toggle, markup
 * percentage, currency table and disclosure note).
 */
export async function savePricingSettingsAction(
  _prev: PricingFormState | undefined,
  fd: FormData
): Promise<PricingFormState> {
  try {
    await requireAdmin();

    const markupRaw = num(fd, "markup");
    const existing = await getPricingSettings();

    const settings: PricingSettings = {
      enabled: fd.get("enabled") === "on",
      markup: markupRaw > 0 ? Math.min(markupRaw, 5) : existing.markup, // cap at 500%
      baseCountry: text(fd, "baseCountry").toUpperCase().slice(0, 2) || "IN",
      currencies: {
        USD: {
          rate: num(fd, "usdRate") || existing.currencies.USD.rate,
          symbol: symbol(fd, "usdSymbol") || existing.currencies.USD.symbol,
          locale: locale(fd, "usdLocale") || existing.currencies.USD.locale,
          label: "US Dollar",
        },
        EUR: {
          rate: num(fd, "eurRate") || existing.currencies.EUR.rate,
          symbol: symbol(fd, "eurSymbol") || existing.currencies.EUR.symbol,
          locale: locale(fd, "eurLocale") || existing.currencies.EUR.locale,
          label: "Euro",
        },
        GBP: {
          rate: num(fd, "gbpRate") || existing.currencies.GBP.rate,
          symbol: symbol(fd, "gbpSymbol") || existing.currencies.GBP.symbol,
          locale: locale(fd, "gbpLocale") || existing.currencies.GBP.locale,
          label: "British Pound",
        },
      },
      disclosure:
        text(fd, "disclosure") || DEFAULT_PRICING.disclosure,
    };

    await savePricingSettings(settings);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (e) {
    console.error("[admin] savePricingSettingsAction failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to save settings" };
  }
}

/**
 * "Run now" for the pricing engine (refresh competitor prices in batch and
 * apply the safe formulas). Respects the function time budget.
 */
export async function runPricingJobAction(
  _prev: JobFormState | undefined,
  _fd: FormData
): Promise<JobFormState> {
  void _prev;
  void _fd;
  try {
    await requireAdmin();
    const summary = await runPriceUpdate({
      source: "admin",
      timeBudgetMs: 8000, // fits Vercel Free function limit (~10s)
    });
    revalidatePath("/admin/pricing");
    return {
      success: true,
      message: JSON.stringify(summary),
    };
  } catch (e) {
    console.error("[admin] runPricingJobAction failed:", e);
    return { error: e instanceof Error ? e.message : "Pricing job failed" };
  }
}

/**
 * "Run now" for the image pipeline (Unsplash fallback for products without
 * images; AI generation only for items Unsplash cannot match).
 */
export async function runImageJobAction(
  _prev: JobFormState | undefined,
  _fd: FormData
): Promise<JobFormState> {
  void _prev;
  void _fd;
  try {
    await requireAdmin();
    const summary = await assignImagesForMissing({
      timeBudgetMs: 8000, // fits Vercel Free function limit (~10s)
      limit: 15,
    });
    revalidatePath("/admin/pricing");
    return { success: true, message: JSON.stringify(summary) };
  } catch (e) {
    console.error("[admin] runImageJobAction failed:", e);
    return { error: e instanceof Error ? e.message : "Image job failed" };
  }
}
