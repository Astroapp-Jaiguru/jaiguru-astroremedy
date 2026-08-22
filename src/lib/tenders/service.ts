import "server-only";
import { prisma } from "@/lib/prisma";
import { requireBuyer, requireSupplier } from "@/lib/dal";
import { createHash } from "node:crypto";

export function encryptBidPayload(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export async function createTender(input: { title: string; description: string; category: string; deliveryLocation: string; closingAt: Date; buyerId: string }) {
  return prisma.tender.create({ data: { ...input, openingAt: new Date(), bidType: "SEALED", status: "DRAFT" } });
}

export async function listOpenTenders() {
  return prisma.tender.findMany({ where: { status: "OPEN", closingAt: { gt: new Date() } }, include: { items: true, _count: { select: { bids: true } } }, orderBy: { closingAt: "asc" } });
}

export async function submitBid(tenderId: string, supplierId: string, input: { unitPricePaise: number; totalBidPaise: number; deliveryDays: number; technicalCompliance: string; termsAccepted: boolean }) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender || tender.status !== "OPEN" || tender.closingAt <= new Date()) throw new Error("Tender is closed");
  if (!input.termsAccepted || input.unitPricePaise <= 0 || input.totalBidPaise <= 0) throw new Error("Invalid bid");
  return prisma.tenderBid.upsert({ where: { tenderId_supplierId: { tenderId, supplierId } }, update: { ...input, encryptedPayload: encryptBidPayload(input) }, create: { tenderId, supplierId, ...input, encryptedPayload: encryptBidPayload(input), status: "SUBMITTED" } });
}

export async function getBuyerTenders(buyerId: string) { return prisma.tender.findMany({ where: { buyerId }, include: { items: true, _count: { select: { bids: true } }, award: true }, orderBy: { createdAt: "desc" } }); }
export async function getSupplierBids(supplierId: string) { return prisma.tenderBid.findMany({ where: { supplierId }, include: { tender: true }, orderBy: { submittedAt: "desc" } }); }

export async function closeTender(tenderId: string) {
  const bids = await prisma.tenderBid.findMany({ where: { tenderId, status: "SUBMITTED" }, orderBy: [{ totalBidPaise: "asc" }, { submittedAt: "asc" }] });
  const winner = bids[0];
  return prisma.$transaction(async (tx) => {
    await tx.tender.update({ where: { id: tenderId }, data: { status: winner ? "AWARDED" : "CLOSED", evaluationReport: { rankedBidIds: bids.map((bid) => bid.id), evaluatedAt: new Date().toISOString() } } });
    if (!winner) return null;
    await tx.tenderBid.update({ where: { id: winner.id }, data: { status: "AWARDED", landedCostPaise: winner.totalBidPaise } });
    await tx.tenderBid.updateMany({ where: { tenderId, id: { not: winner.id } }, data: { status: "REJECTED" } });
    return tx.tenderAward.create({ data: { tenderId, bidId: winner.id, evaluationSnapshot: { winnerId: winner.id, landedCostPaise: winner.totalBidPaise } } });
  });
}

export { requireBuyer, requireSupplier }; 
