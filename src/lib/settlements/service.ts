import "server-only";
import { prisma } from "@/lib/prisma";
import { MarketplaceOrderStatus } from "@/generated/prisma/enums";

const eligible = { status: { in: [MarketplaceOrderStatus.PAID, MarketplaceOrderStatus.DELIVERED] } };

export async function calculateVendorSettlement(vendorId: string, periodStart: Date, periodEnd: Date) {
  const orders = await prisma.vendorOrder.findMany({ where: { vendorId, ...eligible, createdAt: { gte: periodStart, lt: periodEnd } }, orderBy: { id: "asc" } });
  const items = orders.map((order) => ({ vendorOrderId: order.id, grossPaise: order.subtotalPaise, commissionPaise: order.commissionPaise, refundPaise: 0, netPaise: Math.max(0, order.payoutPaise || order.subtotalPaise - order.commissionPaise) }));
  const grossPaise = items.reduce((sum, item) => sum + item.grossPaise, 0);
  const commissionPaise = items.reduce((sum, item) => sum + item.commissionPaise, 0);
  const refundsPaise = items.reduce((sum, item) => sum + item.refundPaise, 0);
  const netPaise = items.reduce((sum, item) => sum + item.netPaise, 0);
  return { items, grossPaise, commissionPaise, refundsPaise, netPaise, reservedPaise: 0, payablePaise: netPaise };
}

export async function createSettlementBatch(vendorId: string, periodStart: Date, periodEnd: Date) {
  const calculated = await calculateVendorSettlement(vendorId, periodStart, periodEnd);
  return prisma.settlementBatch.upsert({ where: { vendorId_periodStart_periodEnd: { vendorId, periodStart, periodEnd } }, update: { grossPaise: calculated.grossPaise, commissionPaise: calculated.commissionPaise, refundsPaise: calculated.refundsPaise, netPaise: calculated.netPaise, reservedPaise: calculated.reservedPaise, payablePaise: calculated.payablePaise }, create: { vendorId, periodStart, periodEnd, grossPaise: calculated.grossPaise, commissionPaise: calculated.commissionPaise, refundsPaise: calculated.refundsPaise, netPaise: calculated.netPaise, reservedPaise: calculated.reservedPaise, payablePaise: calculated.payablePaise, items: { create: calculated.items } }, include: { items: true, payout: true } });
}

export async function createBalancedLedger(input: { idempotencyKey: string; description: string; referenceType: string; referenceId: string; debitAccount: string; creditAccount: string; amountPaise: number }) {
  if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise <= 0) throw new Error("Ledger amount must be a positive integer in paise");
  return prisma.ledgerTransaction.upsert({ where: { idempotencyKey: input.idempotencyKey }, update: {}, create: { idempotencyKey: input.idempotencyKey, description: input.description, referenceType: input.referenceType, referenceId: input.referenceId, totalPaise: input.amountPaise, entries: { create: [{ account: input.debitAccount, type: "DEBIT", amountPaise: input.amountPaise }, { account: input.creditAccount, type: "CREDIT", amountPaise: input.amountPaise }] } }, include: { entries: true } });
}

export async function transitionSettlement(batchId: string, status: "APPROVED" | "REJECTED", actorId: string, rejectionReason?: string) {
  return prisma.$transaction(async (tx) => {
    const batch = await tx.settlementBatch.findUniqueOrThrow({ where: { id: batchId } });
    if (batch.status !== "PENDING") return batch;
    const updated = await tx.settlementBatch.update({ where: { id: batchId }, data: { status, approvedAt: status === "APPROVED" ? new Date() : null, approvedBy: status === "APPROVED" ? actorId : null, rejectionReason } });
    await tx.auditLog.create({ data: { actorId, action: `SETTLEMENT_${status}`, entityType: "SettlementBatch", entityId: batchId, beforeData: batch, afterData: updated } });
    return updated;
  });
}
