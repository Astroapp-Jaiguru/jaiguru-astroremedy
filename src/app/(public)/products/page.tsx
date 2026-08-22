import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProductsShop } from "@/components/shop/products-shop";
import { ProductsNavBrowser } from "@/components/shop/products-nav-browser";
import { buildNavMenu } from "@/lib/product-navigation";
import { fetchNavNodes, fetchProductsPage, parseProductsQuery } from "@/lib/products-filter";

/**
 * Products catalogue (scope §7.6 / §15). Below the title sits only the
 * horizontal "Browse" menu (ProductsNavBrowser); the grid is server-
 * rendered from the URL query (?nav, ?category, ?q, ?sort, ?size, ...)
 * so views are shareable and page refreshes stay consistent. ProductsShop
 * adds client-side pagination against /api/products/filter while keeping
 * the URL in sync.
 */

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function param(searchParams: Awaited<PageProps["searchParams"]>, key: string): string {
  const v = searchParams[key];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const key of ["category", "nav", "q", "sort", "min", "max", "size", "tier", "page"] as const) {
    const v = param(sp, key);
    if (v) qs.set(key, v);
  }
  const query = parseProductsQuery(qs);

  const [categories, navNodes] = await Promise.all([
    prisma.productCategory.findMany({
      where: { isActive: true },
      select: {
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    fetchNavNodes(),
  ]);

  const result = await fetchProductsPage(query, navNodes);

  const activeCategory = categories.find((c) => c.slug === query.category) ?? null;
  const title = result.navName ?? (activeCategory ? activeCategory.name.replace(/s$/, "") : "Products");

  return (
    <section className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Divine Shop"
          title={title}
          highlight="Catalogue"
          subtitle="Energised spiritual items, blessed gemstones, vastu corrections and yoga essentials. Every item available for home delivery."
        />

        <ProductsNavBrowser items={buildNavMenu(navNodes)} />

        <ProductsShop
          initial={{
            products: result.products,
            total: result.total,
            pages: result.pages,
            current: result.current,
            navName: result.navName,
            title,
            filters: {
              category: query.category,
              q: query.q,
              sort: query.sort,
              min: query.min ?? 0,
              max: query.max ?? 500000,
              size: query.size,
              tier: query.tier,
              nav: query.nav,
            },
          }}
        />
      </div>
    </section>
  );
}