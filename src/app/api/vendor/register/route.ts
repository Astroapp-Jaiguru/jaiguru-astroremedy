import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const schema = z.object({ businessName: z.string().trim().min(2), contactPerson: z.string().trim().min(2), phone: z.string().trim().min(7), email: z.string().email(), gstNumber: z.string().trim().optional(), panNumber: z.string().trim().optional(), category: z.string().trim().min(2), businessType: z.string().trim().min(2), accountHolder: z.string().trim().min(2), accountNumber: z.string().trim().min(4), ifsc: z.string().trim().min(4), bankName: z.string().trim().min(2) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  const data = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { name: data.contactPerson, email: data.email, phone: data.phone, passwordHash, role: "VENDOR", isActive: false } });
    const organization = await tx.organization.create({ data: { name: data.businessName, type: "VENDOR", isActive: false } });
    await tx.vendor.create({ data: { organizationId: organization.id, userId: user.id, businessName: data.businessName, contactPerson: data.contactPerson, phone: data.phone, gstNumber: data.gstNumber || null, panNumber: data.panNumber || null } });
    await tx.bankAccount.create({ data: { organizationId: organization.id, accountType: "CURRENT", bankName: data.bankName, encryptedBlob: JSON.stringify({ accountHolder: data.accountHolder, accountNumber: data.accountNumber, ifsc: data.ifsc }), iv: "pending", authTag: "pending" } });
    return user.id;
  });
  return NextResponse.json({ userId: result, status: "PENDING" }, { status: 201 });
}
