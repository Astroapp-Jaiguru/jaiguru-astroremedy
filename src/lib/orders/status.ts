/**
 * Order status helpers (admin Orders module).
 */

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Badge colors per order status. */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30",
  CONFIRMED: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
};

export const ORDER_TYPE_LABELS: Record<"SERVICE" | "PRODUCT", string> = {
  SERVICE: "Service",
  PRODUCT: "Product",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Short human-friendly order reference from a record id. */
export function orderReference(id: string): string {
  return `ORD-${id.slice(-6).toUpperCase()}`;
}