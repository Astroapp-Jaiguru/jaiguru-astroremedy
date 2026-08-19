"use client";

/**
 * Premium glassmorphism filter bar for the /products catalogue.
 * Dual-thumb price slider, category / size / tier filters, search and sort.
 * Every change re-writes the URL query string so filtering stays
 * shareable and server-rendered (force-dynamic page).
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, Tags, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductFilterCategories {
  name: string;
  slug: string;
  count: number;
}

export interface ProductFilterType {
  name: string;
  slug: string;
  icon: string | null;
  count: number;
  subtypes: { name: string; slug: string; count: number }[];
}

export interface ProductFiltersProps {
  categories: ProductFilterCategories[];
  types: ProductFilterType[];
  total: number;
  initial: {
    category: string;
    q: string;
    sort: string;
    min: number | null;
    max: number | null;
    size: string;
    tier: string;
    pt: string;
    st: string;
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

export function ProductFilters({ categories, types, total, initial }: ProductFiltersProps) {
  const router = useRouter();
  const [category, setCategory] = useState(initial.category);
  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState(initial.sort || "featured");
  const [min, setMin] = useState(initial.min ?? PRICE_MIN);
  const [max, setMax] = useState(initial.max ?? PRICE_MAX);
  const [size, setSize] = useState(initial.size);
  const [tier, setTier] = useState(initial.tier);
  const [pt, setPt] = useState(initial.pt);
  const [st, setSt] = useState(initial.st);
  const [expandedType, setExpandedType] = useState<string | null>(initial.pt || null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const hasFilters =
    category !== "" || q.trim() !== "" || min > PRICE_MIN || max < PRICE_MAX || size !== "" || tier !== "" || pt !== "" || st !== "";

  const apply = (patch?: Partial<{ category: string; q: string; sort: string; min: number; max: number; size: string; tier: string; pt: string; st: string }>) => {
    const p = new URLSearchParams();
    const merged = {
      category: category ?? "",
      q: q ?? "",
      sort,
      min,
      max,
      size: size ?? "",
      tier: tier ?? "",
      pt: pt ?? "",
      st: st ?? "",
      ...patch,
    };
    if (merged.category) p.set("category", merged.category);
    if (merged.q.trim()) p.set("q", merged.q.trim());
    if (merged.sort && merged.sort !== "featured") p.set("sort", merged.sort);
    if (merged.min > PRICE_MIN) p.set("min", String(merged.min));
    if (merged.max < PRICE_MAX) p.set("max", String(merged.max));
    if (merged.size) p.set("size", merged.size);
    if (merged.tier) p.set("tier", merged.tier);
    if (merged.pt) p.set("pt", merged.pt);
    if (merged.st) p.set("st", merged.st);
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
    setPt("");
    setSt("");
    setExpandedType(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push("/products", { scroll: false });
  };

  const selectType = (slug: string) => {
    if (pt === slug) {
      setExpandedType(expandedType === slug ? null : slug);
      return;
    }
    setPt(slug);
    setSt("");
    setExpandedType(slug);
    apply({ pt: slug, st: "" });
  };

  const selectSubtype = (typeSlug: string, subSlug: string) => {
    setPt(typeSlug);
    setSt(subSlug);
    apply({ pt: typeSlug, st: subSlug });
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
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="jf-q" className={glassLabel}>
            Search
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              apply();
            }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="jf-q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Stone, mala, yantra…"
                className={`${glassField} pl-9`}
              />
            </div>
          </form>
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
        <span className={glassLabel + " mb-0 mr-1 self-center"}>Quality: </span>
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

      {/* Product Type filter */}
      <div className="mt-5 border-t border-white/10 pt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#FACC15]/70">
            <Tags className="h-3.5 w-3.5" />
            Product Type
          </span>
          {pt ? (
            <button
              type="button"
              onClick={() => {
                setPt("");
                setSt("");
                setExpandedType(null);
                apply({ pt: "", st: "" });
              }}
              className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-[#D4AF37]/50 hover:text-[#FACC15]"
            >
              All Types
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => {
            const active = pt === t.slug;
            const expanded = expandedType === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => selectType(t.slug)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition",
                  active
                    ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] text-slate-900 shadow-[0_6px_20px_rgba(250,204,21,0.35)]"
                    : "border border-white/15 bg-white/5 text-slate-200 backdrop-blur hover:border-[#D4AF37]/50 hover:bg-white/10 hover:text-[#FACC15]"
                )}
              >
                {t.icon ? <span aria-hidden>{t.icon}</span> : null}
                {t.name}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-bold",
                    active ? "bg-slate-900/15 text-slate-900" : "bg-white/10 text-slate-400"
                  )}
                >
                  {t.count}
                </span>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform duration-300", expanded && "rotate-180")}
                />
              </button>
            );
          })}
        </div>

        {expandedType ? (
          <div className="mt-3 animate-in fade-in-0 slide-in-from-top-2 duration-300 rounded-2xl border border-[#D4AF37]/25 bg-white/[0.03] p-3.5">
            {(() => {
              const t = types.find((x) => x.slug === expandedType);
              if (!t || t.subtypes.length === 0)
                return (
                  <p className="text-xs text-slate-500">
                    No subtypes for this type yet.
                  </p>
                );
              return (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSt("");
                      apply({ pt: expandedType, st: "" });
                    }}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                      st === ""
                        ? "bg-[#D4AF37]/25 text-[#FACC15] ring-1 ring-[#D4AF37]/60"
                        : "border border-white/15 text-slate-400 hover:text-[#FACC15]"
                    )}
                  >
                    All {t.name}
                  </button>
                  {t.subtypes.map((s) => {
                    const active = st === s.slug;
                    return (
                      <button
                        key={s.slug}
                        type="button"
                        onClick={() => selectSubtype(expandedType, s.slug)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                          active
                            ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] text-slate-900 shadow-[0_5px_16px_rgba(250,204,21,0.3)]"
                            : "border border-white/15 bg-white/5 text-slate-200 hover:border-[#D4AF37]/50 hover:bg-white/10 hover:text-[#FACC15]"
                        )}
                      >
                        {s.name}
                        <span
                          className={cn(
                            "rounded-full px-1.5 text-[10px] font-bold",
                            active ? "bg-slate-900/15 text-slate-900" : "bg-white/10 text-slate-400"
                          )}
                        >
                          {s.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        ) : null}
      </div>
    </div>
  );
}