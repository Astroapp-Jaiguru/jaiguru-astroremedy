import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ products: [], nav: [] });
  }

  const [products, nav] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, price: true },
      orderBy: { name: "asc" },
      take: 8,
    }),
    prisma.productNavigation.findMany({
      where: { isActive: true, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
      take: 6,
    }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: p.price.toString() })),
    nav,
  });
}