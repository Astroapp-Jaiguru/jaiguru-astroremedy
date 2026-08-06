import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { THEME_DEFAULTS, THEME_STORAGE_KEY } from "../src/config/theme";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const existingTheme = await prisma.themeSetting.findUnique({
    where: { key: THEME_STORAGE_KEY },
  });
  if (existingTheme) {
    console.log("INFO theme setting already exists - leaving it untouched");
  } else {
    await prisma.themeSetting.create({
      data: { key: THEME_STORAGE_KEY, value: THEME_DEFAULTS as never },
    });
    console.log("OK theme setting created with defaults");
  }

  const existing = await prisma.socialLink.findUnique({
    where: { platform: "googlebusiness" },
  });
  if (!existing) {
    await prisma.socialLink.create({
      data: { platform: "googlebusiness", url: "", sortOrder: 6, icon: "Google" },
    });
    console.log("OK googlebusiness social link created");
  } else {
    console.log("INFO googlebusiness social link already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
