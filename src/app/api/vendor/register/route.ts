import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { randomUUID, createCipheriv, randomBytes } from "node:crypto";

function encrypt(value: string) {
  const key = Buffer.from((process.env.AUTH_SECRET || "development-secret").padEnd(32, "0").slice(0, 32));
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  return `${iv.toString("hex")}:${Buffer.concat([cipher.update(value, "utf8"), cipher.final()]).toString("hex")}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["businessName", "contactPerson", "phone", "email", "categoryId", "accountHolderName", "accountNumber", "ifscCode"];
    if (required.some((key) => !String(body[key] || "").trim())) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    const email = String(body.email).trim().toLowerCase();
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });
      if (existing) throw new Error("An account with this email already exists.");
      const user = await tx.user.create({ data: { name: body.contactPerson, email, phone: body.phone, role: "VENDOR", isActive: false } });
      const organization = await tx.organization.create({ data: { name: body.businessName, type: "VENDOR", ownerId: user.id, isActive: false } });
      const vendor = await tx.vendor.create({ data: { organizationId: organization.id, businessName: body.businessName, contactPerson: body.contactPerson, phone: body.phone, email, categoryId: body.categoryId, businessType: body.businessType || null, gstNumber: body.gstNumber || null, panNumber: body.panNumber || null, paymentMode: "A" } });
      await tx.bankAccount.create({ data: { organizationId: organization.id, accountType: "CURRENT", bankName: body.bankName || "Not provided", encryptedBlob: encrypt(JSON.stringify({ accountHolderName: body.accountHolderName, accountNumber: body.accountNumber, ifscCode: body.ifscCode })), iv: "managed", authTag: "managed", isPrimary: true } });
      await tx.kYCCase.create({ data: { organizationId: organization.id, provider: "internal", providerCaseId: randomUUID(), status: "PENDING" } });
      return { user, vendor };
    });
    await createSession({ userId: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role });
    return NextResponse.json({ success: true, vendorId: result.vendor.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit application." }, { status: 400 });
  }
}
