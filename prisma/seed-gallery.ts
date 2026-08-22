import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Phase 6 - Gallery seed.
 * Seeds photo / video / youtube gallery items so the homepage gallery band
 * and public gallery pages have content. Idempotent (upsert by title).
 */

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const photo = (title: string, description: string, category: string, i: number) => ({
  title,
  description,
  imageUrl: `https://placehold.co/800x600/312E81/E0C3FC/png?text=${encodeURIComponent(title)}`,
  altText: title,
  category,
  isFeatured: i < 4,
  isActive: true,
  sortOrder: i,
});

const photos = [
  photo("Maha Shivratri Pooja 2025", "Night-long pooja and abhishek at the chamber.", "Pooja", 0),
  photo("Astrology Course Batch 12", "Live classroom session at the Sovabazar chamber.", "Course", 1),
  photo("Rudraksha Energisation", "Energisation ritual for certified rudraksha malas.", "Remedies", 2),
  photo("Vastu Site Visit", "On-site vastu consultation for a new home.", "Vastu", 3),
  photo("Navratri Special Pooja", "Navratri special pooja and havan.", "Pooja", 4),
  photo("Gemstone Laboratory Visit", "Selecting certified gemstones with the client.", "Gemstones", 5),
  photo("Yoga Guidance Session", "Morning yoga guidance at the chamber.", "Yoga", 6),
  photo("Client Testimonial Day", "Clients sharing their experiences after remedies.", "Events", 7),
];

const videos = [
  {
    title: "Maha Shivratri Live Pooja Highlights",
    description: "Key moments from the night-long Maha Shivratri pooja.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://placehold.co/800x450/4C1D95/E0C3FC/png?text=Shivratri+Pooja",
    category: "Pooja",
    isFeatured: true,
    isActive: true,
    sortOrder: 0,
  },
  {
    title: "Astrology Course - Sample Session",
    description: "A short preview of the astrology course teaching style.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://placehold.co/800x450/312E81/E0C3FC/png?text=Course+Preview",
    category: "Course",
    isFeatured: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Vastu Tips for Home",
    description: "Three quick vastu fixes you can apply at home today.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://placehold.co/800x450/1E1B4B/E0C3FC/png?text=Vastu+Tips",
    category: "Vastu",
    isFeatured: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    title: "Gemstone Remedy Guide",
    description: "How to choose and wear your gemstone the right way.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://placehold.co/800x450/4C1D95/FACC15/png?text=Gemstone+Guide",
    category: "Gemstones",
    isFeatured: false,
    isActive: true,
    sortOrder: 3,
  },
];

const youtube = [
  {
    title: "Jupiter Transit 2025 - Remedies",
    description: "How to make the most of the Jupiter transit with simple remedies.",
    youtubeId: "aqz-KE-bpKQ",
    youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    category: "Astrology",
    isFeatured: true,
    isActive: true,
    sortOrder: 0,
  },
  {
    title: "Rudraksha - Which Bead For You?",
    description: "A guide to choosing the right rudraksha bead.",
    youtubeId: "eRsGyueVLvQ",
    youtubeUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ",
    category: "Remedies",
    isFeatured: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Vastu Corrections Without Renovation",
    description: "Simple vastu corrections that need no construction work.",
    youtubeId: "R6MlUcmOul8",
    youtubeUrl: "https://www.youtube.com/watch?v=R6MlUcmOul8",
    category: "Vastu",
    isFeatured: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    title: "Meditation For Beginners",
    description: "A short guided meditation for daily practice.",
    youtubeId: "M7lc1UVf-VE",
    youtubeUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    category: "Yoga",
    isFeatured: false,
    isActive: true,
    sortOrder: 3,
  },
];

async function main() {
  for (const p of photos) {
    await prisma.galleryImage.upsert({
      where: { id: `seed-photo-${p.title}` },
      update: {},
      create: { id: `seed-photo-${p.title}`, ...p },
    });
  }
  console.log(`OK Gallery photos: ${photos.length}`);

  for (const v of videos) {
    await prisma.video.upsert({
      where: { id: `seed-video-${v.title}` },
      update: {},
      create: { id: `seed-video-${v.title}`, ...v },
    });
  }
  console.log(`OK Gallery videos: ${videos.length}`);

  for (const v of youtube) {
    await prisma.youtubeVideo.upsert({
      where: { id: `seed-yt-${v.title}` },
      update: {},
      create: { id: `seed-yt-${v.title}`, ...v },
    });
  }
  console.log(`OK YouTube videos: ${youtube.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
