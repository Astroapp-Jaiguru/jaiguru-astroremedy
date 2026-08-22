import { ImageResponse } from "next/og";
import { getServiceBySlug, SERVICE_MODE_LABELS } from "@/lib/services-data";
import { OgCard, ogFonts } from "@/lib/og-image";
import { formatPrice } from "@/lib/shop-data";

export const alt = "Service — JAIGURU ASTROREMEDY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return new ImageResponse(<div />, { ...size });
  const priceLabel =
    service.priceLabel ??
    (service.price ? formatPrice(service.price) : "On Request");
  return new ImageResponse(
    <OgCard
      eyebrow={`Service · ${SERVICE_MODE_LABELS[service.mode]}`}
      title={service.name}
      description={service.shortDescription ?? undefined}
      meta={priceLabel}
    />,
    { ...size, fonts: await ogFonts() }
  );
}
