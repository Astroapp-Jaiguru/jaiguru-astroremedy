import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  if (!["APPROVED", "REJECTED", "HOLD"].includes(body.status) || !body.kycCaseId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const kyc = await prisma.kYCCase.findUnique({ where: { id: body.kycCaseId }, include: { organization: { include: { vendors: true } } } });
  if (!kyc) return NextResponse.json({ error: "KYC case not found" }, { status: 404 });
  const status = body.status as "APPROVED" | "REJECTED" | "HOLD";
  await prisma.$transaction([prisma.kYCCase.update({ where: { id: kyc.id }, data: { status, decision: status, verifiedAt: status === "APPROVED" ? new Date() : null, reasonCodes: body.reason ? { reason: String(body.reason).slice(0, 500) } : undefined } }), prisma.vendor.updateMany({ where: { organizationId: kyc.organizationId }, data: { status: status === "APPROVED" ? "APPROVED" : status, kycCompletedAt: status === "APPROVED" ? new Date() : null, rejectionReason: status === "REJECTED" ? String(body.reason || "Documents require correction.") : null, adminNotes: status === "HOLD" ? String(body.reason || "Application is on hold.") : null } }), ...(status === "APPROVED" ? [prisma.user.updateMany({ where: { id: kyc.organization.ownerId || undefined }, data: { isActive: true } })] : [])]);
  return NextResponse.json({ success: true });
}
