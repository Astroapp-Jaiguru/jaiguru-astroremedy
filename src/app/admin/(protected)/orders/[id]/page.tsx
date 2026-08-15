import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Sparkles, Phone, CalendarDays, Clock, MessageSquareText, BadgeInfo, FileDown, ReceiptText, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { getSlipSettings } from "@/lib/orders/slip-settings";
import { DeleteButton } from "@/components/admin/delete-button";
import { OrderStatusForm } from "@/components/admin/orders/order-status-form";
import { MarkShippedDialog } from "@/components/admin/orders/mark-shipped-dialog";
import { SlipDownloadButton } from "@/components/admin/orders/slip-download-button";
import { SlipSettingsForm } from "@/components/admin/orders/slip-settings-form";
import { deleteOrderAction } from "@/lib/admin/orders/actions";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
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

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [order, slipSettings] = await Promise.all([
    prisma.order.findUnique({ where: { id } }),
    getSlipSettings(),
  ]);
  if (!order) notFound();

  const status = order.status as OrderStatus;
  const Icon = order.itemType === "PRODUCT" ? Package : Sparkles;

  const a = order.amount;
  const amountNum = typeof a === "number" ? a : Number.parseFloat(String(a ?? ""));
  const amountText = Number.isFinite(amountNum) && amountNum > 0
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amountNum)
    : "On Request";

  const rows = [
    { label: "Order ID", value: orderReference(order.id) },
    { label: "Customer Name", value: order.customerName },
    { label: "Phone", value: order.phone },
    { label: "WhatsApp", value: order.whatsappNumber ?? "—" },
    { label: "Email", value: order.email ?? "—" },
    { label: "Item Type", value: ORDER_TYPE_LABELS[order.itemType] },
    { label: "Item", value: order.itemName },
    { label: "Amount", value: order.amountLabel ?? amountText },
    { label: "Payment Method", value: order.paymentMethod ?? "—" },
    {
      label: "Payment Status",
      value: order.paymentStatus
        ? PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus
        : "—",
    },
    { label: "Preferred Date", value: order.preferredDate ?? "—" },
    { label: "Preferred Time", value: order.preferredTime ?? "—" },
    { label: "Preferred Mode", value: order.preferredMode ?? "—" },
    { label: "Birth Date", value: order.birthDate ?? "—" },
    { label: "Birth Time", value: order.birthTime ?? "—" },
    { label: "Birth Place", value: order.birthPlace ?? "—" },
    { label: "Delivery Address", value: order.deliveryAddress ?? "—" },
    {
      label: "City / State / Pincode",
      value:
        order.city || order.state || order.pincode
          ? [order.city, order.state, order.pincode].filter(Boolean).join(", ")
          : "—",
    },
    { label: "Courier", value: order.courierName ?? "—" },
    { label: "Tracking Number", value: order.trackingNumber ?? "—" },
    {
      label: "Tracking Sent",
      value: order.trackingSentAt ? formatDate(order.trackingSentAt) : "—",
    },
    { label: "Source", value: order.source },
    { label: "Received", value: formatDate(order.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/admin/orders">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold">
            {orderReference(order.id)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Order details · submitted {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[status]}`}
        >
          {ORDER_STATUS_LABELS[status]}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-4 w-4" />
            {order.itemName}
          </CardTitle>
          <CardDescription>
            Update the status as you confirm or complete this order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <dt className="text-sm text-muted-foreground">{r.label}</dt>
                <dd className="text-sm font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>

          {order.note ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              <BadgeInfo className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>{order.note}</span>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {order.phone}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {order.preferredDate ?? "Any date"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {order.preferredTime ?? "Any time"}
            </span>
            {order.whatsappNumber ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <MessageSquareText className="h-3.5 w-3.5" />
                WhatsApp: {order.whatsappNumber}
              </span>
            ) : null}
          </div>

          <OrderStatusForm id={order.id} status={order.status} />

          {order.itemType === "PRODUCT" && status !== "COMPLETED" ? (
            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <div className="flex-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  Shipping & Tracking
                </h2>
                {order.trackingUrl ? (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-300"
                  >
                    {order.courierName ?? "Courier"} · {order.trackingNumber} →
                    track the shipment
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.trackingNumber
                      ? `${order.courierName ?? "Courier"} · ${order.trackingNumber} (no link)`
                      : "Not shipped yet — send the tracking details to the customer."}
                  </p>
                )}
              </div>
              <MarkShippedDialog
                order={{
                  id: order.id,
                  customerName: order.customerName,
                  itemName: order.itemName,
                  phone: order.phone,
                  whatsappNumber: order.whatsappNumber,
                }}
                defaultCourier={order.courierName}
                defaultTrackingNumber={order.trackingNumber}
              />
            </div>
          ) : null}

          <div className="grid gap-5 border-t pt-4 lg:grid-cols-2">
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <FileDown className="h-4 w-4 text-muted-foreground" />
                Delivery Slip
              </h2>
              <p className="mb-3 text-xs text-muted-foreground">
                Generates a print-ready A4 PDF with the brand logo, customer
                and delivery details, item and amount, and tax information if
                enabled below.
              </p>
              <SlipDownloadButton
                id={order.id}
                reference={orderReference(order.id)}
              />
            </div>
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
                Tax Settings
              </h2>
              <SlipSettingsForm id={order.id} settings={slipSettings} />
            </div>
          </div>

          <div className="border-t pt-4">
            <DeleteButton
              id={order.id}
              action={deleteOrderAction}
              label="Delete Order"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}