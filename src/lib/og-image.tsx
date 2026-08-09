import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  style: "normal";
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
};

/**
 * Branded Open Graph card (1200×630) rendered with next/og ImageResponse.
 * Shared by the root opengraph-image and the product / service /
 * consultation detail routes so every shared link gets a professional
 * social preview card with the item's real title, description and branding.
 */

const fontDir = join(process.cwd(), "src", "assets", "fonts");

const inter400 = readFile(join(fontDir, "inter-400.ttf"));
const inter600 = readFile(join(fontDir, "inter-600.ttf"));
const inter700 = readFile(join(fontDir, "inter-700.ttf"));
const playfair400 = readFile(join(fontDir, "playfair-400.ttf"));
const playfair700 = readFile(join(fontDir, "playfair-700.ttf"));

const toBuf = (b: Buffer) =>
  b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;

export const ogFonts = async (): Promise<OgFont[]> => {
  const [i4, i6, i7, p4, p7] = await Promise.all([
    inter400,
    inter600,
    inter700,
    playfair400,
    playfair700,
  ]);
  return [
    { name: "Inter", data: toBuf(i4), style: "normal", weight: 400 },
    { name: "Inter", data: toBuf(i6), style: "normal", weight: 600 },
    { name: "Inter", data: toBuf(i7), style: "normal", weight: 700 },
    { name: "Playfair Display", data: toBuf(p4), style: "normal", weight: 400 },
    { name: "Playfair Display", data: toBuf(p7), style: "normal", weight: 700 },
  ];
};

export interface OgCardProps {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: string;
}

export function OgCard({ eyebrow, title, description, meta }: OgCardProps) {
  const titleSize = title.length > 42 ? 44 : 56;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 84px",
        background:
          "linear-gradient(135deg, #0B1120 0%, #1E1B4B 45%, #312E81 75%, #4C1D95 100%)",
        fontFamily: "Inter",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow orbs */}
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: 9999,
          right: -160,
          top: -180,
          background: "rgba(250,204,21,0.22)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 460,
          height: 460,
          borderRadius: 9999,
          left: -140,
          bottom: -200,
          background: "rgba(76,29,149,0.55)",
          filter: "blur(90px)",
        }}
      />

      {/* Brand header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              border: "2px solid rgba(250,204,21,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 9999,
                background: "#FACC15",
                boxShadow: "0 0 24px rgba(250,204,21,0.9)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Playfair Display",
                fontSize: 30,
                letterSpacing: 6,
                color: "#FACC15",
                fontWeight: 700,
              }}
            >
              JAIGURU&nbsp;ASTROREMEDY
            </div>
            <div
              style={{
                fontSize: 13,
                letterSpacing: 4,
                color: "#A5B4FC",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Vedic Astrology · Vastu · Numerology · Yoga
            </div>
          </div>
        </div>
        {meta ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              fontWeight: 600,
              color: "#FACC15",
              border: "1.5px solid rgba(250,204,21,0.5)",
              borderRadius: 9999,
              padding: "10px 26px",
            }}
          >
            {meta}
          </div>
        ) : null}
      </div>

      {/* Title + description */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#FACC15",
            marginBottom: 22,
          }}
        >
          <div style={{ width: 44, height: 3, borderRadius: 2, background: "#FACC15" }} />
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: "Playfair Display",
            fontSize: titleSize,
            lineHeight: 1.15,
            color: "#FFFFFF",
            fontWeight: 700,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            maxWidth: 1020,
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              marginTop: 26,
              fontSize: 26,
              lineHeight: 1.45,
              color: "#CBD5E1",
              fontWeight: 400,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              maxWidth: 980,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          borderTop: "1px solid rgba(255,255,255,0.14)",
          paddingTop: 26,
        }}
      >
        <div style={{ display: "flex", gap: 10, fontSize: 21, color: "#E2E8F0" }}>
          {siteConfig.business.websiteName}
        </div>
        <div style={{ fontSize: 21, color: "#A5B4FC", fontWeight: 600 }}>
          {siteConfig.astrologer.name}
        </div>
      </div>
    </div>
  );
}
