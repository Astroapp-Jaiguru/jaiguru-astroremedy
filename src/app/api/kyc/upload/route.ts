import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]);
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "VENDOR"].includes(user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const vendorId = String(form.get("vendorId") ?? "");
  const organizationId = String(form.get("organizationId") ?? "");
  const documentType = String(form.get("documentType") ?? "");
  if (!(file instanceof File) || file.size > 10 * 1024 * 1024 || !allowed.has(file.type) || !vendorId || !organizationId || !documentType) return NextResponse.json({ error: "Invalid file or missing fields." }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const kycCase = await prisma.kYCCase.upsert({ where: { provider_providerCaseId: { provider: "internal", providerCaseId: vendorId } }, update: {}, create: { organizationId, provider: "internal", providerCaseId: vendorId, status: "PENDING" } });
  const document = await prisma.kYCDocument.create({ data: { kycCaseId: kycCase.id, documentType, storageKey: `kyc-documents/${kycCase.id}/${sha256}-${file.name}`, sha256, mimetype: file.type } });
  return NextResponse.json({ kycCaseId: kycCase.id, documentId: document.id, storageKey: document.storageKey, blobUrl: null }, { status: 201 });
}
