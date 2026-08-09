"use server";

import { prisma } from "@/lib/prisma";
import {
  slotStartsForDuration,
  toDateKey,
  fromDateKey,
} from "@/lib/booking";
/**
 * Public booking availability (no auth — used by the booking modal).
 * Reads BookingBlock rows: a whole-day block empties the day, a slot block
 * removes only the listed time slots. Dates are stored at UTC midnight and
 * compared by "yyyy-mm-dd" key to stay timezone-stable.
 */

function utcMidnight(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

function keyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Available slot starts for a date key + duration (empty when fully blocked). */
export async function getAvailableSlotsForDate(
  dateKey: string,
  durationMinutes: number
): Promise<string[]> {
  try {
    const block = await prisma.bookingBlock.findFirst({
      where: { date: utcMidnight(dateKey) },
    });
    if (block?.allDay) return [];
    const blocked = new Set(block?.timeSlots ?? []);
    return slotStartsForDuration(durationMinutes).filter((s) => !blocked.has(s));
  } catch (e) {
    console.error("[booking] getAvailableSlotsForDate failed:", e);
    return [];
  }
}

/** Date keys (from today) that still have at least one free slot. */
export async function getAvailableDates(
  daysAhead: number,
  durationMinutes: number
): Promise<string[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = utcMidnight(toDateKey(today));
    const to = new Date(from);
    to.setUTCDate(to.getUTCDate() + daysAhead);

    const blocks = await prisma.bookingBlock.findMany({
      where: { date: { gte: from, lte: to } },
    });
    const byKey = new Map(
      blocks.map((b) => [keyOf(b.date), b as { allDay: boolean; timeSlots: string[] }])
    );

    const starts = new Set(slotStartsForDuration(durationMinutes));
    const available: string[] = [];
    for (let i = 0; i < daysAhead; i++) {
      const d = new Date(from);
      d.setUTCDate(d.getUTCDate() + i);
      const key = keyOf(d);
      const block = byKey.get(key);
      if (block?.allDay) continue;
      const blocked = new Set(block?.timeSlots ?? []);
      const free = starts.size - new Set([...starts].filter((s) => blocked.has(s))).size;
      if (free > 0) available.push(key);
    }
    return available;
  } catch (e) {
    console.error("[booking] getAvailableDates failed:", e);
    return [];
  }
}

export { fromDateKey };
