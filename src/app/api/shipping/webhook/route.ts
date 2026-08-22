import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shippingProvider } from "@/lib/shipping/adapters";

export async function POST(request: NextRequest) {
  const providerName = request.nextUrl.searchParams.get("provider") === "DELHIVERY" ? "DELHIVERY" : "NIMBUSPOST";
  const payload = await request.json() as unknown;
  const normalized = shippingProvider(providerName).normalizeWebhook(payload);
  const trackingId = normalized.trackingId;
  if (!trackingId) return NextResponse.json({ ok: true, ignored: true });
  const shipment = await prisma.shipment.findFirst({ where: { OR: [{ awbNumber: trackingId }, { providerShipmentId: trackingId }] }, select: { id: true } });
  if (!shipment) return NextResponse.json({ ok: true, ignored: true });
  await prisma.$transaction(async (tx) => {
    await tx.shipmentEvent.createMany({ data: [{ shipmentId: shipment.id, eventKey: normalized.eventKey, status: normalized.status, rawPayload: payload as object }], skipDuplicates: true });
    await tx.shipment.update({ where: { id: shipment.id }, data: { status: normalized.status } });
  });
  return NextResponse.json({ ok: true });
}
