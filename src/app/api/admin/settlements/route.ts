import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createSettlementBatch, transitionSettlement } from "@/lib/settlements/service";

export async function GET() { await requireAdmin(); return NextResponse.json(await prisma.settlementBatch.findMany({ include: { vendor: { select: { businessName: true } }, payout: true }, orderBy: { createdAt: "desc" }, take: 100 })); }
export async function POST(request: Request) {
  const actor = await requireAdmin(); const body = await request.json();
  if (body.action === "approve" || body.action === "reject") return NextResponse.json(await transitionSettlement(String(body.batchId), body.action === "approve" ? "APPROVED" : "REJECTED", actor.id, body.reason));
  const vendorId = String(body.vendorId); const start = new Date(body.periodStart); const end = new Date(body.periodEnd);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || start >= end) return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  return NextResponse.json(await createSettlementBatch(vendorId, start, end));
}
