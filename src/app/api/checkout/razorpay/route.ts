import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, createRazorpayClient } from "@/lib/payments/razorpay";
import { orderReference } from "@/lib/orders/status";

/**
 * POST /api/checkout/razorpay
 * Creates the DB order (status PENDING, paymentStatus PENDING) and a
 * Razorpay order for the checkout modal, then returns everything the
 * client needs to open the Razorpay checkout.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  const itemName = str(body.itemName, 200);
  if (!itemName) {
    return NextResponse.json({ error: "itemName is required" }, { status: 400 });
  }

  const amountRaw =
    typeof body.amount === "number" && Number.isFinite(body.amount)
      ? body.amount
      : Number.parseFloat(String(body.amount ?? "").replace(/[^\d.]/g, ""));
  const amount = Number.isFinite(amountRaw) && amountRaw > 0 ? amountRaw : null;
  if (amount === null) {
    return NextResponse.json({ error: "A valid amount is required" }, { status: 400 });
  }

  try {
    if (!(await createRazorpayClient())) {
      return NextResponse.json(
        { error: "Razorpay is not configured yet. Please pay via UPI for now." },
        { status: 503 }
      );
    }

    const customerName = str(body.customerName, 120) || "-";
    const phone = str(body.phone, 30) || "-";

    const order = await prisma.order.create({
      data: {
        customerName,
        phone,
        whatsappNumber: str(body.whatsappNumber, 30) || null,
        itemName,
        itemType: body.itemType === "PRODUCT" ? "PRODUCT" : "SERVICE",
        amount,
        amountLabel: str(body.amountLabel, 60) || null,
        deliveryAddress: str(body.deliveryAddress, 300) || null,
        city: str(body.city, 80) || null,
        state: str(body.state, 80) || null,
        pincode: str(body.pincode, 12) || null,
        paymentMethod: "RAZORPAY",
        paymentStatus: "PENDING",
        status: "PENDING",
        source: str(body.source, 40) || "checkout",
      },
    });

    const rzp = await createRazorpayOrder({
      amount,
      receipt: orderReference(order.id),
      notes: { dbOrderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzp.id },
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: rzp.id,
      amount: rzp.amount / 100,
      currency: rzp.currency,
    });
  } catch (e) {
    console.error("[checkout/razorpay] failed:", e);
    return NextResponse.json(
      { error: "Could not start the payment. Please try again or use UPI." },
      { status: 500 }
    );
  }
}
