import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });
const ROOT = path.join(process.cwd(), "Product_photo");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const TIERS = ["Budget", "Premium", "Deluxe"] as const;
type Tier = (typeof TIERS)[number];

function varietyOf(name: string): string {
  let n = name.replace(/^Original /, "");
  n = n.replace(/ – (Budget|Premium|Deluxe \(Lab Certified\))$/, "");
  n = n.replace(/ – \d+(?:\.\d+)? (Carat|Rati)$/, "");
  n = n.replace(/ – Natural$/, "");
  return n.trim();
}

function tierOf(name: string): Tier | null {
  if (name.endsWith(" – Budget")) return "Budget";
  if (name.endsWith(" – Premium")) return "Premium";
  if (name.endsWith(" – Deluxe (Lab Certified)")) return "Deluxe";
  return null;
}

function sizeOf(name: string): number {
  const m = name.match(/ – ([\d.]+) Carat/);
  return m ? parseFloat(m[1]) : Infinity;
}

function mimeFor(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

async function main() {
  const gemCat = await prisma.productCategory.findFirst({ where: { name: "Gemstones" } });
  if (!gemCat) throw new Error("Gemstones category not found");
  const products = await prisma.product.findMany({
    where: { categoryId: gemCat.id },
    select: { id: true, name: true },
  });
  const byKey = new Map<string, typeof products>();
  for (const p of products) {
    const f = varietyOf(p.name);
    const t = tierOf(p.name);
    if (!t) continue;
    const key = `${f}|${t}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(p);
  }

  const uploaded = new Map<string, string>();
  let assigned = 0;
  let skipped = 0;
  const report: string[] = [];

  for (const familyDir of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!familyDir.isDirectory()) continue;
    for (const tier of TIERS) {
      const tierPath = path.join(ROOT, familyDir.name, tier);
      if (!fs.existsSync(tierPath)) continue;
      const images = fs.readdirSync(tierPath)
        .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
        .sort();
      const key = `${familyDir.name}|${tier}`;
      const members = (byKey.get(key) ?? [])
        .sort((a, b) => sizeOf(a.name) - sizeOf(b.name) || a.name.localeCompare(b.name));

      if (images.length === 0) {
        if (members.length) { skipped += members.length; report.push(`SKIP ${key}: no images (${members.length} products)`); }
        continue;
      }

      const urls: string[] = [];
      for (const img of images) {
        const abs = path.join(tierPath, img);
        let url = uploaded.get(abs);
        if (!url) {
          const row = await prisma.siteImage.create({
            data: {
              filename: img,
              mimeType: mimeFor(img),
              size: fs.statSync(abs).size,
              data: fs.readFileSync(abs),
            },
            select: { id: true },
          });
          url = `/api/site-images/${row.id}`;
          uploaded.set(abs, url);
        }
        urls.push(url);
      }

      let per = 0;
      for (let i = 0; i < members.length; i++) {
        await prisma.product.update({
          where: { id: members[i].id },
          data: { mainImage: urls[i % urls.length], imageSource: "manual", imageCredit: null },
        });
        per++;
      }
      assigned += per;
      const repeats = images.length < members.length ? `repeats (${images.length} img -> ${members.length} prod)` : "unique";
      report.push(`OK ${key}: ${images.length} images, ${members.length} products, ${repeats}`);
    }
  }

  console.log(report.join("\n"));
  console.log(`\nASSIGNED: ${assigned} products, untouched: ${skipped} (empty folders)`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error("Failed:", e); process.exit(1); });
