import { NextResponse } from "next/server";
import { requireVendor } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireVendor();
    const vendor = await prisma.vendor.findFirst({ where: { organization: { ownerId: user.id }, status: "APPROVED" }, select: { id: true } });
    if (!vendor) return NextResponse.json({ error: "Approved vendor access required." }, { status: 403 });
    const orders = await prisma.vendorOrder.findMany({ where: { vendorId: vendor.id }, include: { marketplaceOrder: { select: { id: true, customerName: true, pincode: true, city: true, state: true, paymentStatus: true, status: true, createdAt: true } }, items: true, shipment: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load orders." }, { status: 401 });
  }
}
