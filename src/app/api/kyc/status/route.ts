import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ kycCaseId: z.string().min(1), status: z.enum(["APPROVED", "REJECTED", "HOLD"]), reason: z.string().max(500).optional() });
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN"].includes(user.role)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status request." }, { status: 400 });
  const { kycCaseId, status, reason } = parsed.data;
  const result = await prisma.kYCCase.update({ where: { id: kycCaseId }, data: { status, decision: reason ?? status, verifiedAt: status === "APPROVED" ? new Date() : null } });
  if (status === "APPROVED") await prisma.vendor.updateMany({ where: { organizationId: result.organizationId }, data: { status: "APPROVED", kycCompletedAt: new Date() } });
  return NextResponse.json({ status: result.status });
}
