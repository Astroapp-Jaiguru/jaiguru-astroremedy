import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const schema = z.object({
  businessName: z.string().trim().min(2),
  contactPerson: z.string().trim().min(2),
  phone: z.string().trim().min(7),
  email: z.string().email(),
  gstNumber: z.string().trim().optional(),
  panNumber: z.string().trim().optional(),
  category: z.string().trim().min(2),
  businessType: z.string().trim().min(2),
  accountHolder: z.string().trim().min(2),
  accountNumber: z.string().trim().min(4),
  ifsc: z.string().trim().min(4),
  bankName: z.string().trim().min(2),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  const data = parsed.data;

  // Check if user exists
  const existing = await prisma.$queryRaw`
    SELECT id FROM "User" WHERE email = ${data.email} LIMIT 1
  `;

  if ((existing as any[]).length > 0) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);

  try {
    // Create user
    const user = await prisma.$queryRaw`
      INSERT INTO "User" (name, email, passwordhash, role, isactive, createdat, updatedat)
      VALUES (${data.contactPerson}, ${data.email}, ${passwordHash}, 'VENDOR', false, NOW(), NOW())
      RETURNING id
    `;
    const userId = (user as any)[0].id;

    // Create organization
    const organization = await prisma.$queryRaw`
      INSERT INTO "Organization" (name, type, isactive, createdat, updatedat)
      VALUES (${data.businessName}, 'VENDOR', false, NOW(), NOW())
      RETURNING id
    `;
    const organizationId = (organization as any)[0].id;

    // Create vendor
    await prisma.$queryRaw`
      INSERT INTO "Vendor" (organizationid, userid, businessname, contactperson, phone, gstnumber, pannumber, status, commissionrate, paymentmode, createdat, updatedat)
      VALUES (${organizationId}, ${userId}, ${data.businessName}, ${data.contactPerson}, ${data.phone}, ${data.gstNumber || null}, ${data.panNumber || null}, 'PENDING', 0, 'BANK_TRANSFER', NOW(), NOW())
    `;

    // Create bank account
    await prisma.$queryRaw`
      INSERT INTO "BankAccount" (organizationid, accounttype, bankname, encryptedblob, iv, authtag, isprimary, createdat, updatedat)
      VALUES (${organizationId}, 'CURRENT', ${data.bankName}, ${JSON.stringify({ accountHolder: data.accountHolder, accountNumber: data.accountNumber, ifsc: data.ifsc })}, 'pending', 'pending', false, NOW(), NOW())
    `;

    return NextResponse.json({ userId, status: "PENDING" }, { status: 201 });
  } catch (error) {
    console.error("Vendor registration error:", error);
    return NextResponse.json({ error: "Failed to create vendor account. Please try again." }, { status: 500 });
  }
}
