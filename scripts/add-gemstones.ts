import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Adds 16 missing gemstone families with full integer size ranges and
 * Budget / Premium / Deluxe (Lab Certified) tiers.
 *
 * Pricing: price = size x baseRate x qualityMult x sizeMult, rounded to
 * nearest 100. Size bands (per existing catalog):
 *   1-3 -> 1.0, 4-5 -> 1.2, 6-7 -> 1.5, 8-9 -> 1.8, 10-11 -> 2.2,
 *   12-13 -> 2.5, 14-15 -> 3.0
 * Quality: Budget 1.0x, Premium 2.0x, Deluxe 3.0x.
 *
 * Certificate tiers: >5000 "Lab Certificate with Mine/Origin Test",
 * 701-5000 "Lab Tested Certificate", <=700 none.
 */

interface Stone {
  base: string;      // display base name
  alt: string | null; // parenthesised alt name (or null)
  rate: number;      // Budget per-carat / per-rati rate
  unit: string;      // "Carat" | "Rati"
  min: number;
  max: number;
}

const STONES: Stone[] = [
  { base: "Yellow Topaz", alt: null, rate: 300, unit: "Carat", min: 5, max: 13 },
  { base: "White Zircon", alt: null, rate: 250, unit: "Carat", min: 3, max: 9 },
  { base: "Blue Zircon", alt: null, rate: 350, unit: "Carat", min: 3, max: 9 },
  { base: "Firoza", alt: "Turquoise", rate: 500, unit: "Carat", min: 5, max: 10 },
  { base: "South Sea Pearl", alt: "Moti", rate: 800, unit: "Rati", min: 4, max: 14 },
  { base: "Burma Pearl", alt: "Moti", rate: 600, unit: "Carat", min: 4, max: 15 },
  { base: "Moonstone", alt: "Chandrakanta", rate: 250, unit: "Carat", min: 3, max: 10 },
  { base: "Sunstone", alt: "Suryakanta", rate: 300, unit: "Carat", min: 3, max: 8 },
  { base: "Aquamarine", alt: "Beruj", rate: 800, unit: "Carat", min: 3, max: 10 },
  { base: "Garnet", alt: "Raktamani", rate: 200, unit: "Carat", min: 3, max: 8 },
  { base: "Peridot", alt: "Olivine", rate: 500, unit: "Carat", min: 3, max: 7 },
  { base: "Smoky Quartz", alt: null, rate: 150, unit: "Carat", min: 5, max: 10 },
  { base: "Rhodonite", alt: null, rate: 200, unit: "Carat", min: 5, max: 10 },
  { base: "Iolite", alt: "Shani Priya", rate: 400, unit: "Carat", min: 3, max: 7 },
  { base: "Kunzite", alt: null, rate: 800, unit: "Carat", min: 3, max: 7 },
  { base: "Sodalite", alt: null, rate: 150, unit: "Carat", min: 5, max: 10 },
];

const TIERS = [
  { key: "budget", label: "Budget", mult: 1.0 },
  { key: "premium", label: "Premium", mult: 2.0 },
  { key: "deluxe", label: "Deluxe (Lab Certified)", mult: 3.0 },
];

function sizeMult(size: number): number {
  if (size <= 3) return 1.0;
  if (size <= 5) return 1.2;
  if (size <= 7) return 1.5;
  if (size <= 9) return 1.8;
  if (size <= 11) return 2.2;
  if (size <= 13) return 2.5;
  return 3.0;
}

function round100(n: number): number {
  return Math.round(n / 100) * 100;
}

function certFor(price: number): { hasCertificate: boolean; certificateLabel: string | null } {
  if (price > 5000) return { hasCertificate: true, certificateLabel: "Lab Certificate with Mine/Origin Test" };
  if (price >= 701) return { hasCertificate: true, certificateLabel: "Lab Tested Certificate" };
  return { hasCertificate: false, certificateLabel: null };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const gemCategory = await prisma.productCategory.findFirst({ where: { name: "Gemstones" } });
  if (!gemCategory) throw new Error("Gemstones category not found");

  const existing = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug)
  );

  let created = 0;
  let skipped = 0;
  const samplePrices: string[] = [];
  const tierCounts = { mine: 0, standard: 0, none: 0 };

  for (const stone of STONES) {
    for (let size = stone.min; size <= stone.max; size++) {
      for (const tier of TIERS) {
        const price = round100(size * stone.rate * tier.mult * sizeMult(size));
        const displayBase = stone.alt ? `${stone.base} (${stone.alt})` : stone.base;
        const name = `Original ${displayBase} – Natural – ${size} ${stone.unit} – ${tier.label}`;
        const slug = slugify(name);
        if (existing.has(slug)) {
          skipped++;
          continue;
        }
        const cert = certFor(price);
        if (price > 5000) tierCounts.mine++;
        else if (price >= 701) tierCounts.standard++;
        else tierCounts.none++;

        await prisma.product.create({
          data: {
            name,
            slug,
            categoryId: gemCategory.id,
            price,
            stockStatus: "IN_STOCK",
            quantity: 10,
            size: `${size} ${stone.unit}`,
            material: stone.base,
            sortOrder: 1,
            priceSource: "manual",
            imageSource: "manual",
            isActive: true,
            ...cert,
          },
        });
        created++;
        if (samplePrices.length < 6) {
          samplePrices.push(`${name} => Rs ${price}`);
        }
      }
    }
  }

  console.log(`created: ${created}, skipped (slug exists): ${skipped}`);
  console.log(`certificate tiers -> mine/origin: ${tierCounts.mine}, lab tested: ${tierCounts.standard}, none: ${tierCounts.none}`);
  for (const s of samplePrices) console.log(`  ${s}`);
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());