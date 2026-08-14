/**
 * Free, royalty-free images for products and services via the official
 * Unsplash Search API (requires UNSPLASH_ACCESS_KEY). Unsplash images are
 * free to use under the Unsplash License; the pipeline credits the author.
 * No paid generators (DALL-E / Flux / other AI) are ever used.
 */

export interface UnsplashHit {
  url: string; // high-resolution cdn url (1920px wide)
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
  [/rudraksha/i, "rudraksha beads"],
  [/mala|japa/i, "rudraksha mala beads"],
  [/gemstone|stone|jewel|astro gems/i, "gemstone crystal"],
  [/crystal/i, "crystals minerals"],
  [/shiva linga|shivling/i, "shiva lingam stone"],
  [/yantra/i, "yantra"],
  [/buddha/i, "buddha statue"],
  [/money frog|frog/i, "frog figurine"],
  [/tortoise|turtle/i, "turtle figurine"],
  [/vastu/i, "hindu temple architecture"],
  [/kuber|lakshmi|ganesh|navagraha|shiva|krishna|hanuman|durga|saraswati|sai ram|ram darbar|deity/i, "hindu deity statue"],
  [/kalash|kalasam/i, "brass pot temple"],
  [/diya|deepak|lamps\b|lamp/i, "oil lamp"],
  [/singing bowl/i, "tibetan singing bowl"],
  [/trishul/i, "hindu trident"],
  [/shankh|conch/i, "conch shell"],
  [/om\b|omkar|aum/i, "om symbol"],
  [/swastik/i, "hindu symbol"],
  [/pyramid/i, "pyramid crystal"],
  [/urli|bowl/i, "brass bowl"],
  [/tree of life|kalpavriksha/i, "tree of life"],
  [/incense|agarbatti|dhoop/i, "incense sticks"],
  [/yoga/i, "yoga equipment"],
  [/meditat/i, "meditation"],
  [/astrolog/i, "astrology"],
  [/reiki|healing/i, "reiki healing"],
  [/tarot/i, "tarot cards"],
  [/numerolog/i, "numbers spiritual"],
  [/vibrant|energ|bridge/i, "energy crystal"],
];

/** Map service names / categories -> search terms. */
const SERVICE_KEYWORD_MAP: Array<[RegExp, string]> = [
  [/astrolog/i, "astrology consultation"],
  [/yoga/i, "yoga class"],
  [/meditat|spiritual/i, "meditation"],
  [/vastu/i, "hindu temple architecture"],
  [/numerolog/i, "numerology"],
  [/reiki|healing/i, "reiki healing"],
  [/tarot|palm/i, "tarot cards"],
  [/course|class|package|guidance|beginner|advanced/i, "spiritual study"],
];

/** Remove size/variant qualifiers that pollute search queries. */
function stripVariants(name: string): string {
  return name
    .replace(/[-–—]\s*(budget|deluxe|premium)\b/gi, " ")
    .replace(/\(\s*(copper|gold|gold plated|brass|silver|wood|steel|pack of \d+|bundle|set of \d+)\s*\)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchKeyword(name: string, categoryName?: string): string {
  for (const [re, kw] of KEYWORD_MAP) {
    if (re.test(name)) return kw;
  }
  const fromCategory: Record<string, string> = {
    Yoga: "yoga equipment",
    Pooja: "pooja items temple",
    Gemstones: "gemstone crystal",
    Meditation: "meditation",
    Mala: "rudraksha mala",
    "Energy Products": "tibetan singing bowl",
    "Worship & Idols": "hindu deity statue",
  };
  if (categoryName && fromCategory[categoryName]) {
    return fromCategory[categoryName];
  }
  const clean = stripVariants(name).toLowerCase();
  const words = clean.split(/\s+/).filter((w) => w.length > 2 && !/^(budget|deluxe|premium)$/.test(w));
  return words.length >= 2 ? `${words.slice(0, 3).join(" ")} product` : "spiritual items";
}

export function searchServiceKeyword(name: string, categoryName?: string): string {
  for (const [re, kw] of SERVICE_KEYWORD_MAP) {
    if (re.test(name)) return kw;
  }
  if (categoryName) {
    const fromCategory: Record<string, string> = {
      "Astrology Course": "astrology consultation",
      "Yoga Course": "yoga class",
      Consultation: "astrology consultation",
    };
    if (fromCategory[categoryName]) return fromCategory[categoryName];
  }
  const words = name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  return words.length >= 2 ? words.slice(0, 3).join(" ") : "spiritual";
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Search Unsplash for a keyword and return the best hit at high resolution
 * (1920px wide, cropped to landscape). Retries transient 429/503 responses.
 * Resolves null when the key is missing, the request fails or nothing matches.
 */
export async function fetchUnsplash(
  keyword: string,
  timeoutMs = 6000
): Promise<UnsplashHit | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  const url = new URL(ENDPOINT);
  url.searchParams.set("query", keyword);
  url.searchParams.set("per_page", "5");
  url.searchParams.set("orientation", "landscape");

  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Client-ID ${key}` },
        signal: controller.signal,
        cache: "no-store",
      });
      if (res.status === 429 || res.status === 503) {
        await sleep(2000 * attempt);
        continue;
      }
      if (!res.ok) return null;
      const body = (await res.json()) as {
        results?: Array<{
          id: string;
          urls?: { raw?: string; regular?: string };
          user?: { name?: string };
        }>;
      };
      const hit = body.results?.find((r) => r?.urls?.raw);
      if (!hit?.urls?.raw) return null;
      let raw = hit.urls.raw;
      raw +=
        (raw.includes("?") ? "&" : "?") +
        "w=1920&q=80&fm=jpg&fit=crop&auto=format";
      return {
        url: raw,
        credit: `Photo by ${hit.user?.name ?? "Unsplash"} on Unsplash`,
        photoId: hit.id,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(t);
    }
  }
  return null;
}