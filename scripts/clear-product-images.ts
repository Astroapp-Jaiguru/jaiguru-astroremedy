import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/**
 * PHASE 1: Remove every product image (main + gallery) so the owner can
 * provide authentic photos. Product data, services and SiteImage uploads
 * (non-product blobs) are left untouched.
 */
async function main() {
  const products = await prisma.product.updateMany({
    data: { mainImage: null, imageSource: "manual", imageCredit: null },
  });
  const gallery = await prisma.productImage.deleteMany();
  console.log(`cleared main images on ${products.count} products`);
  console.log(`removed ${gallery.count} gallery image rows`);
  const services = await prisma.service.count({ where: { imageUrl: { not: null } } });
  console.log(`services untouched (${services} still have images)`);
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());