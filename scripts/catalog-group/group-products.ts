import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });

function varietyOf(name: string): string {
  let n = name.replace(/^Original /, "");
  n = n.replace(/ – (Budget|Premium|Deluxe(?: \(Lab Certified\))?)$/, "");
  n = n.replace(/ – \d+(?:\.\d+)? (Carat|Rati)$/, "");
  n = n.replace(/ – Natural$/, "");
  return n.trim();
}

function tierOf(name: string): "Budget" | "Premium" | "Deluxe" | null {
  if (/ – (Budget|Deluxe \(Lab Certified\)|Premium)$/.test(name.replace(/^Original /, ""))) {
    const m = name.match(/ – (Budget|Premium|Deluxe(?: \(Lab Certified\))?)$/);
    return m ? (m[1] === "Budget" ? "Budget" : m[1] === "Premium" ? "Premium" : "Deluxe") : null;
  }
  return null;
}

function sizeOf(name: string): number {
  const m = name.match(/ – ([\d.]+) (Carat|Rati)/);
  return m ? parseFloat(m[1]) : Infinity;
}

function sizeLabelOf(name: string): string | null {
  const n = name.replace(/ – (Budget|Premium|Deluxe(?: \(Lab Certified\))?)$/, "");
  const m = n.match(/ – ([\d.]+ (?:Carat|Rati))$/);
  return m ? m[1] : null;
}

function round10(n: number): number {
  return Math.round(n / 10) * 10;
}

const RULES: { match: RegExp; options: { label: string; mult: number }[] }[] = [
  { match: /Yantra/i, options: [
    { label: "3-inch", mult: 0.7 },
    { label: "6-inch", mult: 1.0 },
    { label: "9-inch", mult: 1.6 },
  ]},
  { match: /Yoga|Meditation Cushion/i, options: [
    { label: "Standard", mult: 0.9 },
    { label: "Premium", mult: 1.0 },
    { label: "Deluxe", mult: 1.3 },
  ]},
  { match: /.*/, options: [
    { label: "Small", mult: 0.8 },
    { label: "Medium", mult: 1.0 },
    { label: "Large", mult: 1.35 },
  ]},
];

async function main() {
  // ---------- GEMSTONES: group into 1 product per (variety, tier) ----------
  const gemCat = await prisma.productCategory.findFirst({ where: { name: "Gemstones" } });
  if (!gemCat) throw new Error("Gemstones category not found");
  const gemstones = await prisma.product.findMany({
    where: { categoryId: gemCat.id },
    select: { id: true, name: true, price: true, slug: true },
  });

  const groups = new Map<string, typeof gemstones>();
  for (const p of gemstones) {
    const v = varietyOf(p.name);
    const t = tierOf(p.name);
    if (!t) continue;
    const key = `${v}|${t}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  let reps = 0;
  let deactivated = 0;
  let skipped = 0;
  for (const [key, members] of groups) {
    const [variety, tier] = key.split("|");
    const sorted = [...members].sort((a, b) => sizeOf(a.name) - sizeOf(b.name));
    const rep = sorted[0];
    const options = sorted
      .map((m) => ({ label: sizeLabelOf(m.name), price: Number(m.price) }))
      .filter((o): o is { label: string; price: number } => Boolean(o.label))
      .sort((a, b) => {
        const na = parseFloat(a.label);
        const nb = parseFloat(b.label);
        return (Number.isFinite(na) ? na : Infinity) - (Number.isFinite(nb) ? nb : Infinity);
      });
    if (options.length < 2) { skipped += sorted.length; continue; }
    const newName = `Original ${variety} – ${tier}`;
    await prisma.product.update({
      where: { id: rep.id },
      data: {
        name: newName,
        price: options[0].price,
        sizeOptions: options,
        size: `${options.length} sizes available`,
        sku: null,
      },
    });
    const others = sorted.slice(1);
    if (others.length) {
      await prisma.product.updateMany({ where: { id: { in: others.map((o) => o.id) } }, data: { isActive: false } });
    }
    reps++;
    deactivated += others.length;
  }
  console.log(`Gemstones: ${reps} grouped products kept, ${deactivated} size variants hidden, ${skipped} ungrouped (no tier/size)`);

  // ---------- OTHER CATEGORIES: attach size options (3 per product) ----------
  const othersCat = await prisma.productCategory.findMany({ where: { name: { not: "Gemstones" } }, select: { id: true, name: true } });
  let attached = 0;
  for (const cat of othersCat) {
    const products = await prisma.product.findMany({ where: { categoryId: cat.id }, select: { id: true, name: true, price: true } });
    for (const p of products) {
      const rule = RULES.find((r) => r.match.test(p.name)) ?? RULES[RULES.length - 1];
      const base = Number(p.price);
      const options = rule.options.map((o) => ({ label: o.label, price: round10(base * o.mult) }));
      await prisma.product.update({ where: { id: p.id }, data: { sizeOptions: options, size: `${options.length} sizes available` } });
      attached++;
    }
  }
  console.log(`Other categories: size options attached to ${attached} products`);

  const active = await prisma.product.count({ where: { isActive: true } });
  const total = await prisma.product.count();
  console.log(`\nFINAL: active products=${active}, total rows=${total} (hidden variants kept for order history)`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error("Failed:", e); process.exit(1); });