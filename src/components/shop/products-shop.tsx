"use client";

/**
 * Client-side shop: owns the filter state, fetches the filtered grid from
 * GET /api/products/filter, keeps the URL query string in sync via
 * history.replaceState, and renders the filter bar, breadcrumb, grid and
 * pagination. Initial SSR data comes from the server page so the first
 * paint is identical to a full page load.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProductFilters, type FiltersState, type ProductFilterCategories } from "@/components/shop/product-filters";
import { ProductCardClient } from "@/components/shop/product-card-client";
import { Pagination } from "@/components/shop/pagination";
import type { ProductCardPayload } from "@/lib/products-filter";

export interface ProductsShopInitial {
  products: ProductCardPayload[];
  total: number;
  pages: number;
  current: number;
  navName: string | null;
  filters: FiltersState;
  title: string;
}

export function ProductsShop({
  categories,
  initial,
}: {
  categories: ProductFilterCategories[];
  initial: ProductsShopInitial;
}) {
  const [filters, setFilters] = useState<FiltersState>(initial.filters);
  const [products, setProducts] = useState<ProductCardPayload[]>(initial.products);
  const [total, setTotal] = useState(initial.total);
  const [pages, setPages] = useState(initial.pages);
  const [current, setCurrent] = useState(initial.current);
  const [navName, setNavName] = useState<string | null>(initial.navName);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const toQuery = useCallback((f: FiltersState, page: number) => {
    const p = new URLSearchParams();
    if (f.category) p.set("category", f.category);
    if (f.nav) p.set("nav", f.nav);
    if (f.q.trim()) p.set("q", f.q.trim());
    if (f.sort && f.sort !== "featured") p.set("sort", f.sort);
    if (f.min > 0) p.set("min", String(f.min));
    if (f.max < 500000) p.set("max", String(f.max));
    if (f.size) p.set("size", f.size);
    if (f.tier) p.set("tier", f.tier);
    if (page > 1) p.set("page", String(page));
    return p;
  }, []);

  const load = useCallback(
    async (next: FiltersState, page: number, replaceUrl: boolean) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      const qs = toQuery(next, page).toString();
      if (replaceUrl) {
        const url = qs ? `/products?${qs}` : "/products";
        window.history.replaceState(window.history.state, "", url);
      }
      try {
        const res = await fetch(`/api/products/filter?${qs}`, { cache: "no-store", signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as {
          products: ProductCardPayload[];
          total: number;
          pages: number;
          current: number;
          navName: string | null;
        };
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
        setCurrent(data.current);
        setNavName(data.navName);
      } catch {
        // aborted or network error - keep current grid
      } finally {
        setLoading(false);
      }
    },
    [toQuery]
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  const stage = useCallback((patch: Partial<FiltersState>) => {
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const instant = useCallback(
    (patch: Partial<FiltersState>) => {
      setFilters((f) => {
        const next = { ...f, ...patch, nav: patch.nav ?? f.nav };
        void load(next, 1, true);
        return next;
      });
    },
    [load]
  );

  const submit = useCallback(() => {
    setFilters((f) => {
      void load(f, 1, true);
      return f;
    });
  }, [load]);

  const clear = useCallback(() => {
    const empty: FiltersState = {
      category: "",
      q: "",
      sort: "featured",
      min: 0,
      max: 500000,
      size: "",
      tier: "",
      nav: "",
    };
    setFilters(empty);
    void load(empty, 1, true);
  }, [load]);

  const goPage = useCallback(
    (page: number) => {
      setFilters((f) => {
        void load(f, page, true);
        return f;
      });
    },
    [load]
  );

  const rangeStart = total === 0 ? 0 : (current - 1) * 12 + 1;
  const rangeEnd = Math.min(current * 12, total);

  return (
    <div>
      {navName ? (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Browsing:</span>
          <Link href="/products" className="font-semibold text-[#B8860B] hover:underline">
            All Products
          </Link>
          <span>→</span>
          <span className="font-semibold text-foreground">{navName}</span>
          <span className="ml-1 text-xs text-muted-foreground">({total} items)</span>
        </div>
      ) : null}

      <ProductFilters
        categories={categories}
        total={total}
        filters={filters}
        onStage={stage}
        onInstant={instant}
        onSubmit={submit}
        onClear={clear}
      />

      {products.length === 0 ? (
        <div className="rounded-[var(--jaiguru-card-radius)] border border-dashed border-premium-gold/30 bg-deep-navy/40 p-16 text-center">
          <p className="text-lg font-semibold text-[var(--jaiguru-page-text)]">No products found</p>
          <p className="mt-2 text-sm text-[color:var(--jaiguru-page-text-muted)]">
            Try a different category or search term.
          </p>
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-opacity duration-200 ${
              loading ? "opacity-50" : "opacity-100"
            }`}
          >
            {products.map((product) => (
              <ProductCardClient key={product.id} product={product} />
            ))}
          </div>

          <Pagination current={current} pages={pages} onPage={goPage} />
        </>
      )}

      <div className="mt-14 text-center text-xs text-slate-500">
        Showing {rangeStart}–{rangeEnd} of {total} products
      </div>
    </div>
  );
}