"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  Check,
  Copy,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  PartyPopper,
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
import { cn } from "@/lib/utils";

/**
 * 3-step checkout (products & paid consultations):
 *   1) Delivery details  -> saved to the Order record
 *   2) Payment options   -> PhonePe/UPI (primary) or Razorpay (secondary,
 *      secure international payments; redirects to the Razorpay checkout)
 *   3) Confirmation      -> summary + "Confirm Order"
 * Orders are recorded server-side; Razorpay confirmations arrive via the
 * configured webhook and mark the order PAID automatically.
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
  razorpayKeyId?: string | null;
  itemType?: "PRODUCT" | "SERVICE";
}

type Step = "delivery" | "payment" | "confirm" | "done";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  prefill?: { name?: string; contact?: string };
  theme?: { color?: string };
  handler?: (response: { razorpay_payment_id: string }) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
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
      {open ? <CheckoutModal {...props} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function CheckoutModal(
  props: PaymentButtonProps & { onClose: () => void }
) {
  const {
    itemName,
    priceLabel,
    upiId,
    whatsappMessage,
    whatsappNumber,
    razorpayKeyId,
    itemType = "PRODUCT",
    onClose,
  } = props;
  const am = extractAmount(props.price ?? priceLabel);

  const [step, setStep] = useState<Step>("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [paymentChoice, setPaymentChoice] = useState<"upi" | "razorpay" | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [rzpReady, setRzpReady] = useState(Boolean(razorpayKeyId));
  const [rzpProcessing, setRzpProcessing] = useState(false);

  const waNumber = whatsapp.trim() || phone.trim();
  const digits = (v: string) => v.replace(/\D/g, "");
  const nameValid = name.trim().length >= 2;
  const phoneValid = digits(phone).length >= 10;
  const waValid = digits(waNumber).length >= 10;
  const addressValid = address.trim().length >= 5;
  const cityValid = city.trim().length >= 2;
  const stateValid = state.trim().length >= 2;
  const pincodeValid = /^\d{6}$/.test(pincode.trim());
  const deliveryValid =
    nameValid && phoneValid && waValid && addressValid && cityValid && stateValid && pincodeValid;

  const upiUri = useMemo(
    () =>
      buildUpiUri({
        pa: upiId,
        am,
        tn: itemName,
        cu: "INR",
      }),
    [upiId, am, itemName]
  );

  // Load Razorpay checkout.js once (only when a Key ID is configured).
  useEffect(() => {
    if (!razorpayKeyId || window.Razorpay) {
      setRzpReady(Boolean(razorpayKeyId));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => setRzpReady(true);
    s.onerror = () => setRzpReady(false);
    document.body.appendChild(s);
    return () => {
      document.body.removeChild(s);
    };
  }, [razorpayKeyId]);

  // QR code for UPI.
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

  const confirmUpi = () => {
    void recordOrderAction({
      itemName,
      itemType,
      amount: am ?? priceLabel,
      amountLabel: priceLabel,
      customerName: name.trim(),
      phone: phone.trim(),
      whatsappNumber: waNumber || undefined,
      deliveryAddress: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      paymentMethod: "UPI",
      paymentStatus: "PENDING",
      source: "checkout-upi",
    }).catch(() => undefined);
    window.open(upiUri, "_blank", "noopener,noreferrer");
    setStep("done");
  };

  const confirmRazorpay = async () => {
    if (!razorpayKeyId || !window.Razorpay || rzpProcessing) return;
    setRzpProcessing(true);
    try {
      const res = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName,
          itemType,
          amount: am ?? Number.parseFloat(String(props.price ?? "0").replace(/[^\d.]/g, "")),
          amountLabel: priceLabel,
          customerName: name.trim(),
          phone: phone.trim(),
          whatsappNumber: waNumber || undefined,
          deliveryAddress: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          source: "checkout-razorpay",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "checkout failed");

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: Math.round(data.amount * 100),
        currency: data.currency ?? "INR",
        name: "JAIGURU ASTROREMEDY",
        description: itemName,
        order_id: data.razorpayOrderId,
        prefill: { name: name.trim(), contact: phone.trim() },
        theme: { color: "#4C1D95" },
        handler: () => {
          setStep("done");
        },
        modal: { ondismiss: () => undefined },
      });
      rzp.open();
    } catch (e) {
      console.error("[checkout] razorpay failed:", e);
      alert(
        "Could not start the Razorpay checkout right now. Please use PhonePe/UPI or WhatsApp instead."
      );
    } finally {
      setRzpProcessing(false);
    }
  };

  const confirm = () => {
    if (paymentChoice === "upi") confirmUpi();
    else if (paymentChoice === "razorpay") void confirmRazorpay();
  };

  const steps: { key: Step; label: string }[] = [
    { key: "delivery", label: "Delivery" },
    { key: "payment", label: "Payment" },
    { key: "confirm", label: "Confirm" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  const inputCls =
    "h-10 w-full rounded-xl border border-white/15 bg-[#0B1120] px-3 text-sm text-white placeholder:text-slate-600 focus:border-[#FACC15] focus:outline-none";

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
            Secure Checkout
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

          {step !== "done" ? (
            <div className="mt-4 flex items-center gap-2">
              {steps.map((s, i) => (
                <div key={s.key} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      i < stepIndex
                        ? "bg-[#25D366] text-white"
                        : i === stepIndex
                          ? "bg-[#FACC15] text-slate-900"
                          : "bg-white/15 text-slate-300"
                    )}
                  >
                    {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      i <= stepIndex ? "text-white" : "text-slate-500"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 p-5">
          {step === "done" ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/15">
                <PartyPopper className="h-8 w-8 text-[#25D366]" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                {paymentChoice === "razorpay"
                  ? "Payment received — order confirmed!"
                  : "Order placed — complete the payment"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {paymentChoice === "razorpay"
                  ? "Your Razorpay payment was successful. We will confirm the order and update the tracking details once shipped."
                  : "Your UPI app opened with the amount pre-filled. After paying, share the payment screenshot with us on WhatsApp so we can confirm your order."}
              </p>
              {paymentChoice === "upi" ? (
                <a
                  href={whatsappLink(whatsappMessage, whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glow-whatsapp mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
                >
                  <WhatsappIcon className="h-4 w-4" />
                  Share Screenshot on WhatsApp
                </a>
              ) : null}
            </div>
          ) : (
            <>
              {/* STEP 1 — Delivery details */}
              {step === "delivery" ? (
                <div className="space-y-3">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <MapPin className="h-4 w-4 text-[#FACC15]" />
                    Delivery Details
                  </p>
                  <Field label="Full Name *" valid={nameValid} invalidMsg="Please enter your name" showError={name.length > 0}>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone Number *" valid={phoneValid} invalidMsg="10-digit number" showError={phone.length > 0}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="WhatsApp Number *" valid={waValid} invalidMsg="10-digit number" showError={whatsapp.length > 0}>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="Same as phone"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Address Line *" valid={addressValid} invalidMsg="Enter your full address" showError={address.length > 0}>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House no, street, area"
                      className="w-full resize-none rounded-xl border border-white/15 bg-[#0B1120] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#FACC15] focus:outline-none"
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="City *" valid={cityValid} invalidMsg="Required" showError={city.length > 0}>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Delhi"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="State *" valid={stateValid} invalidMsg="Required" showError={state.length > 0}>
                      <input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Delhi"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Pincode *" valid={pincodeValid} invalidMsg="6 digits" showError={pincode.length > 0}>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="110001"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              ) : null}

              {/* STEP 2 — Payment options */}
              {step === "payment" ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Choose a payment method</p>

                  {/* Primary: PhonePe / UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentChoice("upi")}
                    className={cn(
                      "w-full rounded-2xl border-2 px-4 py-3.5 text-left transition",
                      paymentChoice === "upi"
                        ? "border-[#FACC15] bg-[#FACC15]/10"
                        : "border-premium-gold/40 bg-white/5 hover:border-[#D4AF37]/70"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Wallet className="h-5 w-5 text-[#FACC15]" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">PhonePe / UPI</p>
                        <p className="text-[11px] text-slate-400">
                          Intent link, QR code or manual UPI ID
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2",
                          paymentChoice === "upi" ? "border-[#FACC15] bg-[#FACC15]" : "border-white/30"
                        )}
                      >
                        {paymentChoice === "upi" ? (
                          <Check className="h-3 w-3 text-slate-900" />
                        ) : null}
                      </span>
                    </div>
                  </button>

                  {paymentChoice === "upi" ? (
                    <div className="space-y-3 rounded-2xl border border-premium-gold/40 bg-white/5 p-4">
                      <a
                        href={upiUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-golden to-saffron px-4 py-3.5 text-sm font-bold text-slate-900 shadow-[0_10px_30px_rgba(250,204,21,0.4)] transition hover:brightness-105"
                      >
                        <Smartphone className="h-4 w-4" />
                        Pay via PhonePe / Google Pay
                        {am ? (
                          <span className="rounded-full bg-slate-900/15 px-2 py-0.5 text-xs">
                            ₹{am}
                          </span>
                        ) : null}
                      </a>
                      <div className="rounded-2xl border border-dashed border-premium-gold/50 px-4 py-3">
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
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
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
                    </div>
                  ) : null}

                  {/* Secondary: Razorpay */}
                  <button
                    type="button"
                    onClick={() => razorpayKeyId && setPaymentChoice("razorpay")}
                    disabled={!razorpayKeyId}
                    className={cn(
                      "w-full rounded-2xl border-2 px-4 py-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40",
                      paymentChoice === "razorpay"
                        ? "border-[#FACC15] bg-[#FACC15]/10"
                        : "border-premium-gold/40 bg-white/5 hover:border-[#D4AF37]/70"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="h-5 w-5 text-[#FACC15]" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                          Pay via Razorpay (Secure International Payments)
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Cards, UPI, net-banking & international payments
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2",
                          paymentChoice === "razorpay" ? "border-[#FACC15] bg-[#FACC15]" : "border-white/30"
                        )}
                      >
                        {paymentChoice === "razorpay" ? (
                          <Check className="h-3 w-3 text-slate-900" />
                        ) : null}
                      </span>
                    </div>
                  </button>
                  {!razorpayKeyId ? (
                    <p className="text-[11px] text-slate-500">
                      Razorpay is coming soon — please use PhonePe/UPI for now.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {/* STEP 3 — Confirmation */}
              {step === "confirm" ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Review your order</p>
                  <div className="rounded-2xl border border-premium-gold/40 bg-white/5 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-300">{itemName}</span>
                      <span className="shrink-0 font-display font-bold text-golden">{priceLabel}</span>
                    </div>
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Delivery Address
                      </p>
                      <p className="mt-1 text-slate-200">
                        {name.trim()}
                        <br />
                        {address.trim()}, {city.trim()} - {pincode.trim()}
                        <br />
                        {state.trim()} · {waNumber}
                      </p>
                    </div>
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Payment Method
                      </p>
                      <p className="mt-1 font-medium text-slate-200">
                        {paymentChoice === "razorpay"
                          ? "Razorpay (cards / UPI / net-banking / international)"
                          : "PhonePe / UPI"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Footer nav */}
              <div className="flex gap-2 pt-1">
                {step === "payment" ? (
                  <button
                    type="button"
                    onClick={() => setStep("delivery")}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                  >
                    Back
                  </button>
                ) : null}
                {step === "confirm" ? (
                  <button
                    type="button"
                    onClick={() => setStep("payment")}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                  >
                    Back
                  </button>
                ) : null}
                {step === "delivery" ? (
                  <button
                    type="button"
                    disabled={!deliveryValid}
                    onClick={() => setStep("payment")}
                    className="btn-glow-gold inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-4 py-3 text-sm font-bold text-slate-900 transition hover:brightness-105 disabled:opacity-40"
                  >
                    Continue to Payment
                  </button>
                ) : null}
                {step === "payment" ? (
                  <button
                    type="button"
                    disabled={!paymentChoice || (paymentChoice === "razorpay" && (!rzpReady || rzpProcessing))}
                    onClick={() => setStep("confirm")}
                    className="btn-glow-gold inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-4 py-3 text-sm font-bold text-slate-900 transition hover:brightness-105 disabled:opacity-40"
                  >
                    {paymentChoice === "razorpay" && !rzpReady ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Review Order
                  </button>
                ) : null}
                {step === "confirm" ? (
                  <button
                    type="button"
                    disabled={rzpProcessing}
                    onClick={confirm}
                    className="btn-glow-whatsapp inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--jaiguru-whatsapp-hover)] disabled:opacity-40"
                  >
                    {rzpProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Confirm Order
                  </button>
                ) : null}
              </div>

              {step === "confirm" && paymentChoice === "upi" ? (
                <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-golden" />
                  After paying, share the payment screenshot on WhatsApp so we
                  can confirm and ship your order.
                </p>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  valid,
  invalidMsg,
  showError,
  children,
}: {
  label: string;
  valid: boolean;
  invalidMsg: string;
  showError?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      {children}
      {showError && !valid ? (
        <p className="text-[11px] text-red-400">{invalidMsg}</p>
      ) : null}
    </div>
  );
}
