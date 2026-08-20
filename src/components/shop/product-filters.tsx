"use client";

/**
 * Premium glassmorphism filter bar for the /products catalogue.
 * Dual-thumb price slider, category / size / tier filters, autocomplete
 * search (products + navigation levels) and sort. Every change re-writes the
 * URL query string so filtering stays shareable and server-rendered.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

function formatINR(n: number): string {
  return `₹${new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;
}

const glassField =
  "h-10 w-full rounded-xl border border-white/15 bg-[#0B1120]/80 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#FACC15]/60 focus:ring-2 focus:ring-[#FACC15]/20";

const glassLabel =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#FACC15]/70";

export function ProductFilters({ categories, total, initial }: ProductFiltersProps) {
  const router = useRouter();
  const [category, setCategory] = useState(initial.category);
  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState(initial.sort || "featured");
  const [min, setMin] = useState(initial.min ?? PRICE_MIN);
  const [max, setMax] = useState(initial.max ?? PRICE_MAX);
  const [size, setSize] = useState(initial.size);
  const [tier, setTier] = useState(initial.tier);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autocomplete state.
  const [results, setResults] = useState<SearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchRef.current) clearTimeout(searchRef.current);
  }, []);

  const hasFilters =
    category !== "" || q.trim() !== "" || min > PRICE_MIN || max < PRICE_MAX || size !== "" || tier !== "" || initial.nav !== "";

  const apply = (patch?: Partial<{ category: string; q: string; sort: string; min: number; max: number; size: string; tier: string }>) => {
    const p = new URLSearchParams();
    const merged = {
      category: category ?? "",
      q: q ?? "",
      sort,
      min,
      max,
      size: size ?? "",
      tier: tier ?? "",
      ...patch,
    };
    if (initial.nav) p.set("nav", initial.nav);
    if (merged.category) p.set("category", merged.category);
    if (merged.q.trim()) p.set("q", merged.q.trim());
    if (merged.sort && merged.sort !== "featured") p.set("sort", merged.sort);
    if (merged.min > PRICE_MIN) p.set("min", String(merged.min));
    if (merged.max < PRICE_MAX) p.set("max", String(merged.max));
    if (merged.size) p.set("size", merged.size);
    if (merged.tier) p.set("tier", merged.tier);
    const qs = p.toString();
    router.push(qs ? `/products?${qs}` : "/products", { scroll: false });
  };

  const scheduleSlider = (patch: Partial<{ min: number; max: number }>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => apply(patch), 350);
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
    router.push("/products", { scroll: false });
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
    apply({ q: name });
  };

  const pickNav = (slug: string) => {
    setQ("");
    setShowResults(false);
    router.push(`/products?nav=${slug}`, { scroll: false });
  };

  return (
    <div className="mb-10 rounded-2xl border border-white/15 bg-white/[0.06] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <style>{`
        .jf-slider { -webkit-appearance: none; appearance: none; position: absolute; inset: 0; width: 100%; height: 100%; background: transparent; pointer-events: none; margin: 0; }
        .jf-slider::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; height: 18px; width: 18px; border-radius: 9999px; background: linear-gradient(135deg, #FACC15, #F97316); border: 2px solid #0B1120; box-shadow: 0 0 0 1px rgba(250,204,21,0.5), 0 4px 12px rgba(0,0,0,0.5); cursor: grab; }
        .jf-slider::-moz-range-thumb { pointer-events: auto; height: 16px; width: 16px; border-radius: 9999px; background: linear-gradient(135deg, #FACC15, #F97316); border: 2px solid #0B1120; cursor: grab; }
      `}</style>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <SlidersHorizontal className="h-4 w-4 text-[#FACC15]" />
          Refine {total} Products
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            <X className="h-3.5 w-3.5" />
            Clear all filters
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search with autocomplete */}
        <div className="sm:col-span-2 lg:col-span-1 relative">
          <label htmlFor="jf-q" className={glassLabel}>
            Search
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowResults(false);
              apply();
            }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
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
                className={`${glassField} pl-9`}
              />
              {searching ? (
                <span className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-[#FACC15]/40 border-t-[#FACC15]" />
              ) : null}
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
          <label htmlFor="jf-cat" className={glassLabel}>
            Category
          </label>
          <select
            id="jf-cat"
            value={category}
            onChange={(e) => {
              const v = e.target.value;
              setCategory(v);
              apply({ category: v });
            }}
            className={glassField}
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
          <label htmlFor="jf-sort" className={glassLabel}>
            Sort By
          </label>
          <select
            id="jf-sort"
            value={sort}
            onChange={(e) => {
              const v = e.target.value;
              setSort(v);
              apply({ sort: v });
            }}
            className={glassField}
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
          <label htmlFor="jf-size" className={glassLabel}>
            Size / Carat (Gemstones)
          </label>
          <select
            id="jf-size"
            value={size}
            onChange={(e) => {
              const v = e.target.value;
              setSize(v);
              apply({ size: v });
            }}
            className={glassField}
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

      {/* Price range */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className={glassLabel}>Price Range</span>
          <span className="text-xs font-semibold text-[#FACC15]">
            {formatINR(min)} – {formatINR(max)}
          </span>
        </div>
        <div className="relative h-8">
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316]"
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

      {/* Quality tier pills */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className={cn(glassLabel, "mb-0 mr-1 self-center")}>Quality: </span>
        {TIERS.map((t) => {
          const active = tier === t.value;
          return (
            <button
              key={t.value || "all"}
              type="button"
              onClick={() => {
                setTier(t.value);
                apply({ tier: t.value });
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] text-slate-900 shadow-[0_6px_20px_rgba(250,204,21,0.35)]"
                  : "border border-white/15 bg-white/5 text-slate-300 hover:border-[#D4AF37]/50 hover:text-[#FACC15]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}