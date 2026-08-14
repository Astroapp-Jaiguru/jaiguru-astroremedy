import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/**
 * PHASE 2: Export a numbered product list (1 = product #1 in the stable
 * sort order, which the import script re-derives the same way: ORDER BY slug).
 * Save images as 1.jpg / 2.png / 3.jpeg ... matching this list.
 */
async function main() {
  const products = await prisma.product.findMany({
    select: { slug: true, name: true },
    orderBy: { slug: "asc" },
  });

  const lines: string[] = [];
  lines.push(`Jaiguru product catalog - ${products.length} items`);
  lines.push("Order is stable: products are sorted by slug. Save photos as 1.jpg, 2.png, 3.jpeg ...");
  lines.push("--------------------------------------------------");
  products.forEach((p, i) => lines.push(`${i + 1}. ${p.name}`));

  const out = path.resolve(process.cwd(), "product-list.txt");
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`wrote ${out} (${products.length} products)`);
  console.log(lines.slice(0, 12).join("\n"));
  console.log("...");
  console.log(lines.slice(-5).join("\n"));
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());