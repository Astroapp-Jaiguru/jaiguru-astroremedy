import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const total = await prisma.product.count();
  const active = await prisma.product.count({ where: { isActive: true } });
  const featuredActive = await prisma.product.count({
    where: { isActive: true, isFeatured: true },
  });
  const inactive = await prisma.product.count({ where: { isActive: false } });
  const servicesActive = await prisma.service.count({ where: { isActive: true } });
  console.log(JSON.stringify({ total, active, inactive, featuredActive }, null, 2));
  console.log("services active:", servicesActive);
  const okActive = active === 100;
  const okFeatured = featuredActive >= 12;
  console.log(`CHECK 100 active: ${okActive ? "PASS" : "FAIL"} · CHECK 12+ featured: ${okFeatured ? "PASS" : "FAIL"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());