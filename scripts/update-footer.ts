import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Persists the corrected footer legal lines into the SiteSetting "footer"
 * row (idempotent). Keeps ownedBy/registered empty so the footer renders a
 * single combined copyright sentence.
 */
async function main() {
  const footer = {
    about:
      "Premium Vedic Astrology, Vastu, Numerology, Yoga and Spiritual Remedy guidance in Kolkata by Vedic Astrologer Arup Shastri (Jai Guru).",
    ownedBy: "",
    registered: "",
    copyright:
      "© 2026 Astrologer Arup Shastri. All rights reserved. jaiguruastroremedy.com is owned and operated by ASTRO GEMS, a registered enterprise under the Kolkata Municipal Corporation.",
  };
  const row = await prisma.siteSetting.upsert({
    where: { key: "footer" },
    update: { value: footer as never },
    create: { key: "footer", value: footer as never },
  });
  console.log(
    `OK footer setting persisted (key=${row.key}, updated=${row.updatedAt.toISOString()})`
  );
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());