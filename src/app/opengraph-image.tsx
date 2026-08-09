import { ImageResponse } from "next/og";
import { OgCard, ogFonts } from "@/lib/og-image";
import { siteConfig } from "@/config/site";

export const alt = "JAIGURU ASTROREMEDY — Best Astrologer in Kolkata";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Welcome"
      title={siteConfig.astrologer.name}
      description="Best astrologer in Kolkata. Vedic Astrology, Vastu, Numerology, Yoga & Spiritual Remedies. Book a consultation today."
    />,
    { ...size, fonts: await ogFonts() }
  );
}
