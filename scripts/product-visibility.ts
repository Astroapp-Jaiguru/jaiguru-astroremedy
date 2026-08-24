import "dotenv/config";
import { prisma } from "../src/lib/prisma";

/**
 * Product visibility adjustment for launch.
 * Keeps the first 100 products (by sort order / newest) active — always
 * including every currently-featured product — and deactivates the rest.
 * Nothing is deleted.
 */
const KEEP_ACTIVE = 100;

async function main() {
  const all = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, name: true, isFeatured: true },
  });
  console.log(
    `Total products: ${all.length} · featured: ${all.filter((p) => p.isFeatured).length}`
  );

  const featured = all.filter((p) => p.isFeatured);
  const rest = all.filter((p) => !p.isFeatured);

  const keptFeatured = featured.slice(0, KEEP_ACTIVE).map((p) => p.id);
  const remainingSlots = KEEP_ACTIVE - keptFeatured.length;
  const keptRest = rest.slice(0, remainingSlots).map((p) => p.id);
  const keptIds = new Set([...keptFeatured, ...keptRest]);

  const deactivateIds = all.filter((p) => !keptIds.has(p.id)).map((p) => p.id);

  console.log(`Will keep ${keptIds.size} active; deactivate ${deactivateIds.length}.`);

  const result = await prisma.product.updateMany({
    where: { id: { in: deactivateIds } },
    data: { isActive: false },
  });
  console.log(`Deactivated rows: ${result.count}`);

  const after = await prisma.product.count({ where: { isActive: true } });
  const afterFeatured = await prisma.product.count({
    where: { isActive: true, isFeatured: true },
  });
  console.log(`After: active=${after} featured(active)=${afterFeatured}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());