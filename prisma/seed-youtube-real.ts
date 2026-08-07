import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Real YouTube gallery seed.
 * Replaces the 4 placeholder demo videos with the client's 17 real videos.
 * Titles are "Video 1" .. "Video 17" (Jai Guru will rename + re-feature later
 * via /admin/gallery/youtube). First 4 are featured on the homepage band.
 * Idempotent: upserts by id `seed-youtube-${n}`.
 */

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

type SeedYoutube = {
  title: string;
  youtubeId: string;
  youtubeUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
};

const VIDEO_IDS: string[] = [
  "iFFXj5E6MUY",
  "-Qj9CDPig_c",
  "b3WSIGCgdro",
  "AOqXtUXoKYk",
  "uIEx3mJKVHQ",
  "z-8iP0ymF7o",
  "6dhazjltZUk",
  "DynLPrU77qc",
  "q2V0RSLtk1c",
  "UH_5tfHCeJs",
  "AW8OVx9FFkE",
  "hmdWK5FiaHg",
  "0_vJlf3vI8E",
  "Xn_9Rf7DWS0",
  "DpSY2jonNrU",
  "QDHnQCOuhJw",
  "vkfmyKA_f6k",
];

const videos: SeedYoutube[] = VIDEO_IDS.map((id, i) => ({
  title: `Video ${i + 1}`,
  youtubeId: id,
  youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
  isFeatured: i < 4,
  isActive: true,
  sortOrder: i,
}));

async function main() {
  // Remove old placeholder demo videos (id pattern `seed-yt-...`).
  const removed = await prisma.youtubeVideo.deleteMany({
    where: { id: { startsWith: "seed-yt-" } },
  });
  console.log(`Removed placeholder demo videos: ${removed.count}`);

  for (const v of videos) {
    await prisma.youtubeVideo.upsert({
      where: { id: `video-${v.sortOrder + 1}` },
      update: {
        title: v.title,
        youtubeId: v.youtubeId,
        youtubeUrl: v.youtubeUrl,
        isFeatured: v.isFeatured,
        isActive: v.isActive,
        sortOrder: v.sortOrder,
      },
      create: { id: `video-${v.sortOrder + 1}`, ...v },
    });
  }
  console.log(`OK Real YouTube videos: ${videos.length}`);

  const counts = await prisma.youtubeVideo.groupBy({
    by: ["isFeatured"],
    _count: { _all: true },
  });
  console.log("By featured status:", JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());