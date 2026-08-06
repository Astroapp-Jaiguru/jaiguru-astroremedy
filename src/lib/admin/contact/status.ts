/**
 * Contact message status helpers (admin Contact Messages module).
 */

export const REQUEST_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

/** Badge / dot colors per status. */
export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  NEW: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30",
  IN_PROGRESS: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
  RESOLVED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  CLOSED: "bg-slate-500/15 text-slate-500 dark:text-slate-300 border-slate-500/30",
};

export function isRequestStatus(value: string): value is RequestStatus {
  return (REQUEST_STATUSES as readonly string[]).includes(value);
}
