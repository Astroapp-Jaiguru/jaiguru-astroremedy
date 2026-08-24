import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  fetchUnsplash,
  searchKeyword,
  searchServiceKeyword,
} from "../src/lib/images/unsplash";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fresh, cost-free catalog imagery sweep:
 *   1. CLEAR  - every product/service image URL is removed; AI blobs deleted
 *               (only *-ai.png files; real uploads are kept).
 *   2. ASSIGN - products and services are matched against Unsplash's free
 *               search API (royalty-free, author credited). NO paid AI.
 *   3. VERIFY - reports how many items got an image and lists the rest.
 *
 * Usage: npx tsx scripts/replace-images.ts [--limit N]
 *        Use --limit to chunk the run; the script resumes where it left off.
 */
async function main() {
  const args = process.argv.slice(2);
  let limit = Number.MAX_SAFE_INTEGER;
  const eq = args.find((a) => a.startsWith("--limit="));
  if (eq) limit = Number(eq.split("=")[1]);
  const i = args.indexOf("--limit");
  if (i >= 0 && args[i + 1]) limit = Number(args[i + 1]);

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.error("UNSPLASH_ACCESS_KEY is required for the free image sweep.");
    process.exit(1);
  }

  // ---------------------------------------------------------------- 1. CLEAR
  console.log("CLEARING product images...");
  const cleared = await prisma.product.updateMany({
    data: { mainImage: null, imageSource: "manual", imageCredit: null },
  });
  console.log(`  cleared ${cleared.count} products`);

  const aiBlobs = await prisma.siteImage.deleteMany({
    where: { filename: { endsWith: "-ai.png" } },
  });
  console.log(`  deleted ${aiBlobs.count} AI-generated image blobs`);

  const clearedServices = await prisma.service.updateMany({
    data: { imageUrl: null },
  });
  console.log(`  cleared ${clearedServices.count} services`);

  // ---------------------------------------------------------------- 2. ASSIGN
  const products = await prisma.product.findMany({
    where: { mainImage: null },
    orderBy: { updatedAt: "asc" },
    take: limit,
    include: { category: { select: { name: true } } },
  });
  console.log(`ASSIGNING free images for ${products.length} products...`);

  let pAssigned = 0;
  let pFailed = 0;
  for (let n = 0; n < products.length; n++) {
    const product = products[n];
    const keyword = searchKeyword(product.name, product.category.name);
    const hit = await fetchUnsplash(keyword);
    if (hit) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          mainImage: hit.url,
          imageSource: "unsplash",
          imageCredit: hit.credit,
        },
      });
      pAssigned++;
    } else {
      pFailed++;
      console.warn(`  no match: ${product.name} (${keyword})`);
    }
    if ((n + 1) % 100 === 0) {
      console.log(`  ...${n + 1}/${products.length} done (${pAssigned} assigned)`);
    }
    await sleep(120);
  }

  const services = await prisma.service.findMany({
    where: { imageUrl: null },
    orderBy: { updatedAt: "asc" },
    include: { category: { select: { name: true } } },
  });
  console.log(`ASSIGNING free images for ${services.length} services...`);

  let sAssigned = 0;
  for (const service of services) {
    const keyword = searchServiceKeyword(service.name, service.category.name);
    const hit = await fetchUnsplash(keyword);
    if (hit) {
      await prisma.service.update({
        where: { id: service.id },
        data: { imageUrl: hit.url },
      });
      sAssigned++;
    } else {
      console.warn(`  no match: ${service.name} (${keyword})`);
    }
    await sleep(120);
  }

  // ------------------------------------------------------------------ 3. VERIFY
  const [pTotal, pWith, sTotal, sWith] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { mainImage: { not: null } } }),
    prisma.service.count(),
    prisma.service.count({ where: { imageUrl: { not: null } } }),
  ]);
  console.log("\n================ VERIFICATION ================");
  console.log(`Products: ${pWith}/${pTotal} have a free image (${pTotal - pWith} empty -> placeholder)`);
  console.log(`Services: ${sWith}/${sTotal} have a free image (${sTotal - sWith} empty -> placeholder)`);
  console.log(`Product sweep: ${pAssigned} assigned, ${pFailed} unmatched`);
  console.log(`Service sweep: ${sAssigned} assigned, ${services.length - sAssigned} unmatched`);
  const empty = await prisma.product.findMany({
    where: { mainImage: null },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  if (empty.length) {
    console.log(`\nProducts without image (${empty.length}):`);
    for (const e of empty) console.log(`  - ${e.name}`);
  }
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());