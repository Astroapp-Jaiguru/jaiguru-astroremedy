"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { isOrderStatus, type OrderStatus } from "@/lib/orders/status";

/**
 * Admin Orders actions (scope: Orders & Leads module).
 */

export interface OrderFormState {
  error?: string;
  success?: boolean;
}

export async function updateOrderStatusAction(
  _state: OrderFormState | undefined,
  fd: FormData
): Promise<OrderFormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "").trim();
  const status = String(fd.get("status") ?? "").trim();
  if (!id) return { error: "Missing order id." };
  if (!isOrderStatus(status)) return { error: "Invalid status value." };

  try {
    await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });
  } catch (e) {
    console.error("[admin] updateOrderStatus failed:", e);
    return { error: "Could not update the order status. Please try again." };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { success: true };
}

export async function markOrderCompletedAction(
  id: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.order.update({
      where: { id },
      data: { status: "COMPLETED" },
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[admin] markOrderCompleted failed:", e);
    return { ok: false };
  }
}

export async function deleteOrderAction(
  id: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteOrder failed:", e);
    return { ok: false };
  }
}