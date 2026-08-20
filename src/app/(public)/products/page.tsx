import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProductCard } from "@/components/shop/product-card";
import { ProductFilters } from "@/components/shop/product-filters";
import { type FeaturedProduct } from "@/lib/shop-data";
import { navSubtreeIds } from "@/lib/product-navigation";

/**
 * Products catalogue (scope §7.6 / §15). All products with pagination,
 * category filters, navigation-level filters (from the header "Product List"
 * menu), search, price range, size/carat, quality tier and sorting. Every
 * filter lives in the URL so views are shareable and server-rendered.
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

const SIZES = new Set([
  "1", "2", "3", "3.5", "4.5", "5", "5.5", "6.5", "7.5", "8.5", "9", "10", "11", "12", "14", "15",
]);
const TIERS = new Set(["budget", "premium", "deluxe"]);

function filterHref(sp: Awaited<PageProps["searchParams"]>, page: number): string {
  const p = new URLSearchParams();
  for (const key of ["category", "nav", "q", "sort", "min", "max", "size", "tier"] as const) {
    const v = param(sp, key);
    if (v) p.set(key, v);
  }
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(param(sp, "page"), 10) || 1);
  const categorySlug = param(sp, "category");
  const navSlug = param(sp, "nav");
  const q = param(sp, "q").trim();
  const sort = param(sp, "sort") in SORTS ? param(sp, "sort") : "featured";

  const minRaw = Number.parseInt(param(sp, "min"), 10);
  const maxRaw = Number.parseInt(param(sp, "max"), 10);
  const min = Number.isFinite(minRaw) && minRaw > 0 ? minRaw : null;
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : null;
  const size = SIZES.has(param(sp, "size")) ? param(sp, "size") : "";
  const tier = TIERS.has(param(sp, "tier")) ? param(sp, "tier") : "";

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

  const navNodes = await prisma.productNavigation.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      kind: true,
      parentId: true,
      isActive: true,
      sortOrder: true,
    },
  });

  // Resolve the navigation filter: a node filters the whole subtree below it.
  // A "size" leaf filters its parent subtree by an exact sizeOptions label.
  const navNode = navSlug ? navNodes.find((n) => n.slug === navSlug && n.isActive) : null;
  let navName: string | null = navNode?.name ?? null;
  let navFilter: { navigationId: { in: string[] } } | { id: { in: string[] } } | null = null;
  if (navNode) {
    if (navNode.kind === "size" && navNode.parentId) {
      const parent = navNodes.find((n) => n.id === navNode.parentId);
      if (parent) {
        const subIds = [...navSubtreeIds(navNodes, parent.id)];
        const candidates = await prisma.product.findMany({
          where: { navigationId: { in: subIds }, isActive: true },
          select: { id: true, sizeOptions: true },
        });
        const ids = candidates
          .filter((p) =>
            Array.isArray(p.sizeOptions) &&
            (p.sizeOptions as { label?: string }[]).some((o) => o?.label === navNode.name)
          )
          .map((p) => p.id);
        navFilter = { id: { in: ids } };
      }
    } else {
      const subIds = [...navSubtreeIds(navNodes, navNode.id)];
      navFilter = { navigationId: { in: subIds } };
    }
  }

  const isValidCategory = categories.some((c) => c.slug === categorySlug);
  const priceFilter =
    min != null || max != null
      ? {
          price: {
            ...(min != null ? { gte: min } : {}),
            ...(max != null ? { lte: max } : {}),
          },
        }
      : {};
  const where = {
    isActive: true,
    ...(isValidCategory ? { category: { slug: categorySlug } } : {}),
    ...(navFilter ?? {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { tags: { has: q } }] } : {}),
    ...priceFilter,
    ...(size ? { tags: { has: `${size}-carat` } } : {}),
    ...(tier ? { tags: { has: `tier-${tier}` } } : {}),
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
    hasVariants: Array.isArray((p as unknown as { sizeOptions?: unknown }).sizeOptions),
  }));

  const activeCategory = categories.find((c) => c.slug === categorySlug) ?? null;
  const title = navName ?? (activeCategory ? activeCategory.name.replace(/s$/, "") : "Products");

  return (
    <section className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Divine Shop"
          title={title}
          highlight="Catalogue"
          subtitle="Energised spiritual items, blessed gemstones, vastu corrections and yoga essentials. Every item available for home delivery."
        />

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

        {/* Premium filter bar */}
        <ProductFilters
          categories={categories.map((c) => ({
            name: c.name,
            slug: c.slug,
            count: c._count.products,
          }))}
          total={total}
          initial={{
            category: isValidCategory ? categorySlug : "",
            q,
            sort,
            min,
            max,
            size,
            tier,
            nav: navNode ? navSlug : "",
          }}
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
                    href={filterHref(sp, current - 1)}
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
                      href={filterHref(sp, n)}
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
                    href={filterHref(sp, current + 1)}
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