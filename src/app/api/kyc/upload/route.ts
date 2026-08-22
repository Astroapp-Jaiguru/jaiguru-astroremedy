import { put } from "@vercel/blob";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";

const allowed = new Set(["image/jpeg", "image/png", "application/pdf"]);
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["VENDOR", "ADMIN", "EDITOR"].includes(user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const vendorId = String(form.get("vendorId") || "");
  const organizationId = String(form.get("organizationId") || "");
  const documentType = String(form.get("documentType") || "");
  if (!(file instanceof File) || !vendorId || !organizationId || !documentType) return NextResponse.json({ error: "Missing upload fields" }, { status: 400 });
  if (!allowed.has(file.type) || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Only JPG, PNG, and PDF files up to 10MB are accepted." }, { status: 400 });
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, include: { organization: true } });
  if (!vendor || vendor.organizationId !== organizationId || (user.role === "VENDOR" && vendor.organization.ownerId !== user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const blob = await put(`kyc-documents/${vendorId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, bytes, { access: "public", contentType: file.type });
  const kycCase = await prisma.kYCCase.findFirst({ where: { organizationId }, orderBy: { createdAt: "desc" } });
  if (!kycCase) return NextResponse.json({ error: "KYC case not found" }, { status: 404 });
  const document = await prisma.kYCDocument.create({ data: { kycCaseId: kycCase.id, documentType: documentType as never, storageKey: blob.pathname, sha256: createHash("sha256").update(bytes).digest("hex"), mimetype: file.type } });
  return NextResponse.json({ kycCaseId: kycCase.id, documentId: document.id, storageKey: blob.pathname, blobUrl: blob.url });
}
