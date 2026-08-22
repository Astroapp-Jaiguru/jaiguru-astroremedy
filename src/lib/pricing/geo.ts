import { headers } from "next/headers";
import { getPricingSettings, type CurrencyConfig, type PricingSettings } from "@/lib/pricing/settings";

/**
 * Geo-aware price display. The proxy stamps `x-viewer-country` (from
 * Vercel's x-vercel-ip-country or Cloudflare's cf-ipcountry) on every
 * request. When the global pricing toggle is ON and the viewer is outside
 * the base country, prices are shown converted to the viewer's local
 * currency with a 30% (configurable) markup and .99 rounding.
 *
 * Conversion only ever affects the DISPLAYED price. The INR price in the
 * database is never modified by this layer.
 */

export type ViewerCurrency = {
  code: string;
  config: CurrencyConfig;
};

/** Country of the current viewer ("IN" when unknown/domestic). */
export async function getViewerCountry(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-viewer-country") || "IN";
  } catch {
    return "IN";
  }
}

/** Pick the viewer's currency from the settings table. */
export function currencyForCountry(
  country: string,
  settings: PricingSettings
): ViewerCurrency | null {
  const map: Record<string, string> = {
    US: "USD",
    GB: "GBP",
    UK: "GBP",
    EU: "EUR",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    ES: "EUR",
    NL: "EUR",
    BE: "EUR",
    AT: "EUR",
    IE: "EUR",
    PT: "EUR",
    FI: "EUR",
    GR: "EUR",
    LU: "EUR",
    SK: "EUR",
    SI: "EUR",
    EE: "EUR",
    LV: "EUR",
    LT: "EUR",
    CY: "EUR",
    MT: "EUR",
    HR: "EUR",
  };
  const code = map[country];
  if (!code) return null;
  const config = settings.currencies[code];
  if (!config) return null;
  return { code, config };
}

export interface DisplayPrice {
  amount: string; // numeric string for messages ("1998.99")
  label: string; // fully formatted ("$1,998.99")
  code: string; // "USD"
  symbol: string; // "$"
  note: string; // disclosure line
}

/**
 * Convert an INR amount for the current viewer. Returns null when the
 * toggle is off or the viewer is in the base country.
 */
export async function displayPriceForViewer(
  inr: string | number | { toString(): string } | null | undefined
): Promise<DisplayPrice | null> {
  if (inr === null || inr === undefined) return null;
  const settings = await getPricingSettings();
  if (!settings.enabled) return null;
  const country = await getViewerCountry();
  if (country === settings.baseCountry) return null;
  const currency = currencyForCountry(country, settings);
  if (!currency) return null;

  const base = Number.parseFloat(inr.toString());
  if (!Number.isFinite(base) || base <= 0) return null;

  const multiplied = base * (1 + settings.markup) * currency.config.rate;
  // .99 rounding: just below the next whole unit.
  const amount = Math.max(0.99, Math.ceil(multiplied) - 0.01);

  const label = new Intl.NumberFormat(currency.config.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return {
    amount: amount.toFixed(2),
    label,
    code: currency.code,
    symbol: currency.config.symbol,
    note: settings.disclosure,
  };
}

/** Effective price + optional original (strikethrough) price, both converted. */
export async function productPriceDisplay(
  effectiveInr: string | number | { toString(): string } | null | undefined,
  originalInr: string | number | { toString(): string } | null | undefined
): Promise<{
  effective: DisplayPrice | null;
  original: DisplayPrice | null;
}> {
  if (!(await getPricingSettings()).enabled) return { effective: null, original: null };
  const [effective, original] = await Promise.all([
    displayPriceForViewer(effectiveInr),
    displayPriceForViewer(originalInr),
  ]);
  return { effective, original };
}

export interface ServicePriceDisplay {
  label: string;
  amount: string;
  note: string | null;
}

/**
 * Convert a service price for the viewer. A manual priceLabel always wins
 * (hand-written labels like "On Request" are never converted).
 */
export async function servicePriceDisplay(
  price: string | number | { toString(): string } | null | undefined,
  priceLabel: string | null | undefined
): Promise<ServicePriceDisplay | null> {
  if (priceLabel) return null;
  if (price === null || price === undefined) return null;
  const n = Number.parseFloat(price.toString());
  if (!Number.isFinite(n) || n <= 0) return null;
  const d = await displayPriceForViewer(n);
  return d ? { label: d.label, amount: d.amount, note: d.note } : null;
}
