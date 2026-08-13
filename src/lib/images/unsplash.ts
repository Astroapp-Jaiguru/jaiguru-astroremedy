
/**
 * Unsplash fallback images for the automated image pipeline.
 * Uses the official Search API (requires UNSPLASH_ACCESS_KEY). The pipeline
 * treats Unsplash as "good enough for a placeholder" and credits the author;
 * products with manual uploads or AI-generated images are never touched.
 */

export interface UnsplashHit {
  url: string; // regular-size image url
  credit: string; // "Photo by <name> on Unsplash"
  photoId: string;
}

const ENDPOINT = "https://api.unsplash.com/search/photos";

/** Map common product words -> strong Unsplash search terms. */
const KEYWORD_MAP: Array<[RegExp, string]> = [
  [/ruby|manik/i, "ruby gemstone"],
  [/emerald|panna/i, "emerald gemstone"],
  [/sapphire|neelam/i, "sapphire gemstone"],
  [/pearl|moti/i, "natural pearl"],
  [/yoga/i, "yoga equipment"],
  [/incense|agarbatti|dhoop/i, "incense sticks"],
  [/rudraksha/i, "rudraksha beads"],
  [/gemstone|stone|jewel/i, "gemstone crystal"],
  [/mala|japa/i, "rudraksha mala beads"],
  [/crystal/i, "crystals minerals"],
  [/shiva linga|shivling/i, "shiva lingam stone"],
];

export function searchKeyword(name: string, categoryName?: string): string {
  for (const [re, kw] of KEYWORD_MAP) {
    if (re.test(name)) return kw;
  }
  const fromCategory: Record<string, string> = {
    Yoga: "yoga equipment",
    Pooja: "pooja items temple",
    Gemstones: "gemstone crystal",
    Meditation: "meditation candles",
    Mala: "rudraksha mala",
    "Energy Products": "tibetan singing bowl",
  };
  if (categoryName && fromCategory[categoryName]) {
    return fromCategory[categoryName];
  }
  const words = name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  return words.length >= 2 ? `${words.slice(0, 3).join(" ")} product` : "spiritual items";
}

/**
 * Search Unsplash for a keyword and return the best hit.
 * Resolves null when the key is missing, the request fails or nothing matches.
 */
export async function fetchUnsplash(
  keyword: string,
  timeoutMs = 4000
): Promise<UnsplashHit | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  const url = new URL(ENDPOINT);
  url.searchParams.set("query", keyword);
  url.searchParams.set("per_page", "3");
  url.searchParams.set("orientation", "landscape");

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      results?: Array<{
        id: string;
        urls?: { regular?: string };
        user?: { name?: string };
      }>;
    };
    const hit = body.results?.[0];
    if (!hit?.urls?.regular) return null;
    return {
      url: hit.urls.regular,
      credit: `Photo by ${hit.user?.name ?? "Unsplash"} on Unsplash`,
      photoId: hit.id,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}