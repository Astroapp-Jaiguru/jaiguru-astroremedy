/**
 * One-time (idempotent) seed: derive Product Types + Subtypes from the
 * existing catalog and assign every active product.
 *
 * Convention used by the grouped catalog:
 *   - Gemstones:  "Original {Variety} – {Origin} – {Tier}"
 *                 -> Type = "Variety", Subtype = "Origin"
 *   - Others:     "Natural {Name} – {Tier}"
 *                 -> Type = "Name", no subtype
 */
import { prisma } from "../../src/lib/prisma";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

interface Parsed {
  typeName: string;
  subName: string | null;
  subSlug: string | null;
}

function parseName(name: string): Parsed | null {
  let n = name.trim();
  n = n.replace(/^Original\s+/i, "").trim();
  n = n.replace(/\s*[-–—]\s*(Budget|Premium|Deluxe(?:\s*\(Lab Certified\))?)\s*$/i, "").trim();
  n = n.replace(/\s*[-–—]\s*Natural\s*$/i, "").trim();
  if (!n) return null;

  const parts = n.split(/\s*[-–—]\s*/);
  const last = parts[parts.length - 1].trim();
  // The origin is the final segment only when it does not contain
  // parentheses — families like "Padparadscha Sapphire (Gulabi – Narangi
  // Pukhraj)" keep their internal " – " and get no subtype.
  const hasOrigin = parts.length > 1 && !/[()]/.test(last);
  const typeName = (hasOrigin ? parts.slice(0, -1).join(" ") : parts.join(" ")).trim();
  if (!typeName) return null;
  const subtypeName = hasOrigin ? last : null;
  return {
    typeName,
    subName: subtypeName,
    subSlug: subtypeName ? slugify(subtypeName) : null,
  };
}

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  const parsed: Record<string, { id: string; typeSlug: string; subSlug: string | null }> = {};
  let unparsed = 0;

  for (const p of products) {
    const r = parseName(p.name);
    if (!r) {
      unparsed++;
      continue;
    }
    parsed[p.id] = {
      id: p.id,
      typeSlug: slugify(r.typeName),
      subSlug: r.subSlug,
    };
  }

  // Group type names by slug to keep the display name from the first occurrence.
  const typeNames: Record<string, string> = {};
  const subNames: Record<string, string> = {};
  for (const p of products) {
    const r = parseName(p.name);
    if (!r) continue;
    const typeSlug = slugify(r.typeName);
    typeNames[typeSlug] ??= r.typeName;
    if (r.subSlug) subNames[`${typeSlug}::${r.subSlug}`] ??= r.subName ?? r.subSlug;
  }

  let typesCreated = 0;
  let typesUpdated = 0;
  const typeIds: Record<string, string> = {};
  for (const [slug, name] of Object.entries(typeNames)) {
    const existing = await prisma.productType.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      typeIds[slug] = existing.id;
      typesUpdated++;
    } else {
      const t = await prisma.productType.create({
        data: { name, slug, icon: null, isActive: true, sortOrder: 0 },
        select: { id: true },
      });
      typeIds[slug] = t.id;
      typesCreated++;
    }
  }

  let subsCreated = 0;
  let subsUpdated = 0;
  const subIds: Record<string, string> = {};
  for (const p of Object.values(parsed)) {
    if (!p.subSlug) continue;
    const key = `${p.typeSlug}::${p.subSlug}`;
    if (subIds[key]) continue;
    const existing = await prisma.subtype.findFirst({
      where: { productTypeId: typeIds[p.typeSlug], slug: p.subSlug },
      select: { id: true },
    });
    if (existing) {
      subIds[key] = existing.id;
      subsUpdated++;
    } else {
      const s = await prisma.subtype.create({
        data: {
          name: subNames[key] ?? p.subSlug,
          slug: p.subSlug,
          productTypeId: typeIds[p.typeSlug],
          isActive: true,
          sortOrder: 0,
        },
        select: { id: true },
      });
      subIds[key] = s.id;
      subsCreated++;
    }
  }

  // Assign products.
  let assigned = 0;
  for (const [productId, p] of Object.entries(parsed)) {
    const data: { productTypeId: string; subtypeId: string | null } = {
      productTypeId: typeIds[p.typeSlug],
      subtypeId: p.subSlug ? subIds[`${p.typeSlug}::${p.subSlug}`] ?? null : null,
    };
    await prisma.product.update({ where: { id: productId }, data });
    assigned++;
  }

  const types = await prisma.productType.count();
  const subs = await prisma.subtype.count();
  console.log(
    JSON.stringify(
      {
        products: products.length,
        unparsed,
        assigned,
        typesCreated,
        typesUpdated,
        subsCreated,
        subsUpdated,
        totalTypes: types,
        totalSubtypes: subs,
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());