import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

type ColRow = { col: string };

async function cols(table: string, names: string[]): Promise<void> {
  const q = await prisma.$queryRawUnsafe<ColRow[]>(
    `SELECT column_name::text AS col FROM information_schema.columns WHERE table_name='${table}' AND column_name IN (${names
      .map((n) => `'${n}'`)
      .join(",")}) ORDER BY 1`
  );
  console.log(`${table} cols:`, q.map((r) => r.col).join(", "));
}

async function main() {
  await cols("Product", ["costPrice", "competitorPrice", "priceFloor", "priceSource", "imageSource", "imageCredit"]);
  await cols("Service", ["competitorPrice", "priceFloor", "priceSource", "priceReviewedAt"]);
  const t = await prisma.$queryRawUnsafe<{ t: string | null }[]>(
    `SELECT to_regclass('public."PriceChange"')::text AS t`
  );
  console.log("PriceChange table:", t[0].t);
  console.log("products:", await prisma.product.count());
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
