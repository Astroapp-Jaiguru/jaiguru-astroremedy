import "server-only";
import { prisma } from "@/lib/prisma";
import { productPriceDisplay } from "@/lib/pricing/geo";
import { navSubtreeIds } from "@/lib/product-navigation";

/**
 * Shared catalogue query logic for /products. Used by the server-rendered
 * page (initial SSR view) and by GET /api/products/filter (client-side
 * instant grid updates). Every filter lives in the URL query string.
 */

export const PAGE_SIZE = 12;

export const SORTS: Record<string, { orderBy: Record<string, "asc" | "desc"> }> = {
  featured: { orderBy: { sortOrder: "asc" as const } },
  price_asc: { orderBy: { price: "asc" as const } },
  price_desc: { orderBy: { price: "desc" as const } },
  rating: { orderBy: { rating: "desc" as const } },
  newest: { orderBy: { createdAt: "desc" as const } },
  name: { orderBy: { name: "asc" as const } },
};

export const SIZES = new Set([
  "1", "2", "3", "3.5", "4.5", "5", "5.5", "6.5", "7.5", "8.5", "9", "10", "11", "12", "14", "15",
]);
export const TIERS = new Set(["budget", "premium", "deluxe"]);

export interface ProductsQuery {
  category: string;
  nav: string;
  q: string;
  sort: string;
  min: number | null;
  max: number | null;
  size: string;
  tier: string;
  page: number;
}

export interface NavNodeRow {
  id: string;
  name: string;
  slug: string;
  kind: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductCardPayload {
  id: string;
  name: string;
  slug: string;
  mainImage: string | null;
  subcategory: string | null;
  price: string;
  discountPrice: string | null;
  shortDescription: string | null;
  stockStatus: string;
  category: { name: string; slug: string } | null;
  isPopular: boolean;
  isNewArrival: boolean;
  rating: string;
  ratingCount: number;
  hasVariants: boolean;
  displayEffectiveLabel: string | null;
  displayOriginalLabel: string | null;
  displayNote: string | null;
}

export interface ProductsPageResult {
  products: ProductCardPayload[];
  total: number;
  pages: number;
  current: number;
  navName: string | null;
}

export function parseProductsQuery(sp: URLSearchParams): ProductsQuery {
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "", 10) || 1);
  const minRaw = Number.parseInt(sp.get("min") ?? "", 10);
  const maxRaw = Number.parseInt(sp.get("max") ?? "", 10);
  const sort = sp.get("sort") ?? "";
  return {
    category: sp.get("category") ?? "",
    nav: sp.get("nav") ?? "",
    q: (sp.get("q") ?? "").trim(),
    sort: sort in SORTS ? sort : "featured",
    min: Number.isFinite(minRaw) && minRaw > 0 ? minRaw : null,
    max: Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : null,
    size: SIZES.has(sp.get("size") ?? "") ? (sp.get("size") as string) : "",
    tier: TIERS.has(sp.get("tier") ?? "") ? (sp.get("tier") as string) : "",
    page,
  };
}

export async function fetchNavNodes(): Promise<NavNodeRow[]> {
  return prisma.productNavigation.findMany({
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
}

/**
 * Resolve the navigation filter: a node filters the whole subtree below it.
 * A "size" leaf filters its parent subtree by an exact sizeOptions label.
 */
export async function resolveNavFilter(
  navNodes: NavNodeRow[],
  navSlug: string
): Promise<{ navName: string | null; navFilter: { navigationId: { in: string[] } } | { id: { in: string[] } } | null }> {
  const navNode = navSlug ? navNodes.find((n) => n.slug === navSlug && n.isActive) : null;
  if (!navNode) return { navName: null, navFilter: null };
  if (navNode.kind === "size" && navNode.parentId) {
    const parent = navNodes.find((n) => n.id === navNode.parentId);
    if (parent) {
      const subIds = [...navSubtreeIds(navNodes, parent.id)];
      const candidates = await prisma.product.findMany({
        where: { navigationId: { in: subIds }, isActive: true },
        select: { id: true, sizeOptions: true },
      });
      const ids = candidates
        .filter(
          (p) =>
            Array.isArray(p.sizeOptions) &&
            (p.sizeOptions as { label?: string }[]).some((o) => o?.label === navNode.name)
        )
        .map((p) => p.id);
      return { navName: navNode.name, navFilter: { id: { in: ids } } };
    }
    return { navName: navNode.name, navFilter: null };
  }
  const subIds = [...navSubtreeIds(navNodes, navNode.id)];
  return { navName: navNode.name, navFilter: { navigationId: { in: subIds } } };
}

export async function toCardPayload(
  p: {
    id: string;
    name: string;
    slug: string;
    mainImage: string | null;
    subcategory: string | null;
    price: { toString(): string };
    discountPrice: { toString(): string } | null;
    shortDescription: string | null;
    stockStatus: string;
    category: { name: string; slug: string } | null;
    isPopular: boolean;
    isNewArrival: boolean;
    rating: { toString(): string };
    ratingCount: number;
    sizeOptions?: unknown;
  }
): Promise<ProductCardPayload> {
  const price = p.price.toString();
  const discountPrice = p.discountPrice ? p.discountPrice.toString() : null;
  const hasDiscount =
    discountPrice && Number.parseFloat(discountPrice) < Number.parseFloat(price);
  const display = await productPriceDisplay(
    discountPrice ?? price,
    hasDiscount ? price : null
  );
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    mainImage: p.mainImage,
    subcategory: p.subcategory,
    price,
    discountPrice,
    shortDescription: p.shortDescription,
    stockStatus: p.stockStatus,
    category: p.category,
    isPopular: p.isPopular,
    isNewArrival: p.isNewArrival,
    rating: p.rating.toString(),
    ratingCount: p.ratingCount,
    hasVariants: Array.isArray(p.sizeOptions),
    displayEffectiveLabel: display.effective?.label ?? null,
    displayOriginalLabel: display.original?.label ?? null,
    displayNote: display.effective?.note ?? null,
  };
}

/** Run the full filtered catalogue query (products + counts + pagination). */
export async function fetchProductsPage(
  query: ProductsQuery,
  navNodes: NavNodeRow[]
): Promise<ProductsPageResult> {
  const { navName, navFilter } = await resolveNavFilter(navNodes, query.nav);
  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  const isValidCategory = categories.some((c) => c.slug === query.category);
  const priceFilter =
    query.min != null || query.max != null
      ? {
          price: {
            ...(query.min != null ? { gte: query.min } : {}),
            ...(query.max != null ? { lte: query.max } : {}),
          },
        }
      : {};
  const where = {
    isActive: true,
    approvalStatus: "APPROVED" as const,
    ...(isValidCategory ? { category: { slug: query.category } } : {}),
    ...(navFilter ?? {}),
    ...(query.q ? { OR: [{ name: { contains: query.q, mode: "insensitive" as const } }, { tags: { has: query.q } }] } : {}),
    ...priceFilter,
    ...(query.size ? { tags: { has: `${query.size}-carat` } } : {}),
    ...(query.tier ? { tags: { has: `tier-${query.tier}` } } : {}),
  };

  const total = await prisma.product.count({ where });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(query.page, pages);

  const rows = await prisma.product.findMany({
    where,
    include: { category: { select: { name: true, slug: true } } },
    orderBy: SORTS[query.sort].orderBy,
    skip: (current - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const products = await Promise.all(rows.map(toCardPayload));
  return { products, total, pages, current, navName };
}
