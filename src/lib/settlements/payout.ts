import "server-only";
import { prisma } from "@/lib/prisma";

export interface PayoutProvider { createPayout(input: { idempotencyKey: string; amountPaise: number; vendorId: string }): Promise<{ providerPayoutId: string }>; }
export class ManualPayoutProvider implements PayoutProvider { async createPayout(input: { idempotencyKey: string; amountPaise: number; vendorId: string }) { return { providerPayoutId: `manual_${input.idempotencyKey}` }; } }
export class RazorpayRouteProvider implements PayoutProvider { async createPayout(_input: { idempotencyKey: string; amountPaise: number; vendorId: string }): Promise<{ providerPayoutId: string }> { throw new Error("Razorpay Route is not configured; use manual payout until route credentials are enabled"); } }

export async function createPayoutForBatch(batchId: string, provider: PayoutProvider = new ManualPayoutProvider()) {
  const batch = await prisma.settlementBatch.findUniqueOrThrow({ where: { id: batchId }, include: { payout: true } });
  if (batch.status !== "APPROVED") throw new Error("Only approved settlements can be paid");
  if (batch.payout?.status === "PAID") return batch.payout;
  const payout = await prisma.payout.upsert({ where: { batchId }, update: { attemptCount: { increment: 1 }, status: "PROCESSING" }, create: { batchId, idempotencyKey: `settlement_${batchId}`, amountPaise: batch.payablePaise, status: "PROCESSING" } });
  try {
    const result = await provider.createPayout({ idempotencyKey: payout.idempotencyKey, amountPaise: payout.amountPaise, vendorId: batch.vendorId });
    return prisma.$transaction([prisma.payout.update({ where: { id: payout.id }, data: { status: "PAID", providerPayoutId: result.providerPayoutId, processedAt: new Date() } }), prisma.settlementBatch.update({ where: { id: batchId }, data: { status: "PAID", paidAt: new Date() } })]);
  } catch (error) {
    return prisma.payout.update({ where: { id: payout.id }, data: { status: "FAILED", failureReason: error instanceof Error ? error.message : "Payout failed", nextRetryAt: new Date(Date.now() + Math.min(86400000, 2 ** payout.attemptCount * 60000)) } });
  }
}
