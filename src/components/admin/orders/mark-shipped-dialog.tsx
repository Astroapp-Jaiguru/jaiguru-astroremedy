"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MessageCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderShippingAction } from "@/lib/admin/orders/actions";
import { orderReference } from "@/lib/orders/status";

/**
 * Couriers with tracking-URL builders. `"OTHER"` keeps the URL field editable
 * so the admin can paste a custom tracking link.
 */
export const COURIER_OPTIONS: {
  name: string;
  url: (trackingNumber: string) => string | null;
}[] = [
  { name: "India Post", url: (tn) => `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?ContentId=0&TrackId=${encodeURIComponent(tn)}` },
  { name: "Delhivery", url: (tn) => `https://www.delhivery.com/track/package/${encodeURIComponent(tn)}` },
  { name: "Blue Dart", url: (tn) => `https://www.bluedart.com/tracking?action=Track&trackNo=${encodeURIComponent(tn)}` },
  { name: "DTDC", url: (tn) => `https://www.dtdc.in/tracking.asp?strCnno=${encodeURIComponent(tn)}&TrkType=awb` },
  { name: "XpressBees", url: (tn) => `https://ship.xpressbees.com/track/${encodeURIComponent(tn)}` },
  { name: "Ekart", url: (tn) => `https://ekartlogistics.com/track/${encodeURIComponent(tn)}` },
  { name: "Shadowfax", url: (tn) => `https://www.shadowfax.in/tracking?tracking_id=${encodeURIComponent(tn)}` },
  { name: "Shiprocket", url: (tn) => `https://shiprocket.co/tracking/${encodeURIComponent(tn)}` },
  { name: "Amazon Shipping (ATS)", url: (tn) => `https://www.amazon.in/help/tracking?trackingId=${encodeURIComponent(tn)}` },
  { name: "FedEx", url: (tn) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(tn)}` },
  { name: "Speed Post (India Post)", url: (tn) => `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?ContentId=0&TrackId=${encodeURIComponent(tn)}` },
  { name: "OTHER (custom tracking link)", url: () => null },
];

export function buildTrackingUrl(courierName: string, trackingNumber: string): string {
  const courier = COURIER_OPTIONS.find((c) => c.name === courierName);
  if (!courier || !trackingNumber) return "";
  return courier.url(trackingNumber) ?? "";
}

export function shippingMessage(opts: {
  orderId: string;
  customerName?: string | null;
  itemName: string;
  courierName: string;
  trackingUrl: string;
  trackingNumber: string;
}): string {
  const ref = orderReference(opts.orderId);
  const url = opts.trackingUrl
    ? `Tracking: ${opts.trackingUrl}`
    : `Tracking Number: ${opts.trackingNumber}`;
  return [
    `Namaste ${opts.customerName ?? ""}`.trim(),
    "",
    `Good news! Your order "${opts.itemName}" (${ref}) has been shipped via ${opts.courierName}.`,
    "",
    url,
    "",
    "Thanks for choosing JAIGURU ASTROREMEDY.",
  ].join("\n");
}

interface Props {
  order: {
    id: string;
    customerName: string | null;
    itemName: string;
    phone: string | null;
    whatsappNumber: string | null;
  };
  defaultCourier?: string | null;
  defaultTrackingNumber?: string | null;
}

export function MarkShippedDialog({ order, defaultCourier, defaultTrackingNumber }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [courierName, setCourierName] = useState(defaultCourier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(defaultTrackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = useState(
    defaultTrackingNumber && defaultCourier
      ? buildTrackingUrl(defaultCourier, defaultTrackingNumber)
      : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onCourierChange(value: string) {
    setCourierName(value);
    setTrackingUrl(buildTrackingUrl(value, trackingNumber));
  }

  function onTrackingChange(value: string) {
    setTrackingNumber(value);
    setTrackingUrl(buildTrackingUrl(courierName, value));
  }

  const message = useMemo(
    () =>
      shippingMessage({
        orderId: order.id,
        customerName: order.customerName,
        itemName: order.itemName,
        courierName,
        trackingUrl,
        trackingNumber,
      }),
    [order, courierName, trackingUrl, trackingNumber]
  );

  const waNumber = order.whatsappNumber ?? order.phone ?? "";
  const waLink = `https://wa.me/${waNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  function submit(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderShippingAction(undefined, fd);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not save.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-sky-500/40 text-sky-600 hover:bg-sky-500/10 dark:text-sky-300"
        >
          <Truck className="mr-1 h-3.5 w-3.5" />
          Mark Shipped
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-sky-500" />
            Mark as Shipped
          </DialogTitle>
          <DialogDescription>
            Add the courier details — the customer is then sent the tracking link
            automatically on WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form action={submit}>
          <input type="hidden" name="id" value={order.id} />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="courier">Courier / Postal Service</Label>
              <Select value={courierName} onValueChange={onCourierChange} name="courierName">
                <SelectTrigger id="courier">
                  <SelectValue placeholder="Select courier" />
                </SelectTrigger>
                <SelectContent>
                  {COURIER_OPTIONS.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trackingNumber">Tracking / AWB Number</Label>
              <Input
                id="trackingNumber"
                name="trackingNumber"
                value={trackingNumber}
                onChange={(e) => onTrackingChange(e.target.value)}
                placeholder="e.g. EK4200123456IN"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trackingUrl">Tracking Link (auto-filled, editable)</Label>
              <Input
                id="trackingUrl"
                name="trackingUrl"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
                WhatsApp message to send
              </p>
              <p className="whitespace-pre-wrap rounded bg-background p-2 text-xs leading-relaxed text-muted-foreground">
                {message}
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
              >
                <MessageCircle className="h-3 w-3" />
                Open WhatsApp
              </a>
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || !courierName || !trackingNumber}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {pending ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              )}
              Save & Mark Shipped
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
