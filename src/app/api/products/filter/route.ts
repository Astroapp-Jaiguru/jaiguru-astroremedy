import { NextResponse } from "next/server";
import { fetchNavNodes, fetchProductsPage, parseProductsQuery } from "@/lib/products-filter";

export const dynamic = "force-dynamic";

/**
 * Filtered catalogue query for the client-side grid in ProductsShop.
 * Mirrors the SSR /products page logic exactly; returns card payloads with
 * geo-aware display prices pre-computed server-side.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = parseProductsQuery(searchParams);
  const navNodes = await fetchNavNodes();
  const result = await fetchProductsPage(query, navNodes);
  return NextResponse.json(result);
}