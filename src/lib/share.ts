/**
 * Social sharing helpers (shareable item pages).
 * Builds share URLs for WhatsApp, Facebook and X from a page title,
 * description and path — used by <ShareButtons /> and metadata.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.jaiguruastroremedy.com";

/** Absolute URL for a public path (e.g. "/products/5-mukhi-rudraksha-mala"). */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

/** WhatsApp share intent (wa.me without a number shares to any contact). */
export function whatsappShareUrl(params: {
  url: string;
  title: string;
  description?: string;
}): string {
  const text = [params.title, params.description, params.url]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Standard Facebook sharer dialog. */
export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/** Standard X (Twitter) intent. */
export function xShareUrl(params: {
  url: string;
  title: string;
  via?: string;
}): string {
  const qs = new URLSearchParams({ text: params.title, url: params.url });
  if (params.via) qs.set("via", params.via);
  return `https://twitter.com/intent/tweet?${qs.toString()}`;
}
