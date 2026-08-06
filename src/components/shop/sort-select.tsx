"use client";

/**
 * Client sort control for the /products catalogue.
 * Auto-submits on change, preserving category + search params.
 */
export function SortSelect({
  defaultValue,
  categorySlug,
  q,
}: {
  defaultValue: string;
  categorySlug: string;
  q: string;
}) {
  return (
    <form method="get" action="/products" className="flex items-center gap-2">
      {categorySlug ? <input type="hidden" name="category" value={categorySlug} /> : null}
      {q ? <input type="hidden" name="q" value={q} /> : null}
      <label htmlFor="sort" className="text-sm text-slate-400">
        Sort:
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={defaultValue}
        onChange={(e) => e.currentTarget.form?.submit()}
        className="rounded-full border border-[#D4AF37]/40 bg-[#0F172A]/60 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
      >
        <option value="featured">Recommended</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
        <option value="newest">Newest</option>
        <option value="name">Name</option>
      </select>
    </form>
  );
}