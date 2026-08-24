/**
 * Tiered certificate policy (pricing based on the product's base price):
 *  - ₹701 – ₹5,000  → "Lab Tested Certificate" (green badge, " – Lab Tested" suffix)
 *  - ₹5,000+        → "Lab Certified with Mine Test" (gold badge, " – Lab Certified with Mine Test" suffix)
 *  - ≤ ₹700         → no certificate badge / suffix
 */

export type CertificateTier = "certified" | "tested" | null;

export const CERTIFICATE_TIER_SUFFIX: Record<"certified" | "tested", string> = {
  certified: " – Lab Certified with Mine Test",
  tested: " – Lab Tested",
};

export const CERTIFICATE_TIER_LABEL: Record<"certified" | "tested", string> = {
  certified: "Lab Certified with Mine Test",
  tested: "Lab Tested Certificate",
};

/** Gold badge for the certified tier, green badge for the tested tier. */
export const CERTIFICATE_TIER_BADGE_CLASS: Record<"certified" | "tested", string> = {
  certified:
    "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FACC15] px-3 py-1 text-xs font-bold text-slate-900 shadow-[0_4px_14px_rgba(212,175,55,0.4)]",
  tested:
    "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#059669] to-[#25D366] px-3 py-1 text-xs font-bold text-white shadow-[0_4px_14px_rgba(37,211,102,0.35)]",
};

export function certificateTierForPrice(
  price: string | number | { toString(): string } | null | undefined
): CertificateTier {
  const n =
    typeof price === "number"
      ? price
      : Number.parseFloat(String(price ?? ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n > 5000) return "certified";
  if (n >= 701) return "tested";
  return null;
}

/** Append the certificate suffix unless the name already carries it. */
export function withCertificateSuffix(
  name: string,
  tier: CertificateTier
): string {
  if (!tier) return name;
  const suffix = CERTIFICATE_TIER_SUFFIX[tier];
  return name.endsWith(suffix) ? name : `${name}${suffix}`;
}
