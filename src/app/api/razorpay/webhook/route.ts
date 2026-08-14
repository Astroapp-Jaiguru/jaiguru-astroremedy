import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

/**
 * POST /api/razorpay/webhook
 * Razorpay calls this with payment confirmation events
 * (payment.captured / order.paid). The signature is verified with the
 * configured webhook secret; on success the matching order is marked
 * PAID and moved to CONFIRMED.
 */
export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  const valid = await verifyWebhookSignature(bodyText, signature);
  if (!valid) {
    console.warn("[razorpay/webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string } } } };
  try {
    event = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventName = event.event ?? "";
  if (eventName !== "payment.captured" && eventName !== "order.paid") {
    return NextResponse.json({ received: true }); // acknowledge unrelated events
  }

  const entity = event.payload?.payment?.entity;
  const rzpOrderId = entity?.order_id;
  if (!rzpOrderId) {
    return NextResponse.json({ received: true, skipped: "no order id" });
  }

  try {
    const updated = await prisma.order.updateMany({
      where: { razorpayOrderId: rzpOrderId },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "RAZORPAY",
        razorpayPaymentId: entity.id ?? null,
        status: "CONFIRMED",
      },
    });
    console.log(
      `[razorpay/webhook] ${eventName} for ${rzpOrderId} -> ${updated.count} order(s) marked PAID`
    );
    return NextResponse.json({ received: true, updated: updated.count });
  } catch (e) {
    console.error("[razorpay/webhook] db update failed:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}