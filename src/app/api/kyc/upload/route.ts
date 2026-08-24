import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "VENDOR"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const vendorId = String(form.get("vendorId") ?? "");
  const organizationId = String(form.get("organizationId") ?? "");
  const documentType = String(form.get("documentType") ?? "");

  if (!(file instanceof File) || file.size > 10 * 1024 * 1024 || !allowed.has(file.type) || !vendorId || !organizationId || !documentType) {
    return NextResponse.json({ error: "Invalid file or missing fields." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");

  // Use raw query to create or update KYCCase
  const kycCase = await prisma.$queryRaw`
    INSERT INTO "KYCCase" (organizationid, provider, providercaseid, status, createdat, updatedat)
    VALUES (${Number(organizationId)}, 'internal', ${vendorId}, 'PENDING', NOW(), NOW())
    ON CONFLICT (provider, providercaseid) 
    DO UPDATE SET updatedat = NOW()
    RETURNING id
  `;

  const kycCaseId = (kycCase as any)[0].id;

  // Use raw query to create KYCDocument
  const document = await prisma.$queryRaw`
    INSERT INTO "KYCDocument" (kyccaseid, documenttype, storagekey, sha256, mimetype, verificationstatus, createdat, updatedat)
    VALUES (${kycCaseId}, ${documentType}, ${`kyc-documents/${kycCaseId}/${sha256}-${file.name}`}, ${sha256}, ${file.type}, 'PENDING', NOW(), NOW())
    RETURNING id, storagekey
  `;

  const doc = (document as any)[0];

  return NextResponse.json({
    kycCaseId,
    documentId: doc.id,
    storageKey: doc.storagekey,
    blobUrl: null,
  }, { status: 201 });
}
