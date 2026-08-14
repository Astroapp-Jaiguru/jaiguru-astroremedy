import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Catalog rules:
 *   RULE 1 - Lab Certificate: lab-testable products (Gemstones, Rudraksha,
 *            Crystal malas) priced above ₹700 get hasCertificate=true;
 *            everything else is unchecked.
 *   RULE 2 - Title prefix: Gemstones get "Original", everything else gets
 *            "Natural" at the start (already-prefixed names are skipped).
 */
function isLabTestable(categoryName: string, name: string): boolean {
  if (categoryName === "Gemstones") return true;
  if (categoryName === "Spiritual Items" && /rudraksha|crystal/i.test(name))
    return true;
  return false;
}

function prefixFor(categoryName: string): string {
  return categoryName === "Gemstones" ? "Original " : "Natural ";
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, price: true, hasCertificate: true, category: { select: { name: true } } },
  });
  console.log(`loaded ${products.length} products`);

  // ------------------------------------------------------------ RULE 1
  let setTrue = 0;
  let setFalse = 0;
  for (const p of products) {
    const testable = isLabTestable(p.category?.name ?? "", p.name);
    const want = testable && Number(p.price) > 700;
    if (want !== p.hasCertificate) {
      await prisma.product.update({
        where: { id: p.id },
        data: { hasCertificate: want },
      });
      if (want) setTrue++;
      else setFalse++;
    }
  }
  console.log(`RULE 1 (Lab Certificate): ${setTrue} set to TRUE, ${setFalse} set to FALSE`);

  // ------------------------------------------------------------ RULE 2
  let renamed = 0;
  let skipped = 0;
  const samples: string[] = [];
  for (const p of products) {
    if (/^(natural|original)\s/i.test(p.name)) {
      skipped++;
      continue;
    }
    const newName = prefixFor(p.category?.name ?? "") + p.name;
    await prisma.product.update({ where: { id: p.id }, data: { name: newName } });
    renamed++;
    if (samples.length < 5) samples.push(`${p.name}  ->  ${newName}`);
  }
  console.log(`RULE 2 (Title prefix): ${renamed} renamed, ${skipped} already prefixed`);
  for (const s of samples) console.log(`  ${s}`);

  const cert = await prisma.product.groupBy({ by: ["hasCertificate"], _count: true });
  console.log(`final hasCertificate: ${JSON.stringify(cert)}`);
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());