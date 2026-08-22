/**
 * UPI payment helpers — build UPI intent URIs and extract numeric amounts
 * from display price strings (shared by the payment modal on client).
 */

export const UPI_PAYEE_NAME = "ASTRO GEMS";

export function buildUpiUri(params: {
  pa: string;
  pn?: string;
  am?: string;
  cu?: string;
  tn?: string;
}): string {
  const parts: string[] = [];
  parts.push(`pa=${encodeURIComponent(params.pa)}`);
  parts.push(`pn=${encodeURIComponent(params.pn || UPI_PAYEE_NAME)}`);
  if (params.am && Number.isFinite(Number.parseFloat(params.am))) {
    parts.push(`am=${encodeURIComponent(params.am)}`);
  }
  parts.push(`cu=${encodeURIComponent(params.cu || "INR")}`);
  if (params.tn) parts.push(`tn=${encodeURIComponent(params.tn)}`);
  return `upi://pay?${parts.join("&")}`;
}

/** Parse a numeric amount out of a display price (e.g. "₹4,999", "700", "on request"). */
export function extractAmount(price: string | number | null | undefined): string {
  if (typeof price === "number" && Number.isFinite(price) && price > 0) {
    return String(Math.round(price * 100) / 100);
  }
  const s = String(price ?? "").replace(/[^0-9.-]/g, "");
  const n = Number.parseFloat(s);
  if (Number.isFinite(n) && n > 0) return String(n);
  return "";
}