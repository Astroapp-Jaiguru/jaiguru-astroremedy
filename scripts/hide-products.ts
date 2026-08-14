import "dotenv/config";
import * as fs from "fs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Hides products by list number (position in product-list.txt, 1-based,
 * products sorted by slug). Sets isActive=false; never deletes.
 */
const RANGES: Array<[number, number]> = [
  [7, 12],
  [34, 39],
  [82, 87],
  [157, 228],
  [301, 372],
  [376, 543],
  [580, 666],
  [673, 678],
  [745, 750],
  [751, 768],
  [817, 822],
  [898, 975],
  [1042, 1047],
  [1120, 1125],
  [1204, 1209],
  [1204, 1353],
  [1426, 1431],
  [1498, 1641],
  [1642, 1647],
  [1654, 1668],
  [1717, 1740],
  [1795, 1812],
  [1837, 1860],
  [1861, 1932],
  [1945, 1953],
  [1957, 1977],
  [2173, 2240],
];

function parseList(): string[] {
  const lines = fs.readFileSync("product-list.txt", "utf-8").split(/\r?\n/);
  const names: string[] = [];
  for (const line of lines) {
    const m = /^(\d+)\.\s+(.+)$/.exec(line.trim());
    if (m) names[parseInt(m[1], 10)] = m[2];
  }
  return names;
}

async function main() {
  const names = parseList();
  const entryCount = names.filter((n) => n !== undefined).length;
  console.log(`product-list.txt entries: ${entryCount}`);

  const hideSet = new Set<number>();
  for (const [lo, hi] of RANGES) {
    for (let i = lo; i <= hi; i++) hideSet.add(i);
  }
  console.log(`numbers to hide (union of ranges): ${hideSet.size}`);
  if (hideSet.size !== 1100) console.warn(`WARN: expected 1100 based on the ranges given`);

  const products = await prisma.product.findMany({
    orderBy: { slug: "asc" },
    select: { id: true, slug: true },
  });
  console.log(`active products in slug order: ${products.length}`);

  const byNumber = new Map<number, string>();
  let position = 0;
  for (const p of products) byNumber.set(++position, p.id);
  const lastNumber = Math.max(...byNumber.keys());
  if (lastNumber !== 2259) console.warn(`WARN: slug-ordered active products run to #${lastNumber}, expected 2259`);

  let hidden = 0;
  let alreadyHidden = 0;
  for (const n of hideSet) {
    const id = byNumber.get(n);
    if (!id) {
      console.warn(`WARN: no product at number ${n} (${names[n] ?? "unknown name"})`);
      continue;
    }
    const prev = await prisma.product.update({ where: { id }, data: { isActive: false }, select: { isActive: true } });
    if (!prev.isActive) alreadyHidden++;
    hidden++;
  }

  const remaining = await prisma.product.count({ where: { isActive: true } });
  console.log(`hidden now: ${hidden} (${alreadyHidden} were already inactive)`);
  console.log(`active products remaining: ${remaining}`);
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());