import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { LEGAL_PAGES } from "./legal-content";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  let updated = 0;
  let created = 0;
  for (const page of LEGAL_PAGES) {
    const existing = await prisma.legalPage.findUnique({
      where: { slug: page.slug },
      select: { id: true },
    });
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        sortOrder: page.sortOrder,
      },
      create: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        sortOrder: page.sortOrder,
      },
    });
    if (existing) updated += 1;
    else created += 1;
    console.log(`- ${page.slug}: ${existing ? "updated" : "created"}`);
  }
  console.log(`Done. Updated: ${updated}, created: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
