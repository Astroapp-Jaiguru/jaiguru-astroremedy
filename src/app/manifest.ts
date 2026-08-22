import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jaiguru Astroremedy",
    short_name: "Jaiguru",
    description:
      "Vedic astrology, numerology, vastu, yoga and spiritual remedy guidance by Vedic Astrologer Arup Shastri (Jai Guru), Kolkata.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1120",
    theme_color: "#0B1120",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}