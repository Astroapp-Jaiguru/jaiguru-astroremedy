"use server";

import { prisma } from "@/lib/prisma";

/**
 * Public order recorder.
 * Called (fire-and-forget) from the consultation booking modal, the 3-step
 * checkout modal and the product payment popup so every order / booking
 * shows up in Admin → Orders. Never throws — the checkout flow must not
 * break because a lead record fails.
 */

export interface RecordOrderInput {
  customerName?: string;
  phone?: string;
  whatsappNumber?: string;
  itemName: string;
  itemType: "SERVICE" | "PRODUCT";
  amount?: string | number | null;
  amountLabel?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  deliveryAddress?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  source?: string;
}

export async function recordOrderAction(
  input: RecordOrderInput
): Promise<{ ok: boolean }> {
  const itemName = String(input.itemName ?? "").trim().slice(0, 200);
  if (!itemName) return { ok: false };

  const customerName = String(input.customerName ?? "").trim().slice(0, 120) || "-";
  const phone = String(input.phone ?? "").trim().slice(0, 30) || "-";

  const amountNum =
    typeof input.amount === "number" && Number.isFinite(input.amount)
      ? input.amount
      : Number.parseFloat(String(input.amount ?? "").replace(/[^\d.]/g, ""));
  const amount =
    Number.isFinite(amountNum) && amountNum > 0 ? amountNum : null;

  try {
    await prisma.order.create({
      data: {
        customerName,
        phone,
        whatsappNumber: input.whatsappNumber?.trim().slice(0, 30) || null,
        itemName,
        itemType: input.itemType === "PRODUCT" ? "PRODUCT" : "SERVICE",
        amount,
        amountLabel: input.amountLabel?.trim().slice(0, 60) || null,
        preferredDate: input.preferredDate?.trim() || null,
        preferredTime: input.preferredTime?.trim() || null,
        deliveryAddress: input.deliveryAddress?.trim().slice(0, 300) || null,
        city: input.city?.trim().slice(0, 80) || null,
        state: input.state?.trim().slice(0, 80) || null,
        pincode: input.pincode?.trim().slice(0, 12) || null,
        paymentMethod: input.paymentMethod?.trim().slice(0, 20) || null,
        paymentStatus: input.paymentStatus?.trim().slice(0, 20) || null,
        source: input.source?.trim().slice(0, 40) || "website",
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[orders] recordOrderAction failed:", e);
    return { ok: false };
  }
}