import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { OgCard, ogFonts } from "@/lib/og-image";
import { formatPrice } from "@/lib/shop-data";

export const alt = "Product — JAIGURU ASTROREMEDY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return new ImageResponse(<div />, { ...size });
  const price = product.discountPrice ?? product.price;
  return new ImageResponse(
    <OgCard
      eyebrow="Product"
      title={product.name}
      description={product.shortDescription ?? product.longDescription ?? undefined}
      meta={`₹ ${formatPrice(price)}`}
    />,
    { ...size, fonts: await ogFonts() }
  );
}
