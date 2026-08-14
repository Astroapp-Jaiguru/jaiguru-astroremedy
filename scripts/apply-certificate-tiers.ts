import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Certificate label tiering for GEMMSTONE products only:
 *   price > 5000            -> "Lab Certificate with Mine/Origin Test" (+ hasCertificate=true)
 *   701 <= price <= 5000    -> "Lab Tested Certificate"               (+ hasCertificate=true)
 *   price <= 700            -> no label (certificateLabel=null, hasCertificate=false)
 * Non-gemstone products are left untouched.
 */
const LABEL_MINE = "Lab Certificate with Mine/Origin Test";
const LABEL_STANDARD = "Lab Tested Certificate";

async function main() {
  const products = await prisma.product.findMany({
    where: { category: { name: "Gemstones" } },
    select: { id: true, price: true, hasCertificate: true, certificateLabel: true },
  });
  console.log(`gemstone products: ${products.length}`);

  let mine = 0;
  let standard = 0;
  let none = 0;
  for (const p of products) {
    const price = Number(p.price);
    let label: string | null;
    let cert: boolean;
    if (price > 5000) {
      label = LABEL_MINE;
      cert = true;
      mine++;
    } else if (price >= 701) {
      label = LABEL_STANDARD;
      cert = true;
      standard++;
    } else {
      label = null;
      cert = false;
      none++;
    }
    if (p.certificateLabel !== label || p.hasCertificate !== cert) {
      await prisma.product.update({
        where: { id: p.id },
        data: { certificateLabel: label, hasCertificate: cert },
      });
    }
  }
  console.log(`>5000   ("${LABEL_MINE}"):        ${mine}`);
  console.log(`701-5000 ("${LABEL_STANDARD}"):   ${standard}`);
  console.log(`<=700   (no label):               ${none}`);
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());