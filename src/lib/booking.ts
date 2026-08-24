/**
 * Booking system shared helpers (pure, no I/O).
 * Slot window: 07:00 AM – 12:00 PM, Monday through Sunday, 30-minute steps.
 * Slot starts are always on :00/:30 and must finish at or before 12:00 PM.
 */

export const BOOKING_WINDOW_START = "07:00";
export const BOOKING_WINDOW_END = "12:00";

/** All 30-minute slot starts inside the window. */
export const BOOKING_SLOTS_30 = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
];

/** Slot starts valid for a given duration (minutes): start + duration <= 12:00. */
export function slotStartsForDuration(durationMinutes: number): string[] {
  const end = toMinutes(BOOKING_WINDOW_END);
  return BOOKING_SLOTS_30.filter(
    (s) => toMinutes(s) + (durationMinutes || 60) <= end
  );
}

/** Default slot duration used when a service has no explicit slot duration. */
export const DEFAULT_SLOT_DURATION = 60;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** "07:00" -> "7:00 AM" */
export function formatSlot12h(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** "07:00" + 60 -> "8:00 AM" */
export function slotEnd12h(slot: string, durationMinutes: number): string {
  return formatSlot12h(minutesToHhmm(toMinutes(slot) + (durationMinutes || 60)));
}

export function minutesToHhmm(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Local date -> "yyyy-mm-dd" key used by the calendar & BookingBlock. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "yyyy-mm-dd" -> local Date at midnight. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "yyyy-mm-dd" -> "Mon, 09 Aug 2026" */
export function formatDateKeyLong(key: string): string {
  const d = fromDateKey(key);
  const day = d.toLocaleDateString("en-IN", { weekday: "short" });
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${day}, ${date}`;
}

/** Number of whole days between key dates (a - b). */
export function daysBetween(a: string, b: string): number {
  const da = fromDateKey(a);
  const db = fromDateKey(b);
  return Math.round(
    (da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export const SLOT_DURATION_OPTIONS = [
  { value: "30", label: "30 mins" },
  { value: "45", label: "45 mins" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
];

export function durationLabel(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0)
    return `${minutes / 60} hour${minutes / 60 > 1 ? "s" : ""}`;
  return `${minutes} mins`;
}
