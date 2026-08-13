import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { runPriceUpdate } from "../src/lib/pricing/engine";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Local full-catalog pricing sweep (no function time budget):
 *   npm run pricing:sweep                -> everything, source "cron"
 *   npm run pricing:sweep -- --limit 50  -> first 50 products needing refresh
 *
 * Requires SERPAPI_API_KEY in .env. Every change is audited (PriceChange).
 */
async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

  const summary = await runPriceUpdate({
    source: "cron",
    timeBudgetMs: 1000 * 60 * 60, // 1 hour wall clock
    fetchLimit: limit ?? 100,
  });
  console.log("Pricing sweep summary:", JSON.stringify(summary, null, 2));
  if (summary.skippedNoFloor > 0) {
    console.warn(
      "Note: items without a floor (no costPrice and no priceFloor) are skipped by design - add floors to price them."
    );
  }
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
