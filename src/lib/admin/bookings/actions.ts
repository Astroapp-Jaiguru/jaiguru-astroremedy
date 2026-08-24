"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { BOOKING_SLOTS_30 } from "@/lib/booking";

/**
 * Admin booking-block actions (scope: booking calendar).
 * A block is per date; allDay=true blocks the whole day, otherwise the
 * listed time slots are blocked. One block per date (upsert).
 */

export interface BookingBlockState {
  error?: string;
  success?: boolean;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function upsertBookingBlockAction(
  _state: BookingBlockState | undefined,
  fd: FormData
): Promise<BookingBlockState> {
  await requireAdmin();

  const dateKey = String(fd.get("date") ?? "").trim();
  if (!DATE_RE.test(dateKey)) return { error: "Invalid date." };

  const allDay = fd.get("allDay") === "on";
  const rawSlots = String(fd.get("timeSlots") ?? "");
  let timeSlots: string[] = [];
  try {
    timeSlots = JSON.parse(rawSlots) as string[];
  } catch {
    timeSlots = [];
  }
  timeSlots = timeSlots.filter((s) => BOOKING_SLOTS_30.includes(s));
  const reason = String(fd.get("reason") ?? "").trim() || null;
  const id = String(fd.get("id") ?? "").trim() || null;

  const date = new Date(`${dateKey}T00:00:00.000Z`);

  try {
    if (id) {
      await prisma.bookingBlock.update({
        where: { id },
        data: { date, allDay, timeSlots, reason },
      });
    } else {
      const existing = await prisma.bookingBlock.findFirst({ where: { date } });
      if (existing) {
        await prisma.bookingBlock.update({
          where: { id: existing.id },
          data: { allDay, timeSlots, reason },
        });
      } else {
        await prisma.bookingBlock.create({
          data: { date, allDay, timeSlots, reason },
        });
      }
    }
  } catch (e) {
    console.error("[admin] upsertBookingBlock failed:", e);
    return { error: "Could not save the block. Please try again." };
  }

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function deleteBookingBlockAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.bookingBlock.delete({ where: { id } });
    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteBookingBlock failed:", e);
    return { ok: false };
  }
}
