import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export const dynamic = "force-dynamic";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPG, WEBP, GIF or SVG images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Image must be 2 MB or smaller." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const row = await prisma.siteImage.create({
    data: {
      filename: file.name.slice(0, 200),
      mimeType: file.type,
      size: file.size,
      data: buffer,
    },
    select: { id: true },
  });

  return NextResponse.json({ url: `/api/site-images/${row.id}` });
}