import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProductCard } from "@/components/shop/product-card";
import { SortSelect } from "@/components/shop/sort-select";
import { type FeaturedProduct } from "@/lib/shop-data";

/**
 * Products catalogue (scope §7.6 / §15). All products with pagination,
 * category filters and sorting.
 */

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAGE_SIZE = 12;

const SORTS: Record<string, { orderBy: Record<string, "asc" | "desc"> }> = {
  featured: { orderBy: { sortOrder: "asc" as const } },
  price_asc: { orderBy: { price: "asc" as const } },
  price_desc: { orderBy: { price: "desc" as const } },
  rating: { orderBy: { rating: "desc" as const } },
  newest: { orderBy: { createdAt: "desc" as const } },
  name: { orderBy: { name: "asc" as const } },
};

function param(searchParams: Awaited<PageProps["searchParams"]>, key: string): string {
  const v = searchParams[key];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(param(sp, "page"), 10) || 1);
  const categorySlug = param(sp, "category");
  const q = param(sp, "q").trim();
  const sort = param(sp, "sort") in SORTS ? param(sp, "sort") : "featured";

  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    select: {
      name: true,
      slug: true,
      _count: {
        select: { products: { where: { isActive: true } } },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const isValidCategory = categories.some((c) => c.slug === categorySlug);
  const where = {
    isActive: true,
    ...(isValidCategory ? { category: { slug: categorySlug } } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { tags: { has: q } }] } : {}),
  };

  const total = await prisma.product.count({ where });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pages);

  const products = await prisma.product.findMany({
    where,
    include: { category: { select: { name: true, slug: true } } },
    orderBy: SORTS[sort].orderBy,
    skip: (current - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const cardData: FeaturedProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    mainImage: p.mainImage,
    subcategory: p.subcategory,
    price: p.price.toString(),
    discountPrice: p.discountPrice ? p.discountPrice.toString() : null,
    shortDescription: p.shortDescription,
    stockStatus: p.stockStatus,
    category: p.category,
    isPopular: p.isPopular,
    isNewArrival: p.isNewArrival,
    rating: p.rating.toString(),
    ratingCount: p.ratingCount,
  }));

  const activeCategory = categories.find((c) => c.slug === categorySlug) ?? null;

  return (
    <section className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Divine Shop"
          title={
            activeCategory ? activeCategory.name.replace(/s$/, "") : "Products"
          }
          highlight="Catalogue"
          subtitle="Energised spiritual items, blessed gemstones, vastu corrections and yoga essentials. Every item available for home delivery."
        />

        {/* Filter toolbar */}
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/products"
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                !isValidCategory
                  ? "bg-[#4C1D95] text-white"
                  : "border border-[#D4AF37]/40 text-[#FACC15] hover:bg-[#FACC15]/10"
              }`}
            >
              All ({total})
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  isValidCategory && categorySlug === c.slug
                    ? "bg-[#4C1D95] text-white"
                    : "border border-[#D4AF37]/40 text-[#FACC15] hover:bg-[#FACC15]/10"
                }`}
              >
                {c.name} ({c._count.products})
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form method="get" action="/products" className="flex w-full gap-2 sm:w-80">
              {isValidCategory ? (
                <input type="hidden" name="category" value={categorySlug} />
              ) : null}
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search products..."
                className="w-full rounded-full border border-[#D4AF37]/40 bg-[#0F172A]/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-full bg-[#4C1D95] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#3B0F82]"
              >
                Search
              </button>
            </form>

            <SortSelect defaultValue={sort} categorySlug={isValidCategory ? categorySlug : ""} q={q} />
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[var(--jaiguru-card-radius)] border border-dashed border-premium-gold/30 bg-deep-navy/40 p-16 text-center">
            <p className="text-lg font-semibold text-[var(--jaiguru-page-text)]">No products found</p>
            <p className="mt-2 text-sm text-[color:var(--jaiguru-page-text-muted)]">
              Try a different category or search term.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cardData.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 ? (
              <nav
                aria-label="Pagination"
                className="mt-12 flex flex-wrap items-center justify-center gap-2"
              >
                {current > 1 ? (
                  <Link
                    href={`/products?page=${current - 1}${
                      isValidCategory ? `&category=${categorySlug}` : ""
                    }${q ? `&q=${encodeURIComponent(q)}` : ""}${sort !== "featured" ? `&sort=${sort}` : ""}`}
                    className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#FACC15] transition hover:bg-[#FACC15]/10"
                  >
                    Previous
                  </Link>
                ) : null}
                {Array.from({ length: pages }).map((_, i) => {
                  const n = i + 1;
                  const isCurrent = n === current;
                  return (
                    <Link
                      key={n}
                      href={`/products?page=${n}${
                        isValidCategory ? `&category=${categorySlug}` : ""
                      }${q ? `&q=${encodeURIComponent(q)}` : ""}${sort !== "featured" ? `&sort=${sort}` : ""}`}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        isCurrent
                          ? "bg-[#4C1D95] font-semibold text-white"
                          : "border border-[#D4AF37]/40 text-[#FACC15] hover:bg-[#FACC15]/10"
                      }`}
                    >
                      {n}
                    </Link>
                  );
                })}
                {current < pages ? (
                  <Link
                    href={`/products?page=${current + 1}${
                      isValidCategory ? `&category=${categorySlug}` : ""
                    }${q ? `&q=${encodeURIComponent(q)}` : ""}${sort !== "featured" ? `&sort=${sort}` : ""}`}
                    className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#FACC15] transition hover:bg-[#FACC15]/10"
                  >
                    Next
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        )}

        <div className="mt-14 text-center text-xs text-slate-500">
          Showing {(current - 1) * PAGE_SIZE + 1}–
          {Math.min(current * PAGE_SIZE, total)} of {total} products
        </div>
      </div>
    </section>
  );
}