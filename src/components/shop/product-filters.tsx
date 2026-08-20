"use client";

/**
 * Minimal, professional filter toolbar for the /products catalogue.
 * Single elegant row: search (with merged pill search button), category,
 * sort and size. Below it a compact price slider and quality pills.
 * - Autocomplete: typing a partial word shows matching products / levels;
 *   clicking a suggestion filters the grid immediately.
 * - The Search button applies any single field or combination.
 * - Price slider (debounced) and quality pills apply instantly.
 * - Applied filters live in the URL; the bar resyncs on external navigation.
 */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Package, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductFilterCategories {
  name: string;
  slug: string;
  count: number;
}

export interface SearchResult {
  products: { id: string; name: string; slug: string; price: string }[];
  nav: { id: string; name: string; slug: string }[];
}

export interface ProductFiltersProps {
  categories: ProductFilterCategories[];
  total: number;
  initial: {
    category: string;
    q: string;
    sort: string;
    min: number | null;
    max: number | null;
    size: string;
    tier: string;
    nav: string;
  };
}

const PRICE_MIN = 0;
const PRICE_MAX = 500000;
const PRICE_STEP = 100;

const SIZES = [
  "1",
  "2",
  "3",
  "3.5",
  "4.5",
  "5",
  "5.5",
  "6.5",
  "7.5",
  "8.5",
  "9",
  "10",
  "11",
  "12",
  "14",
  "15",
];

const TIERS = [
  { value: "", label: "All Qualities" },
  { value: "budget", label: "Budget" },
  { value: "premium", label: "Premium" },
  { value: "deluxe", label: "Deluxe & Certified" },
];

const SORTS = [
  { value: "featured", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name" },
];

type FilterField = "category" | "q" | "sort" | "min" | "max" | "size" | "tier";
const ALL_FIELDS: FilterField[] = ["category", "q", "sort", "min", "max", "size", "tier"];

function formatINR(n: number): string {
  return `₹${new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;
}

const fieldClass =
  "h-10 w-full rounded-xl border border-white/15 bg-[#0B1120]/80 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#FACC15]/60 focus:ring-2 focus:ring-[#FACC15]/20";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400";

export function ProductFilters({ categories, total, initial }: ProductFiltersProps) {
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(initial.category);
  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState(initial.sort || "featured");
  const [min, setMin] = useState(initial.min ?? PRICE_MIN);
  const [max, setMax] = useState(initial.max ?? PRICE_MAX);
  const [size, setSize] = useState(initial.size);
  const [tier, setTier] = useState(initial.tier);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [results, setResults] = useState<SearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchRef.current) clearTimeout(searchRef.current);
  }, []);

  // Resync the bar whenever the URL changes externally (nav clicks, header
  // navigation, pagination, back button).
  const urlKey = searchParams.toString();
  useEffect(() => {
    const sp = searchParams;
    setCategory(sp.get("category") ?? "");
    setQ(sp.get("q") ?? "");
    setSort(sp.get("sort") || "featured");
    setMin(Number.parseInt(sp.get("min") ?? "", 10) || PRICE_MIN);
    setMax(Number.parseInt(sp.get("max") ?? "", 10) || PRICE_MAX);
    setSize(sp.get("size") ?? "");
    setTier(sp.get("tier") ?? "");
    setResults(null);
    setShowResults(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  const hasFilters =
    category !== "" ||
    q.trim() !== "" ||
    sort !== "featured" ||
    min > PRICE_MIN ||
    max < PRICE_MAX ||
    size !== "" ||
    tier !== "" ||
    initial.nav !== "";

  /** Rewrite the URL query string. Only `fields` are re-applied from state;
   * everything already applied in the URL is preserved. */
  const apply = (
    patch: Partial<Record<FilterField, string | number | null>> = {},
    fields: FilterField[] = ALL_FIELDS
  ) => {
    const merged: Record<FilterField, string | number | null> = {
      category,
      q,
      sort,
      min,
      max,
      size,
      tier,
      ...patch,
    };
    const p = new URLSearchParams(searchParams.toString());
    for (const f of fields) {
      const v = merged[f];
      const empty =
        v == null ||
        v === "" ||
        (f === "sort" && v === "featured") ||
        (f === "min" && v === PRICE_MIN) ||
        (f === "max" && v === PRICE_MAX);
      if (empty) p.delete(f);
      else p.set(f, String(v));
    }
    p.delete("page");
    const qs = p.toString();
    window.location.assign(qs ? `/products?${qs}` : "/products");
  };

  const scheduleSlider = (patch: Partial<{ min: number; max: number }>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => apply(patch, ["min", "max"]), 350);
  };

  const clearAll = () => {
    setCategory("");
    setQ("");
    setSort("featured");
    setMin(PRICE_MIN);
    setMax(PRICE_MAX);
    setSize("");
    setTier("");
    setResults(null);
    setShowResults(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchRef.current) clearTimeout(searchRef.current);
    window.location.assign("/products");
  };

  // Debounced autocomplete against the search API.
  const runSearch = (value: string) => {
    if (searchRef.current) clearTimeout(searchRef.current);
    const v = value.trim();
    if (v.length < 2) {
      setResults(null);
      setShowResults(false);
      return;
    }
    searchRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(v)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as SearchResult;
        setResults(data);
        setShowResults(true);
      } catch {
        // ignore network errors
      } finally {
        setSearching(false);
      }
    }, 250);
  };

  const pickProduct = (name: string) => {
    setQ(name);
    setShowResults(false);
    apply({ q: name }, ["q"]);
  };

  const pickNav = (slug: string) => {
    setQ("");
    setShowResults(false);
    window.location.assign(`/products?nav=${slug}`);
  };

  return (
    <div className="mb-8 overflow-visible rounded-2xl border border-white/15 bg-white/[0.05] shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      {/* Toolbar header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5 sm:px-5">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#FACC15]" />
          Refine {total} Products
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:border-red-400/50 hover:text-red-300"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        ) : null}
      </div>

      <div className="px-4 py-3 sm:px-5">
        {/* Main filter row: Search | Category | Sort By | Size */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search field with merged pill search button */}
          <div className="relative">
            <label htmlFor="jf-q" className={labelClass}>
              Search
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowResults(false);
                apply();
              }}
            >
              <div className="flex h-10 items-center overflow-hidden rounded-xl border border-white/15 bg-[#0B1120]/80 transition focus-within:border-[#FACC15]/60 focus-within:ring-2 focus-within:ring-[#FACC15]/20">
                <Search className="pointer-events-none ml-3 h-4 w-4 shrink-0 text-slate-500" />
                <input
                  id="jf-q"
                  type="search"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    runSearch(e.target.value);
                  }}
                  onFocus={() => {
                    if (results && results.products.length + results.nav.length > 0) setShowResults(true);
                  }}
                  onBlur={() => setTimeout(() => setShowResults(false), 150)}
                  placeholder="Stone, mala, yantra…"
                  className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500"
                />
                {searching ? (
                  <span className="mr-1 h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#FACC15]/40 border-t-[#FACC15]" />
                ) : null}
                <button
                  type="submit"
                  aria-label="Search"
                  title="Search"
                  className="mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] text-slate-900 shadow-[0_4px_14px_rgba(250,204,21,0.4)] transition hover:brightness-110 active:scale-95"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            {showResults && results && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-[#0B1120] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                {results.nav.length > 0 ? (
                  <div className="border-b border-white/10 py-1">
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FACC15]/70">
                      Categories / Levels
                    </p>
                    {results.nav.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickNav(n.slug)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
                      >
                        <GitBranch className="h-3.5 w-3.5 shrink-0 text-[#B8860B]" />
                        {n.name}
                      </button>
                    ))}
                  </div>
                ) : null}
                {results.products.length > 0 ? (
                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FACC15]/70">
                      Products
                    </p>
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickProduct(p.name)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
                      >
                        <Package className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        <span className="shrink-0 text-xs text-[#FACC15]">{formatINR(Number(p.price))}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {results.products.length === 0 && results.nav.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-slate-500">No matches found.</p>
                ) : null}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="jf-cat" className={labelClass}>
              Category
            </label>
            <select
              id="jf-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
            >
              <option value="">All Categories ({total})</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="jf-sort" className={labelClass}>
              Sort By
            </label>
            <select
              id="jf-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={fieldClass}
            >
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Size / Carat */}
          <div>
            <label htmlFor="jf-size" className={labelClass}>
              Size / Carat (Gemstones)
            </label>
            <select
              id="jf-size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className={fieldClass}
            >
              <option value="">Any Size</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} Carat
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary row: compact price slider + quality pills */}
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between">
              <span className={labelClass}>Price Range</span>
              <span className="text-[11px] font-semibold text-[#FACC15]">
                {formatINR(min)} – {formatINR(max)}
              </span>
            </div>
            <div className="relative h-5">
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316]"
                style={{
                  left: `${((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                  right: `${100 - ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                }}
              />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={min}
                aria-label="Minimum price"
                onChange={(e) => {
                  const v = Math.min(Number(e.target.value), max - PRICE_STEP);
                  setMin(v);
                  scheduleSlider({ min: v });
                }}
                className="jf-slider"
              />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={max}
                aria-label="Maximum price"
                onChange={(e) => {
                  const v = Math.max(Number(e.target.value), min + PRICE_STEP);
                  setMax(v);
                  scheduleSlider({ max: v });
                }}
                className="jf-slider"
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {TIERS.map((t) => {
              const active = tier === t.value;
              return (
                <button
                  key={t.value || "all"}
                  type="button"
                  onClick={() => {
                    setTier(t.value);
                    apply({ tier: t.value }, ["tier"]);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] text-slate-900 shadow-[0_4px_16px_rgba(250,204,21,0.35)]"
                      : "border border-white/15 bg-white/5 text-slate-300 hover:border-[#D4AF37]/50 hover:text-[#FACC15]"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .jf-slider { -webkit-appearance: none; appearance: none; position: absolute; inset: 0; width: 100%; height: 100%; background: transparent; pointer-events: none; margin: 0; }
        .jf-slider::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; height: 14px; width: 14px; border-radius: 9999px; background: linear-gradient(135deg, #FACC15, #F97316); border: 2px solid #0B1120; box-shadow: 0 0 0 1px rgba(250,204,21,0.5), 0 4px 12px rgba(0,0,0,0.5); cursor: grab; }
        .jf-slider::-moz-range-thumb { pointer-events: auto; height: 12px; width: 12px; border-radius: 9999px; background: linear-gradient(135deg, #FACC15, #F97316); border: 2px solid #0B1120; cursor: grab; }
      `}</style>
    </div>
  );
}