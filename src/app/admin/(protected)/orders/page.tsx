import Link from "next/link";
import { Package, Sparkles, CheckCircle2, Eye, Send, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { DeleteButton } from "@/components/admin/delete-button";
import { CompleteOrderButton } from "@/components/admin/orders/complete-order-button";
import { MarkShippedDialog } from "@/components/admin/orders/mark-shipped-dialog";
import { deleteOrderAction } from "@/lib/admin/orders/actions";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_TYPE_LABELS,
  orderReference,
  type OrderStatus,
} from "@/lib/orders/status";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAmount(row: { amount: unknown; amountLabel: string | null }): string {
  if (row.amountLabel) return row.amountLabel;
  const a = row.amount;
  const n = typeof a === "number" ? a : Number.parseFloat(String(a ?? ""));
  return Number.isFinite(n) && n > 0
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n)
    : "On Request";
}

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  const marketplaceOrders = await prisma.marketplaceOrder.findMany({
    include: { vendorOrders: { include: { vendor: { select: { businessName: true } }, shipment: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Orders & Consultation Bookings</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"} · {pendingCount} pending ·
          recorded automatically when customers confirm a booking or order on the website
        </p>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product / Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No orders yet. When customers confirm a consultation booking or
                  product order on the website, they appear here automatically.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => {
                const status = o.status as OrderStatus;
                const Icon = o.itemType === "PRODUCT" ? Package : Sparkles;
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {orderReference(o.id)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.phone}</p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        {o.itemName}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {ORDER_TYPE_LABELS[o.itemType]}
                        {o.preferredDate ? ` · ${o.preferredDate}` : ""}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium">
                      {formatAmount(o)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[status]}`}
                      >
                        {ORDER_STATUS_LABELS[status]}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {o.paymentStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
                            <BadgeCheck className="h-3 w-3" /> PAID
                          </span>
                        ) : o.paymentStatus === "FAILED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                            Payment Failed
                          </span>
                        ) : null}
                        {o.trackingSentAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-300">
                            <Send className="h-3 w-3" /> Tracking Sent
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/orders/${o.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                        {status !== "COMPLETED" ? (
                          <>
                            {status !== "SHIPPED" && o.itemType === "PRODUCT" ? (
                              <MarkShippedDialog
                                order={{
                                  id: o.id,
                                  customerName: o.customerName,
                                  itemName: o.itemName,
                                  phone: o.phone,
                                  whatsappNumber: o.whatsappNumber,
                                }}
                                defaultCourier={o.courierName}
                                defaultTrackingNumber={o.trackingNumber}
                              />
                            ) : null}
                            <CompleteOrderButton
                              id={o.id}
                              label={
                                status === "PENDING" ? "Mark Completed" : "Completed"
                              }
                            />
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </span>
                        )}
                        <DeleteButton
                          id={o.id}
                          action={deleteOrderAction}
                          label="Delete"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border bg-background p-5">
        <h2 className="font-heading text-lg font-semibold">Marketplace orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">Multi-vendor orders, payment state, provider, and shipment tracking.</p>
        <div className="mt-4 flex flex-col gap-3">
          {marketplaceOrders.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No marketplace orders yet.</p> : marketplaceOrders.map((order) => (
            <div key={order.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-sm font-semibold">{order.id.slice(-10).toUpperCase()}</p><p className="text-sm text-muted-foreground">{order.customerName} · {order.city}, {order.state} · ₹{(order.totalPaise / 100).toFixed(2)}</p></div><span className="rounded-full border px-2.5 py-1 text-xs font-medium">{order.status.replaceAll("_", " ")}</span></div>
              <div className="mt-3 flex flex-wrap gap-2">{order.vendorOrders.map((vendorOrder) => <span key={vendorOrder.id} className="rounded-full bg-muted px-2.5 py-1 text-xs">{vendorOrder.vendor.businessName}: {vendorOrder.shipment?.status?.replaceAll("_", " ") ?? "Shipment pending"}{vendorOrder.shipment?.awbNumber ? ` · ${vendorOrder.shipment.awbNumber}` : ""}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
