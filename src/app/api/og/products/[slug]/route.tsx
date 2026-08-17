import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { OgCard, ogFonts } from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "Product — JAIGURU ASTROREMEDY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: { select: { name: true } } },
  });
  if (!product) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    <OgCard
      eyebrow="Product"
      title={product.name}
      description={product.shortDescription ?? product.longDescription ?? undefined}
      meta={product.category?.name}
    />,
    { ...size, fonts: await ogFonts() }
  );
}