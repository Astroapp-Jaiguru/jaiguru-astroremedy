
/**
 * Safe competitor price lookups via the SerpApi Google Shopping API
 * (https://serpapi.com). The engine never scrapes websites directly and
 * only reads public shopping results. When SERPAPI_API_KEY is not set the
 * fetcher returns null and the pricing job reports itself as dormant.
 */

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";

/**
 * Parse an INR price string like "â‚¹1,999", "1,999", "â‚¹ 1,999.00".
 * Returns null for foreign-currency prices (e.g. "$25") so we never
 * compare apples to oranges.
 */
export function parseInrPrice(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (/[$â‚¬Â£]/.test(s)) return null; // foreign currency -> skip
  const digits = s.replace(/[^0-9.,]/g, "").replace(/,/g, "");
  const n = Number.parseFloat(digits);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

export interface CompetitorPriceResult {
  price: number;
  title: string | null;
  source: string | null;
  link: string | null;
}

export interface CompetitorFetchError {
  error: string;
}

/**
 * Fetch the cheapest/largest relevant result for a product query.
 * Returns the first usable INR price found in shopping_results.
 */
export async function fetchCompetitorPrice(
  query: string,
  timeoutMs = 12000
): Promise<CompetitorPriceResult | null> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return null;

  const url = new URL(SERPAPI_ENDPOINT);
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "in");
  url.searchParams.set("currency", "INR");
  url.searchParams.set("num", "5");
  url.searchParams.set("api_key", apiKey);

  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new Error(`SerpApi request failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (!res.ok) {
    throw new Error(`SerpApi responded ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    shopping_results?: Array<{
      price?: string;
      title?: string;
      source?: string;
      link?: string;
      price_matches?: number;
    }>;
    error?: string;
    error_code?: number;
  };

  if (json.error) {
    throw new Error(`SerpApi error: ${json.error} (code ${json.error_code ?? "?"})`);
  }

  for (const r of json.shopping_results ?? []) {
    const price = parseInrPrice(r.price);
    if (price !== null && price > 0) {
      return { price, title: r.title ?? null, source: r.source ?? null, link: r.link ?? null };
    }
  }
  return null;
}

/** Run many lookups with a small concurrency limit. */
export async function fetchCompetitorPrices(
  queries: Array<{ id: string; query: string }>,
  concurrency = 4,
  timeoutMs = 12000
): Promise<Map<string, CompetitorPriceResult | CompetitorFetchError | null>> {
  const out = new Map<string, CompetitorPriceResult | CompetitorFetchError | null>();
  let idx = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (idx < queries.length) {
      const item = queries[idx++];
      try {
        out.set(item.id, await fetchCompetitorPrice(item.query, timeoutMs));
      } catch (e) {
        out.set(item.id, { error: e instanceof Error ? e.message : String(e) });
      }
    }
  });
  await Promise.all(workers);
  return out;
}
