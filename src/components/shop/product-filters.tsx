"use client";

/**
 * Minimal filter toolbar for the /products catalogue.
 * A single clean glassmorphism card with four controls in one horizontal row:
 * search (with live autocomplete + Search button), category, sort and size.
 *
 * Controlled component - all filter state lives in the parent (ProductsShop)
 * so it can drive instant client-side grid updates:
 *  - Search field shows live autocomplete suggestions; clicking one applies
 *    that filter to the grid immediately.
 *  - The Search button applies every selected filter together.
 *  - Category / Sort By / Size dropdowns only stage their value - the grid
 *    updates when Search is clicked.
 */
import { useEffect, useRef, useState } from "react";
import { Search, Package, GitBranch, Layers } from "lucide-react";

export interface ProductFilterCategories {
  name: string;
  slug: string;
  count: number;
}

export interface SearchResult {
  products: { id: string; name: string; slug: string; price: string }[];
  nav: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
}

export interface FiltersState {
  category: string;
  q: string;
  sort: string;
  min: number;
  max: number;
  size: string;
  tier: string;
  nav: string;
}

export interface ProductFiltersProps {
  categories: ProductFilterCategories[];
  total: number;
  filters: FiltersState;
  /** Stage a dropdown field locally - grid is NOT updated until Search. */
  onStage: (patch: Partial<FiltersState>) => void;
  /** Apply a field to the grid immediately (autocomplete suggestions). */
  onInstant: (patch: Partial<FiltersState>) => void;
  /** Search button - applies every selected filter together. */
  onSubmit: () => void;
}

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

const fieldClass =
  "h-10 w-full rounded-xl border border-white/15 bg-[#0B1120]/80 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#FACC15]/60 focus:ring-2 focus:ring-[#FACC15]/20";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400";

export function ProductFilters({
  categories,
  total,
  filters,
  onStage,
  onInstant,
  onSubmit,
}: ProductFiltersProps) {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    },
    []
  );

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
    onStage({ q: name });
    setShowResults(false);
    onInstant({ q: name });
  };

  const pickNav = (slug: string) => {
    onStage({ q: "", nav: slug });
    setShowResults(false);
    onInstant({ q: "", nav: slug });
  };

  const pickCategory = (slug: string) => {
    onStage({ category: slug });
    setShowResults(false);
    onInstant({ category: slug });
  };

  return (
    <div className="relative z-50 mb-8 rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-4 shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:px-5">
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
              onSubmit();
            }}
          >
            <div className="flex h-10 items-center overflow-hidden rounded-xl border border-white/15 bg-[#0B1120]/80 transition focus-within:border-[#FACC15]/60 focus-within:ring-2 focus-within:ring-[#FACC15]/20">
              <Search className="pointer-events-none ml-3 h-4 w-4 shrink-0 text-slate-500" />
              <input
                id="jf-q"
                type="search"
                value={filters.q}
                onChange={(e) => {
                  onStage({ q: e.target.value });
                  runSearch(e.target.value);
                }}
                onFocus={() => {
                  if (results && results.products.length + results.nav.length + results.categories.length > 0)
                    setShowResults(true);
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

          {showResults && results ? (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[26rem] overflow-y-auto rounded-xl border border-[#D4AF37]/30 bg-[#0B1120] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
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
              {results.categories.length > 0 ? (
                <div className="border-b border-white/10 py-1">
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FACC15]/70">
                    Product Categories
                  </p>
                  {results.categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickCategory(c.slug)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <Layers className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                      {c.name}
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
              {results.products.length === 0 &&
              results.nav.length === 0 &&
              results.categories.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-slate-500">No matches found.</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="jf-cat" className={labelClass}>
            Category
          </label>
          <select
            id="jf-cat"
            value={filters.category}
            onChange={(e) => onStage({ category: e.target.value })}
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
            value={filters.sort}
            onChange={(e) => onStage({ sort: e.target.value })}
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
            value={filters.size}
            onChange={(e) => onStage({ size: e.target.value })}
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
    </div>
  );
}