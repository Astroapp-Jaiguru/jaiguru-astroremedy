import { NextResponse } from "next/server";
import { requireVendor } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireVendor();
  const vendor = await prisma.vendor.findFirst({ where: { organization: { ownerId: user.id } }, select: { id: true } });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  const batches = await prisma.settlementBatch.findMany({ where: { vendorId: vendor.id }, include: { items: true, payout: true }, orderBy: { periodEnd: "desc" } });
  const reserved = await prisma.vendorOrder.aggregate({ where: { vendorId: vendor.id, status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] } }, _sum: { payoutPaise: true } });
  return NextResponse.json({ batches, reservedPaise: reserved._sum.payoutPaise ?? 0 });
}
