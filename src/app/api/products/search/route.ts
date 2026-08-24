import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Autocomplete search for the /products filter bar. Case-insensitive
 * partial-word match against product titles, product categories and
 * navigation menu names, so queries like "blue", "neel" or "neelam"
 * surface every relevant product (e.g. Blue Sapphire (Neelam)).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ products: [], nav: [], categories: [] });
  }

  const contains = { contains: q, mode: "insensitive" as const };

  const [products, nav, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, name: contains },
      select: { id: true, name: true, slug: true, price: true },
      orderBy: { name: "asc" },
      take: 12,
    }),
    prisma.productNavigation.findMany({
      where: { isActive: true, name: contains },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
      take: 8,
    }),
    prisma.productCategory.findMany({
      where: { isActive: true, name: contains },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
      take: 4,
    }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: p.price.toString() })),
    nav,
    categories,
  });
}