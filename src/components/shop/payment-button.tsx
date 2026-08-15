"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  MessageCircleQuestion,
  PartyPopper,
  QrCode,
  ShieldCheck,
  Smartphone,
  UserRound,
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
import {
  getAvailableDates,
  getAvailableSlotsForDate,
} from "@/lib/booking-availability";
import {
  DEFAULT_SLOT_DURATION,
  durationLabel,
  formatDateKeyLong,
  formatSlot12h,
  fromDateKey,
  slotEnd12h,
} from "@/lib/booking";
import { cn } from "@/lib/utils";

/**
 * Unified order modal (products, courses & consultations).
 * Two tabs:
 *   💬 Enquire First  -> professional message + big WhatsApp CTA (top of modal)
 *   📦 Order / Book Now -> steps per kind:
 *      - consultations:  Preferred Mode (Online / Offline / Home Visit,
 *        filtered by admin Service Mode Settings) -> Date & Slot (validated
 *        against the admin booking calendar) -> Your Details (incl. optional
 *        birth details) -> Payment
 *      - courses:        Your Details (mode is fixed on the card) -> Payment
 *      - products:       Your Details (delivery address) -> Payment
 *   Payment step reuses the existing UPI (PhonePe/QR/manual) + Razorpay flow.
 */

export type OrderKind = "product" | "course" | "consultation";

function modeLabel(m: string | null | undefined): string {
  if (!m) return "";
  const map: Record<string, string> = {
    ONLINE: "Online",
    OFFLINE: "Offline",
    HOME_SERVICE: "Home Service",
  };
  return map[m] ?? m;
}

export interface PaymentButtonProps {
  label: string;
  className?: string;
  icon?: ReactNode;
  itemName: string;
  priceLabel: string;
  price?: string | number | null;
  /** Shown instead of priceLabel when a Home Visit consultation is selected. */
  homePriceLabel?: string;
  upiId: string;
  whatsappNumber: string;
  whatsappMessage: string;
  razorpayKeyId?: string | null;
  itemType?: "PRODUCT" | "SERVICE";
  kind?: OrderKind;
  durationMinutes?: number;
  defaultMode?: string;
  pageUrl?: string;
  siteName?: string;
  /** Visible service modes from the admin "Service Mode Settings" (mode ids). */
  availableModes?: string[];
}

type Step = "mode" | "date" | "time" | "details" | "payment" | "confirm" | "done";

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
      {open ? <UnifiedOrderModal {...props} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function UnifiedOrderModal(
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
    kind = "product",
    durationMinutes,
    defaultMode,
    pageUrl,
    siteName = "JAIGURU ASTROREMEDY",
    onClose,
  } = props;
  const am = extractAmount(props.price ?? priceLabel);
  const duration = durationMinutes || DEFAULT_SLOT_DURATION;
  const isConsultation = kind === "consultation";
  const isCourse = kind === "course";

  const currentUrl = useMemo(() => {
    if (pageUrl) {
      if (pageUrl.startsWith("/") && typeof window !== "undefined") {
        return `${window.location.origin}${pageUrl}`;
      }
      return pageUrl;
    }
    return typeof window !== "undefined" ? window.location.href : "";
  }, [pageUrl]);

  const [tab, setTab] = useState<"enquire" | "order">("order");
  const [step, setStep] = useState<Step>(isConsultation ? "mode" : "details");

  // Date & slot (consultations only)
  const [dates, setDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slot, setSlot] = useState("");

  // Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [preferredMode, setPreferredMode] = useState(() => modeLabel(defaultMode));
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [address, setAddress] = useState("");

  // Payment
  const [paymentChoice, setPaymentChoice] = useState<"upi" | "razorpay" | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [rzpReady, setRzpReady] = useState(Boolean(razorpayKeyId));
  const [rzpProcessing, setRzpProcessing] = useState(false);

  useEffect(() => {
    if (!isConsultation) return;
    let cancelled = false;
    getAvailableDates(14, duration)
      .then((d) => {
        if (!cancelled) setDates(d);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoadingDates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isConsultation, duration]);

  const selectDate = async (key: string) => {
    setDate(key);
    setSlot("");
    setSlots([]);
    setLoadingSlots(true);
    try {
      const s = await getAvailableSlotsForDate(key, duration);
      setSlots(s);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
    setStep("time");
  };

  const waNumber = whatsapp.trim() || phone.trim();
  const digits = (v: string) => v.replace(/\D/g, "");
  const nameValid = name.trim().length >= 2;
  const phoneValid = digits(phone).length >= 10;
  const waValid = digits(waNumber).length >= 10;

  const modeOptions = useMemo(() => {
    const ids = props.availableModes?.length
      ? props.availableModes
      : ["online", "offline", "homeService"];
    const labels: Record<string, string> = {
      online: "Online",
      offline: "Offline",
      homeService: isConsultation ? "Home Visit" : "Home Service",
    };
    return ids.map((m) => labels[m] ?? m);
  }, [props.availableModes, isConsultation]);

  const homeAmount = extractAmount(props.homePriceLabel ?? "");
  const isHomeVisit =
    isConsultation && preferredMode === "Home Visit" && Boolean(props.homePriceLabel);
  const effectiveAm = isHomeVisit && homeAmount ? homeAmount : am;
  const effectivePriceLabel =
    isHomeVisit && props.homePriceLabel ? props.homePriceLabel : priceLabel;

  const detailsValid = nameValid && phoneValid && waValid;

  const orderFields = {
    itemName,
    itemType,
    amount: effectiveAm ?? effectivePriceLabel,
    amountLabel: effectivePriceLabel,
    customerName: name.trim(),
    phone: phone.trim(),
    whatsappNumber: waNumber || undefined,
    email: email.trim() || undefined,
    preferredDate: date ?? undefined,
    preferredTime: slot || undefined,
    preferredMode: preferredMode || undefined,
    birthDate: isConsultation && birthDate ? birthDate : undefined,
    birthTime: isConsultation && birthTime ? birthTime : undefined,
    birthPlace: isConsultation && birthPlace.trim() ? birthPlace.trim() : undefined,
    deliveryAddress: address.trim() || undefined,
  };

  // WhatsApp enquiry (Tab 1)
  const enquiryHref = useMemo(() => {
    const lines = [
      `Hello ${siteName},`,
      "",
      `I have a question about "${itemName}" before placing my order.`,
      currentUrl ? `Page: ${currentUrl}` : "",
      "",
      "Please assist me. Thank you.",
    ].filter((l) => l !== "");
    return whatsappLink(lines.join("\n"), whatsappNumber);
  }, [siteName, itemName, currentUrl, whatsappNumber]);

  const upiUri = useMemo(
    () =>
      buildUpiUri({
        pa: upiId,
        am: effectiveAm,
        tn: itemName,
        cu: "INR",
      }),
    [upiId, effectiveAm, itemName]
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
      ...orderFields,
      paymentMethod: "UPI",
      paymentStatus: "PENDING",
      source: "order-modal-upi",
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
          ...orderFields,
          amount: effectiveAm ?? Number.parseFloat(String(props.price ?? "0").replace(/[^\d.]/g, "")),
          source: "order-modal-razorpay",
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

  const steps: { key: Step; label: string }[] = isConsultation
    ? [
        { key: "mode", label: "Mode" },
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "details", label: "Details" },
        { key: "payment", label: "Payment" },
        { key: "confirm", label: "Confirm" },
      ]
    : [
        { key: "details", label: "Details" },
        { key: "payment", label: "Payment" },
        { key: "confirm", label: "Confirm" },
      ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  const inputCls =
    "h-10 w-full rounded-xl border border-premium-gold/40 bg-[#0B1120]/90 px-3 text-sm text-white placeholder:text-slate-600 transition focus:border-[#FACC15] focus:outline-none focus:ring-1 focus:ring-[#FACC15]/30";
  const textareaCls =
    "w-full resize-none rounded-xl border border-premium-gold/40 bg-[#0B1120]/90 px-3 py-2 text-sm text-white placeholder:text-slate-600 transition focus:border-[#FACC15] focus:outline-none focus:ring-1 focus:ring-[#FACC15]/30";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-deep-navy/70 backdrop-blur-md"
        className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-[var(--jaiguru-card-radius)] border border-premium-gold/40 bg-deep-navy p-0 text-white shadow-[0_25px_80px_rgba(0,0,0,0.7)] sm:max-w-md"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-royal-purple via-indigo-deep to-deep-navy px-6 pb-4 pt-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-golden">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure Order / Booking
          </div>
          <DialogHeader className="mt-2 space-y-1.5">
            <DialogTitle className="font-display text-xl font-bold leading-snug text-white">
              {itemName}
            </DialogTitle>
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl font-bold text-golden">
                {effectivePriceLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-whatsapp/15 px-2.5 py-1 text-[10px] font-semibold text-whatsapp">
                <BadgeCheck className="h-3 w-3" /> Pay securely
              </span>
            </div>
          </DialogHeader>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1.5 border-b border-white/10 bg-white/[0.03] p-2.5">
          <button
            type="button"
            onClick={() => setTab("enquire")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition",
              tab === "enquire"
                ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] text-slate-900 shadow-[0_4px_14px_rgba(250,204,21,0.3)]"
                : "border border-white/15 text-slate-300 hover:bg-white/5"
            )}
          >
            💬 Enquire First
          </button>
          <button
            type="button"
            onClick={() => setTab("order")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition",
              tab === "order"
                ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] text-slate-900 shadow-[0_4px_14px_rgba(250,204,21,0.3)]"
                : "border border-white/15 text-slate-300 hover:bg-white/5"
            )}
          >
            📦 Order / Book Now
          </button>
        </div>

        {tab === "enquire" ? (
          <div
            key="tab-enquire"
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 p-5"
          >
            <div className="rounded-2xl border border-premium-gold/30 bg-white/[0.04] p-5 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-golden/15">
                <MessageCircleQuestion className="h-7 w-7 text-golden" />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-white">
                Have a question about {itemName}?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Have questions before you place your order? Our customer care
                executive is available to assist you.
              </p>
              <a
                href={enquiryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow-whatsapp mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
              >
                <WhatsappIcon className="h-5 w-5" />
                Chat on WhatsApp
              </a>
              <p className="mt-3 text-[11px] text-slate-500">
                No payment needed — we reply within business hours.
              </p>
            </div>
          </div>
        ) : (
          <div key="tab-order" className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {/* Stepper */}
            {step !== "done" ? (
              <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-5 py-3">
                {steps.map((s, i) => (
                  <div key={s.key} className="flex flex-1 items-center gap-1.5">
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
                        "hidden text-[10px] font-semibold sm:inline",
                        i <= stepIndex ? "text-white" : "text-slate-500"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

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
                  {/* STEP 1 — Preferred Mode (consultations only) */}
                  {step === "mode" ? (
                    <div key="step-mode" className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <p className="text-sm font-semibold text-white">
                        Choose your preferred mode
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        How would you like the consultation to happen?
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {modeOptions.map((m) => {
                          const Icon =
                            m === "Home Visit"
                              ? MapPin
                              : m === "Offline"
                                ? Clock
                                : Smartphone;
                          const selected = preferredMode === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setPreferredMode(m)}
                              className={cn(
                                "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition",
                                selected
                                  ? "border-[#FACC15] bg-[#FACC15]/15 text-[#FACC15]"
                                  : "border-premium-gold/30 bg-white/5 text-slate-200 hover:border-[#D4AF37]/60 hover:bg-white/10"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {m}
                              {isHomeVisit && selected ? (
                                <span className="text-[10px] font-bold text-golden">
                                  {props.homePriceLabel ?? ""}
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                      {props.homePriceLabel ? (
                        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                          {modeOptions
                            .map((m) =>
                              m === "Home Visit"
                                ? `${m} — ${props.homePriceLabel}`
                                : `${m} — ₹${am}`
                            )
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {/* STEP 2 — Date (consultations only) */}
                  {step === "date" ? (
                    <div key="step-date" className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <p className="text-sm font-semibold text-white">Select a date</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Available days over the next two weeks — blocked dates
                        are not shown
                      </p>
                      {loadingDates ? (
                        <div className="flex h-40 items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-[#FACC15]" />
                        </div>
                      ) : dates.length === 0 ? (
                        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
                          No dates available right now — please check back soon
                          or message us directly on WhatsApp.
                        </p>
                      ) : (
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {dates.map((key) => {
                            const d = fromDateKey(key);
                            const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" });
                            const dateNum = d.getDate();
                            const monthLabel = d.toLocaleDateString("en-IN", { month: "short" });
                            const selected = date === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => selectDate(key)}
                                className={cn(
                                  "flex flex-col items-center rounded-xl border px-1 py-2.5 transition",
                                  selected
                                    ? "border-[#FACC15] bg-[#FACC15]/15 text-[#FACC15]"
                                    : "border-premium-gold/30 bg-white/5 text-slate-200 hover:border-[#D4AF37]/60 hover:bg-white/10"
                                )}
                              >
                                <span className="text-[10px] font-semibold uppercase text-slate-400">
                                  {dayLabel}
                                </span>
                                <span className="font-display text-lg font-bold">{dateNum}</span>
                                <span className="text-[10px] text-slate-500">{monthLabel}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* STEP 3 — Time (consultations only) */}
                  {step === "time" ? (
                    <div key="step-time" className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">Select a time</p>
                        <button
                          type="button"
                          onClick={() => setStep("date")}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-[#FACC15]"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Change date
                        </button>
                      </div>
                      {date ? (
                        <p className="mt-0.5 text-xs text-[#D4AF37]">{formatDateKeyLong(date)}</p>
                      ) : null}
                      {loadingSlots ? (
                        <div className="flex h-32 items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-[#FACC15]" />
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
                          No slots left on this day — please pick another date.
                        </p>
                      ) : (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {slots.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSlot(s)}
                              className={cn(
                                "flex flex-col items-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                                slot === s
                                  ? "border-[#FACC15] bg-[#FACC15]/15 text-[#FACC15]"
                                  : "border-premium-gold/30 bg-white/5 text-slate-200 hover:border-[#D4AF37]/60 hover:bg-white/10"
                              )}
                            >
                              <span>{formatSlot12h(s)}</span>
                              <span className="text-[10px] font-normal text-slate-400">
                                to {slotEnd12h(s, duration)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* STEP — Details */}
                  {step === "details" ? (
                    <div
                      key="step-details"
                      className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                          <UserRound className="h-4 w-4 text-[#FACC15]" />
                          Your details
                        </p>
                        {isConsultation ? (
                          <button
                            type="button"
                            onClick={() => setStep("time")}
                            className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-[#FACC15]"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Change time
                          </button>
                        ) : null}
                      </div>
                      {isConsultation && date && slot ? (
                        <p className="flex items-center gap-1.5 rounded-lg bg-[#FACC15]/10 px-3 py-2 text-xs text-[#FACC15]">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          {formatDateKeyLong(date)} · {formatSlot12h(slot)} -{" "}
                          {slotEnd12h(slot, duration)}
                          {preferredMode ? (
                            <span className="ml-1 rounded-full bg-[#FACC15]/20 px-2 py-0.5 font-bold">
                              {preferredMode}
                            </span>
                          ) : null}
                        </p>
                      ) : null}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Your Name *" valid={nameValid} invalidMsg="Please enter your name" showError={name.length > 0}>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Phone Number *" valid={phoneValid} invalidMsg="10-digit number" showError={phone.length > 0}>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="98765 43210"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="WhatsApp Number" valid={waValid} invalidMsg="10-digit number" showError={whatsapp.length > 0}>
                          <input
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="Same as phone if left blank"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Email (optional)">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      {isConsultation ? (
                        <div className="space-y-1.5 rounded-2xl border border-premium-gold/30 bg-white/[0.03] p-3.5">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                            <Clock className="h-3.5 w-3.5 text-[#FACC15]" />
                            Birth Details (optional — helps the astrologer)
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Date of Birth">
                              <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Birth Time">
                              <input
                                type="time"
                                value={birthTime}
                                onChange={(e) => setBirthTime(e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                          </div>
                          <Field label="Birth Place">
                            <input
                              value={birthPlace}
                              onChange={(e) => setBirthPlace(e.target.value)}
                              placeholder="e.g. Kolkata, West Bengal"
                              className={inputCls}
                            />
                          </Field>
                        </div>
                      ) : null}

                      <Field label={isCourse ? "Address (optional)" : isConsultation ? "Address (optional)" : "Delivery Address (optional)"}>
                        <textarea
                          rows={2}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder={
                            isCourse || isConsultation
                              ? "House no, street, area (for in-person / home service)"
                              : "House no, street, area, city, pincode"
                          }
                          className={textareaCls}
                        />
                      </Field>
                    </div>
                  ) : null}

                  {/* STEP — Payment options */}
                  {step === "payment" ? (
                    <div key="step-payment" className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 space-y-3">
                      <p className="text-sm font-semibold text-white">Choose a payment method</p>

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

                  {/* STEP — Confirmation */}
                  {step === "confirm" ? (
                    <div key="step-confirm" className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 space-y-3">
                      <p className="text-sm font-semibold text-white">Review your order</p>
                      <div className="rounded-2xl border border-premium-gold/40 bg-white/5 p-4 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-300">{itemName}</span>
                          <span className="shrink-0 font-display font-bold text-golden">{effectivePriceLabel}</span>
                        </div>
                        {isConsultation && date && slot ? (
                          <div className="mt-3 border-t border-white/10 pt-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Preferred Slot
                            </p>
                            <p className="mt-1 text-slate-200">
                              {formatDateKeyLong(date)} · {formatSlot12h(slot)} -{" "}
                              {slotEnd12h(slot, duration)}
                            </p>
                          </div>
                        ) : null}
                        {(isCourse || isConsultation) && preferredMode ? (
                          <div className="mt-3 border-t border-white/10 pt-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Preferred Mode
                            </p>
                            <p className="mt-1 text-slate-200">{preferredMode}</p>
                          </div>
                        ) : null}
                        <div className="mt-3 border-t border-white/10 pt-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Contact Details
                          </p>
                          <p className="mt-1 text-slate-200">
                            {name.trim()}
                            <br />
                            {phone.trim()} · {waNumber}
                            {email.trim() ? <><br />{email.trim()}</> : null}
                          </p>
                        </div>
                        {address.trim() ? (
                          <div className="mt-3 border-t border-white/10 pt-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              {isCourse || isConsultation ? "Address" : "Delivery Address"}
                            </p>
                            <p className="mt-1 text-slate-200">{address.trim()}</p>
                          </div>
                        ) : null}
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
                    {step === "time" ? (
                      <button
                        type="button"
                        onClick={() => setStep("date")}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </button>
                    ) : null}
                    {step === "details" && isConsultation ? (
                      <button
                        type="button"
                        onClick={() => setStep("time")}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </button>
                    ) : null}
                    {step === "payment" ? (
                      <button
                        type="button"
                        onClick={() => setStep("details")}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </button>
                    ) : null}
                    {step === "confirm" ? (
                      <button
                        type="button"
                        onClick={() => setStep("payment")}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </button>
                    ) : null}
{step === "date" && isConsultation ? (
                      <button
                        type="button"
                        onClick={() => setStep("mode")}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </button>
                    ) : null}
                    {step === "mode" ? (
                      <button
                        type="button"
                        disabled={!preferredMode}
                        onClick={() => setStep("date")}
                        className="btn-glow-gold inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-4 py-3 text-sm font-bold text-slate-900 transition hover:brightness-105 disabled:opacity-40"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : null}
                    {step === "date" ? (
                      <button
                        type="button"
                        disabled={!date}
                        onClick={() => setStep("time")}
                        className="btn-glow-gold inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-4 py-3 text-sm font-bold text-slate-900 transition hover:brightness-105 disabled:opacity-40"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : null}
                    {step === "time" ? (
                      <button
                        type="button"
                        disabled={!slot}
                        onClick={() => setStep("details")}
                        className="btn-glow-gold inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-4 py-3 text-sm font-bold text-slate-900 transition hover:brightness-105 disabled:opacity-40"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : null}
                    {step === "details" ? (
                      <button
                        type="button"
                        disabled={!detailsValid}
                        onClick={() => setStep("payment")}
                        className="btn-glow-gold inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-4 py-3 text-sm font-bold text-slate-900 transition hover:brightness-105 disabled:opacity-40"
                      >
                        Proceed to Payment
                        <ChevronRight className="h-4 w-4" />
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
                  {step === "details" ? (
                    <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-golden" />
                      {isConsultation
                        ? `Your slot is ${durationLabel(duration)} · 07:00 AM – 12:00 PM.`
                        : "Your details are saved with the order — we may call you for confirmation."}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        )}
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
  valid?: boolean;
  invalidMsg?: string;
  showError?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      {children}
      {showError && valid === false ? (
        <p className="text-[11px] text-red-400">{invalidMsg}</p>
      ) : null}
    </div>
  );
}