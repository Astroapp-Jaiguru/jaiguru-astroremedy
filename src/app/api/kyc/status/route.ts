import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  kycCaseId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED", "HOLD"]),
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status request." }, { status: 400 });
  }

  const { kycCaseId, status, reason } = parsed.data;

  // Use raw query to update KYCCase
  const result = await prisma.$executeRaw`
    UPDATE "KYCCase" 
    SET status = ${status}, 
        decision = ${reason ?? status}, 
        verifiedat = ${status === "APPROVED" ? new Date() : null}
    WHERE id = ${Number(kycCaseId)}
  `;

  if (status === "APPROVED") {
    await prisma.$executeRaw`
      UPDATE "Vendor" 
      SET status = 'APPROVED', kyccompletedat = ${new Date()}
      WHERE organizationid = (SELECT organizationid FROM "KYCCase" WHERE id = ${Number(kycCaseId)})
    `;
  }

  return NextResponse.json({ status });
}
