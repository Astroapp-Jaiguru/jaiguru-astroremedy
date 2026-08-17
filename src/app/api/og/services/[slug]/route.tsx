import { ImageResponse } from "next/og";
import { getServiceBySlug, SERVICE_MODE_LABELS } from "@/lib/services-data";
import { OgCard, ogFonts } from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "Service — JAIGURU ASTROREMEDY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    <OgCard
      eyebrow="Service"
      title={service.name}
      description={service.shortDescription ?? undefined}
      meta={SERVICE_MODE_LABELS[service.mode]}
    />,
    { ...size, fonts: await ogFonts() }
  );
}