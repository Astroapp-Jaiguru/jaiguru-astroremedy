import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference")?.trim();
  if (!reference) return NextResponse.json({ error: "Reference is required" }, { status: 400 });
  const order = await prisma.order.findFirst({ where: { OR: [{ id: reference }, { trackingNumber: reference }] }, select: { status: true, trackingNumber: true, trackingUrl: true } });
  if (order) return NextResponse.json(order);
  const shipment = await prisma.shipment.findFirst({
    where: { OR: [{ awbNumber: reference }, { providerShipmentId: reference }, { marketplaceOrderId: reference }] },
    select: { status: true, awbNumber: true, trackingUrl: true, provider: true },
  });
  if (!shipment) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ status: shipment.status, trackingNumber: shipment.awbNumber, trackingUrl: shipment.trackingUrl, provider: shipment.provider });
}
