import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { getSlipSettings } from "@/lib/orders/slip-settings";
import { buildDeliverySlipPdf } from "@/lib/orders/slip-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const [settings, brandingRow] = await Promise.all([
    getSlipSettings(),
    prisma.siteSetting.findUnique({ where: { key: "branding" } }),
  ]);

  const branding = brandingRow?.value as Record<string, unknown> | null;
  const siteName =
    typeof branding?.siteName === "string" && branding.siteName.trim()
      ? branding.siteName.trim()
      : "JAIGURU ASTROREMEDY";
  const tagline = typeof branding?.tagline === "string" ? branding.tagline : "";
  const logo = typeof branding?.logo === "string" ? branding.logo : null;

  let logoBytes: Uint8Array | undefined;
  let logoMime: string | undefined;
  if (logo) {
    const match = logo.match(/^\/api\/site-images\/([a-zA-Z0-9]+)$/);
    if (match) {
      const image = await prisma.siteImage.findUnique({
        where: { id: match[1] },
        select: { data: true, mimeType: true },
      });
      if (image?.data) {
        logoBytes = new Uint8Array(image.data);
        logoMime = image.mimeType;
      }
    }
  }

  const amountNum =
    order.amount == null
      ? null
      : typeof order.amount === "number"
        ? order.amount
        : Number.parseFloat(String(order.amount));

  const pdf = await buildDeliverySlipPdf({
    order: {
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      whatsappNumber: order.whatsappNumber,
      itemName: order.itemName,
      itemType: order.itemType,
      amount: Number.isFinite(amountNum) ? amountNum : null,
      amountLabel: order.amountLabel,
      status: order.status,
      source: order.source,
      createdAt: order.createdAt,
      deliveryAddress: order.deliveryAddress,
    },
    siteName,
    tagline,
    logoBytes,
    logoMime,
    settings,
  });

  const filename = `delivery-slip-${id.slice(-6).toUpperCase()}.pdf`;
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}