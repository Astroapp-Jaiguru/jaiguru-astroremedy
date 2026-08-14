import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { assignImagesForMissing } from "../src/lib/images/pipeline";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Local image pipeline run (no function time budget):
 *   npm run images:assign -- --limit 200
 *
 * Requires UNSPLASH_ACCESS_KEY.
 * Only fills products with no main image; manual uploads are untouched.
 */
async function main() {
  const args = process.argv.slice(2);
  let limit = 100;
  const eq = args.find((a) => a.startsWith("--limit="));
  if (eq) limit = Number(eq.split("=")[1]);
  const i = args.indexOf("--limit");
  if (i >= 0 && args[i + 1]) limit = Number(args[i + 1]);
  if (!Number.isFinite(limit) || limit <= 0) limit = 100;

  const summary = await assignImagesForMissing({
    timeBudgetMs: 1000 * 60 * 60, // 1 hour wall clock
    limit,
  });
  console.log("Image assignment summary:", JSON.stringify(summary, null, 2));
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
