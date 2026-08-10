"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  Check,
  Copy,
  Info,
  Loader2,
  QrCode,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { whatsappLink } from "@/config/site";
import { buildUpiUri, extractAmount } from "@/lib/upi";
import { recordOrderAction } from "@/lib/orders/record";

/**
 * Payment popup (UPI). Opens when a product "Order" or service "Book"
 * button is clicked instead of jumping straight to WhatsApp. Offers:
 * 1) auto UPI intent link (PhonePe / Google Pay), 2) manual UPI ID +
 * copy, 3) dynamic QR to scan on desktop, and 4) a WhatsApp fallback that
 * re-sends the pre-filled order/book message (now with UPI instructions).
 *
 * All values (UPI ID, amount) are props from the server; the modal is fully
 * driven by the admin "UPI ID" setting, so changing it updates every page.
 */

export interface PaymentButtonProps {
  label: string;
  className?: string;
  icon?: ReactNode;
  itemName: string;
  priceLabel: string;
  price?: string | number | null;
  upiId: string;
  whatsappNumber: string;
  whatsappMessage: string;
}

export function PaymentButton(props: PaymentButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          props.className ??
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-whatsapp px-6 py-3 text-sm font-bold text-white shadow-lg shadow-whatsapp/25 transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
        }
      >
        {props.icon}
        {props.label}
      </button>
      {open ? <PaymentModal {...props} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function PaymentModal(
  props: PaymentButtonProps & { onClose: () => void }
) {
  const { itemName, priceLabel, upiId, whatsappMessage, whatsappNumber, onClose } =
    props;
  const am = extractAmount(props.price ?? priceLabel);
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const upiUri = buildUpiUri({
    pa: upiId,
    am,
    tn: itemName,
    cu: "INR",
  });
  const waHref = whatsappLink(whatsappMessage, whatsappNumber);

  useEffect(() => {
    let cancelled = false;
    if (!upiId) return;
    import("qrcode")
      .then((m) => {
        const gen = m.default ?? m;
        return gen.toDataURL(upiUri, { width: 340, margin: 1, errorCorrectionLevel: "M" });
      })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [upiUri, upiId]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton
        className="max-w-md gap-0 overflow-hidden rounded-[var(--jaiguru-card-radius)] border border-premium-gold/40 bg-deep-navy p-0 text-white shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-royal-purple via-indigo-deep to-deep-navy px-6 pb-5 pt-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-golden">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure UPI Payment
          </div>
          <DialogHeader className="mt-2 space-y-1.5">
            <DialogTitle className="font-display text-xl font-bold leading-snug text-white">
              {itemName}
            </DialogTitle>
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl font-bold text-golden">
                {priceLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-whatsapp/15 px-2.5 py-1 text-[10px] font-semibold text-whatsapp">
                <BadgeCheck className="h-3 w-3" /> Pay securely
              </span>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-3 p-5">
          {/* Option 1: Auto UPI intent link */}
          <a
            href={upiUri}
            target="_blank"
            rel="noopener noreferrer"
            className="group btn-glow-gold flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-golden to-saffron px-4 py-3.5 text-sm font-bold text-slate-900 shadow-[0_10px_30px_rgba(250,204,21,0.4)] transition hover:brightness-105"
          >
            <Wallet className="h-4 w-4" />
            Pay via PhonePe / Google Pay
            {am ? (
              <span className="rounded-full bg-slate-900/15 px-2 py-0.5 text-xs">
                ₹{am}
              </span>
            ) : null}
          </a>
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
            <Smartphone className="mt-0.5 h-3 w-3 shrink-0 text-golden" />
            Opens your UPI app with the amount pre-filled. Best on a mobile
            phone.
          </p>

          {/* Option 2: Manual UPI ID */}
          <div className="rounded-2xl border border-dashed border-premium-gold/50 bg-[var(--jaiguru-dark-2)]/50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Or pay manually to UPI ID
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <code className="break-all text-sm font-bold text-golden">
                {upiId || "UPI not configured"}
              </code>
              <button
                type="button"
                onClick={copyUpi}
                disabled={!upiId}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-premium-gold/50 px-3 py-1.5 text-xs font-semibold text-golden transition hover:bg-golden hover:text-slate-900 disabled:opacity-40"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Option 3: QR code */}
          <div className="rounded-2xl bg-white p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              <QrCode className="h-3.5 w-3.5" />
              Scan the QR to pay (desktop)
            </p>
            <div className="mt-3 flex w-full justify-center">
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt={`UPI QR - ${upiId}`}
                  width={200}
                  height={200}
                  className="h-44 w-44 rounded-md"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-md bg-slate-100">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp fallback */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              void recordOrderAction({
                itemName,
                itemType: "PRODUCT",
                amount: am ?? priceLabel,
                amountLabel: priceLabel,
                source: "payment-modal",
              }).catch(() => undefined);
            }}
            className="btn-glow-whatsapp flex items-center justify-center gap-2 rounded-2xl bg-whatsapp px-4 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
          >
            <WhatsappIcon className="h-4 w-4" />
            Pay via WhatsApp
          </a>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
            <Info className="mt-0.5 h-3 w-3 shrink-0 text-golden" />
            After paying, share the payment screenshot on WhatsApp so we can
            confirm and process your order.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}