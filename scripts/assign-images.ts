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
 * Requires UNSPLASH_ACCESS_KEY (or OPENAI_API_KEY / REPLICATE_API_TOKEN).
 * Only fills products with no main image; manual uploads are untouched.
 */
async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : 100;

  const summary = await assignImagesForMissing({ limit });
  console.log("Image assignment summary:", JSON.stringify(summary, null, 2));
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
