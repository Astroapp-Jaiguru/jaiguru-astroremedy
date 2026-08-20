import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { FAMILIES, type Family } from "./catalog-expansion-data";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const SPIRITUAL_CAT = "cmsgba7ki0001g0vmoqsn1rd8";
const VASTU_CAT = "cmsgbaaez0003g0vm4nnu5xr4";
const SPIRITUAL_ROOT = "cmt1681zb0000sgvm3d8aacql";
const VASTU_ROOT = "cmt1681zb0002sgvmtmny2k8a";

const RETURN_POLICY = `**Authenticity, Quality & Return Policy**

We are committed to providing 100% natural and authentic products. All stones above ₹2,000 come with a lab certificate.

**1. Unboxing Video Requirement:** To protect your rights and prevent fraud, you must record a complete unboxing video starting from the sealed courier packet. Claims regarding non-receipt, empty parcels, or swapped items will not be entertained without a valid unboxing video.

**2. Understanding Natural Characteristics:** Please note that natural gemstones and spiritual items may have minor natural inclusions, tiny internal lines, slight color variations, or uneven surface textures. These are **not defects**—they are natural characteristics of genuine stones. The product image is a representation; the actual stone may vary slightly in color and clarity due to natural origins. We cannot accept returns for these natural variations.

**3. Return Eligibility:** Returns are accepted **only** if the product is proven to be non-genuine (e.g., synthetic stone instead of natural) or damaged during transit.

**4. Final Decision:** While we carefully review every claim, the final decision regarding return eligibility, refund, or replacement rests solely with ASTRO GEMS. We reserve the right to refuse returns that fall under natural variations or do not meet the above criteria.`;

const TIERS = [
  { key: "budget", code: "BUD", label: "Budget", line: "Priced for everyday value with authentic quality." },
  { key: "premium", code: "PRE", label: "Premium", line: "Hand-picked from the best lot for superior finish." },
  { key: "deluxe", code: "DEL", label: "Deluxe", line: "Our finest selection with the highest-grade finishing." },
] as const;

const round5 = (n: number) => Math.round(n / 5) * 5;
const dec = (n: number) => new Prisma.Decimal(n.toFixed(2));

function sizeOptionsFor(f: Family, base: number) {
  const ratio = f.sizeMode === "yantra" ? [0.7, 1.0, 1.6] : [0.8, 1.0, 1.35];
  return f.sizeLabels.map((label, i) => ({ label, price: round5(base * ratio[i]) }));
}

async function nextSku(catCode: string, tierCode: string): Promise<string> {
  const existing = await prisma.product.findMany({
    where: { sku: { startsWith: `JGS-${catCode}-${tierCode}-` } },
    select: { sku: true },
  });
  let max = 0;
  for (const p of existing) {
    const m = p.sku?.match(/JGS-[A-Z]+-[A-Z]+-(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `JGS-${catCode}-${tierCode}-${String(max + 1).padStart(3, "0")}`;
}

async function upsertNav(slug: string, name: string, parentId: string | null, sortOrder: number, kind: string | null = null) {
  const existing = await prisma.productNavigation.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.productNavigation.create({ data: { slug, name, parentId, sortOrder, kind } });
}

async function main() {
  const stats = { groups: 0, types: 0, sizes: 0, products: 0, skippedProducts: 0, moved: 0, folders: 0 };

  // Category codes from existing SKUs
  const spi = await prisma.product.findFirst({
    where: { categoryId: SPIRITUAL_CAT, sku: { not: null } },
    select: { sku: true },
  });
  const vas = await prisma.product.findFirst({
    where: { categoryId: VASTU_CAT, sku: { not: null } },
    select: { sku: true },
  });
  const catCodes = {
    spiritual: spi?.sku?.split("-")[1] ?? "SPI",
    vastu: vas?.sku?.split("-")[1] ?? "VAS",
  };
  console.log("Category SKU codes:", catCodes);

  // Group nodes (unique per category) + type nodes per family
  const groupIds = new Map<string, string>();
  const groupSort = new Map<string, number>();

  for (const f of FAMILIES) {
    const root = f.category === "spiritual" ? SPIRITUAL_ROOT : VASTU_ROOT;
    if (!groupIds.has(f.groupSlug)) {
      const sort = (groupSort.get(f.group) ?? 0) + 1;
      groupSort.set(f.group, sort);
      const g = await upsertNav(f.groupSlug, f.group, root, sort);
      groupIds.set(f.groupSlug, g.id);
      stats.groups += 1;
    }
    const t = await upsertNav(f.typeSlug, f.typeName, groupIds.get(f.groupSlug)!, 1);
    stats.types += 1;

    if (f.sizeChildren) {
      for (const s of f.sizeLabels) {
        const sizeSlug = `${f.typeSlug}-size-${s.replace(/\s+/g, "-")}`;
        await upsertNav(sizeSlug, s, t.id, 1, "size");
        stats.sizes += 1;
      }
    }

    // Products
    const categoryId = f.category === "spiritual" ? SPIRITUAL_CAT : VASTU_CAT;
    for (const [i, tier] of TIERS.entries()) {
      const name = `Natural ${f.productBase} – ${tier.label}`;
      const slug = `${f.slugBase}-${tier.key}`;
      const exists = await prisma.product.findUnique({ where: { slug } });
      if (exists) {
        stats.skippedProducts += 1;
        console.log(`SKIP ${slug}`);
        continue;
      }
      const price = f.prices[i];
      const sku = await nextSku(catCodes[f.category], tier.code);
      const tags = [...f.tags, `tier-${tier.key}`];
      const longDescription =
        `${f.intro}\n\n${tier.line}\n\n**What you receive:** ${f.whatYouReceive}\n\n**How to use:** ${f.howToUse}\n\n${RETURN_POLICY}`;
      await prisma.product.create({
        data: {
          name,
          slug,
          categoryId,
          navigationId: t.id,
          subcategory: f.group,
          sku,
          price: dec(price),
          costPrice: dec(price / 2),
          competitorPrice: dec(price / 0.99),
          priceSource: "manual",
          imageSource: "manual",
          stockStatus: "IN_STOCK",
          quantity: 10,
          shortDescription: `${f.intro} ${tier.line}`,
          longDescription,
          returnPolicy: RETURN_POLICY,
          benefits: f.benefits,
          usageMethod: f.howToUse,
          material: f.material,
          size: "3 sizes available",
          sizeOptions: sizeOptionsFor(f, price),
          weight: f.weight,
          color: f.color,
          tags,
          estimatedDeliveryTime: "3-7 Business Days",
          hasCertificate: false,
          isFeatured: false,
          isPopular: false,
          isNewArrival: false,
          rating: new Prisma.Decimal(4.8),
          ratingCount: 0,
          seoTitle: `${f.productBase} – ${tier.label} | Best Price In India | ASTRO GEMS`,
          seoDescription: `Buy ${name} at the best price. ${f.intro} Genuine, natural and authentic — with return protection and WhatsApp ordering.`,
          seoKeywords: f.tags.join(", "),
          whatsappMessage: `Hello! I am interested in purchasing *${name}* (Rs. ${price}) from ASTRO GEMS. Please confirm availability and share payment details.`,
          isActive: true,
          sortOrder: 0,
        },
      });
      stats.products += 1;
    }

    // Product_photo folders
    const folder = path.join("Product_photo", f.productBase);
    for (const tier of TIERS) {
      fs.mkdirSync(path.join(folder, tier.label), { recursive: true });
      stats.folders += 1;
    }
  }

  // Move existing yantra families under the Yantras group
  const yantrasGroup = await prisma.productNavigation.findUnique({ where: { slug: "cat-spiritual-items-group-yantras" } });
  if (yantrasGroup) {
    const yantraFamilies = await prisma.productNavigation.findMany({
      where: { slug: { contains: "cat-spiritual-items-family-natural" } },
      select: { id: true, slug: true },
    });
    for (const n of yantraFamilies) {
      if (n.slug.includes("-yantra")) {
        await prisma.productNavigation.update({ where: { id: n.id }, data: { parentId: yantrasGroup.id } });
        stats.moved += 1;
        console.log("MOVED under Yantras:", n.slug);
      }
    }
  }

  // Move Tibetan Singing Bowl under Sound & Vibration Tools
  const soundGroup = await prisma.productNavigation.findUnique({ where: { slug: "cat-spiritual-items-group-sound-vibration-tools" } });
  if (soundGroup) {
    const bowl = await prisma.productNavigation.findUnique({ where: { slug: "cat-vastu-items-family-natural-tibetan-singing-bowl" } });
    if (bowl) {
      await prisma.productNavigation.update({ where: { id: bowl.id }, data: { parentId: soundGroup.id } });
      stats.moved += 1;
      console.log("MOVED under Sound & Vibration Tools:", bowl.slug);
    }
  }

  console.log("\n=== SUMMARY ===", stats);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());