import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });
const ROOT = path.join(process.cwd(), "Product_photo");
const TIERS = ["Deluxe", "Premium", "Budget"];

function varietyOf(name: string): string {
  let n = name.replace(/^Original /, "");
  n = n.replace(/ – (Budget|Premium|Deluxe \(Lab Certified\))$/, "");
  n = n.replace(/ – \d+(?:\.\d+)? (Carat|Rati)$/, "");
  n = n.replace(/ – Natural$/, "");
  return n.trim();
}

async function main() {
  const gemCat = await prisma.productCategory.findFirst({ where: { name: "Gemstones" } });
  if (!gemCat) throw new Error("Gemstones category not found");
  const products = await prisma.product.findMany({
    where: { categoryId: gemCat.id },
    select: { name: true },
  });
  const families = [...new Set(products.map((p) => varietyOf(p.name)))].sort();
  for (const f of families) {
    for (const tier of TIERS) {
      fs.mkdirSync(path.join(ROOT, f, tier), { recursive: true });
    }
  }
  console.log(`Created ${families.length} gemstone folders x ${TIERS.length} tiers under ${ROOT}`);
  console.log(families.join("\n"));
  await prisma.$disconnect();
}
main();
