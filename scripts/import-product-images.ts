import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
const MAX_SIZE = 2 * 1024 * 1024;

/**
 * PHASE 4: Bulk-import numbered product photos.
 *   npx tsx scripts/import-product-images.ts --dir <folder>
 *
 * Filenames like 1.jpg / 2.png / 3.jpeg map to product numbers from
 * product-list.txt (stable order = products sorted by slug). Each image is
 * stored as a SiteImage blob and linked to the product's mainImage, exactly
 * like an admin upload. Missing/oversized/invalid files are reported.
 * Add --dry-run to preview without touching the database.
 */
async function main() {
  const args = process.argv.slice(2);
  let dirArg = "product_images";
  const dirEq = args.find((a) => a.startsWith("--dir="));
  if (dirEq) dirArg = dirEq.split("=")[1];
  const dirI = args.indexOf("--dir");
  if (dirI >= 0 && args[dirI + 1]) dirArg = args[dirI + 1];
  const dryRun = args.includes("--dry-run");

  const dir = path.resolve(process.cwd(), dirArg);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Folder not found: ${dir}`);
    process.exit(1);
  }

  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, mainImage: true },
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
  });
  const byNumber = new Map(products.map((p, i) => [i + 1, p]));
  console.log(`catalog: ${products.length} products, reading ${dir}`);

  const files = fs
    .readdirSync(dir)
    .map((f) => ({ name: f, full: path.join(dir, f) }))
    .filter((f) => fs.statSync(f.full).isFile())
    .filter((f) => /^\d+\.(jpe?g|png|webp)$/i.test(f.name))
    .sort((a, b) => {
      const na = Number(a.name.match(/^\d+/)?.[0] ?? 0);
      const nb = Number(b.name.match(/^\d+/)?.[0] ?? 0);
      return na - nb;
    });

  if (files.length === 0) {
    console.log("No numbered image files found (expected 1.jpg, 2.png, ...).");
    process.exit(0);
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const errorLog: string[] = [];

  for (const f of files) {
    const m = f.name.match(/^(\d+)\.(jpe?g|png|webp)$/i);
    const num = Number(m![1]);
    const ext = m![2].toLowerCase();
    const product = byNumber.get(num);

    if (!product) {
      errorLog.push(`${f.name}: no product #${num} in the catalog`);
      errors++;
      continue;
    }
    if (product.mainImage) {
      skipped++;
      continue;
    }
    const mimeType = EXT_MIME[ext];
    const size = fs.statSync(f.full).size;
    if (size > MAX_SIZE) {
      errorLog.push(`${f.name}: ${(size / 1024 / 1024).toFixed(1)} MB exceeds the 2 MB limit`);
      errors++;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${f.name} -> #${num} ${product.name}`);
      imported++;
      continue;
    }

    const bytes = fs.readFileSync(f.full);
    const row = await prisma.siteImage.create({
      data: {
        filename: `${num}-${product.slug}.${ext}`,
        mimeType,
        size,
        data: bytes,
      },
      select: { id: true },
    });
    await prisma.product.update({
      where: { id: product.id },
      data: {
        mainImage: `/api/site-images/${row.id}`,
        imageSource: "manual",
        imageCredit: null,
      },
    });
    console.log(`imported ${f.name} -> #${num} ${product.name}`);
    imported++;
  }

  const remaining = await prisma.product.count({ where: { mainImage: null } });
  console.log(`\nImported: ${imported}${dryRun ? " (dry-run)" : ""}, skipped (already has image): ${skipped}, errors: ${errors}`);
  if (errorLog.length) {
    console.log("Problems:");
    for (const e of errorLog) console.log(`  - ${e}`);
  }
  console.log(`Products still without an image: ${remaining}`);
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());