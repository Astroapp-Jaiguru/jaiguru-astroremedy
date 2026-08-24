import { ImageResponse } from "next/og";
import { getConsultationTopic } from "@/lib/consultation-topics";
import { OgCard, ogFonts } from "@/lib/og-image";
import { durationLabel } from "@/lib/booking";

export const alt = "Consultation — JAIGURU ASTROREMEDY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getConsultationTopic(slug);
  if (!topic) return new ImageResponse(<div />, { ...size });
  return new ImageResponse(
    <OgCard
      eyebrow="Consultation"
      title={topic.title}
      description={topic.longDescription}
      meta={`${topic.fee} · ${durationLabel(topic.durationMinutes)}`}
    />,
    { ...size, fonts: await ogFonts() }
  );
}
