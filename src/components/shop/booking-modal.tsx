"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  PartyPopper,
  UserRound,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { whatsappLink } from "@/config/site";
import { getAvailableDates, getAvailableSlotsForDate } from "@/lib/booking-availability";
import {
  DEFAULT_SLOT_DURATION,
  durationLabel,
  formatDateKeyLong,
  formatSlot12h,
  fromDateKey,
  slotEnd12h,
} from "@/lib/booking";
import { cn } from "@/lib/utils";
import { recordOrderAction } from "@/lib/orders/record";

/**
 * Professional booking modal (services & consultations).
 * Steps: 1) pick an available date, 2) pick a time slot (07:00–12:00),
 * 3) enter customer details, 4) confirm — opens WhatsApp with the full
 * booking pre-filled. Dates/slots blocked by the admin calendar are hidden.
 */

export interface BookingModalProps {
  serviceName: string;
  durationMinutes?: number;
  priceLabel?: string;
  whatsappNumber: string;
  siteName?: string;
}

export function BookingButton({
  label,
  className,
  icon,
  ...props
}: BookingModalProps & {
  label: string;
  className?: string;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "btn-glow-gold inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-8 py-3.5 text-[15px] font-semibold text-slate-900 shadow-[0_10px_30px_rgba(250,204,21,0.4)] transition hover:brightness-105"
        }
      >
        {icon}
        {label}
      </button>
      {open ? <BookingModal {...props} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

type Step = "date" | "time" | "details" | "done";

export function BookingModal({
  serviceName,
  durationMinutes = DEFAULT_SLOT_DURATION,
  priceLabel,
  whatsappNumber,
  siteName = "JAIGURU ASTROREMEDY",
  onClose,
}: BookingModalProps & { onClose: () => void }) {
  const duration = durationMinutes || DEFAULT_SLOT_DURATION;
  const [step, setStep] = useState<Step>("date");
  const [dates, setDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slot, setSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
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
  }, [duration]);

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

  const nameValid = name.trim().length >= 2;
  const phoneValid = phone.trim().replace(/\D/g, "").length >= 10;
  const waNumber = whatsapp.trim() || phone.trim();
  const detailsValid = nameValid && phoneValid && waNumber.replace(/\D/g, "").length >= 10;

  const message = useMemo(() => {
    const lines = [
      `Hello ${siteName},`,
      "",
      "I would like to book an appointment.",
      "",
      `Service: ${serviceName}`,
      `Duration: ${durationLabel(duration)}`,
      priceLabel ? `Price: ${priceLabel}` : "",
      date ? `Date: ${formatDateKeyLong(date)}` : "",
      slot ? `Time: ${formatSlot12h(slot)} - ${slotEnd12h(slot, duration)}` : "",
      "",
      `My Name: ${name.trim()}`,
      `My Phone: ${phone.trim()}`,
      waNumber && waNumber !== phone.trim() ? `My WhatsApp: ${waNumber}` : "",
      "",
      "Please confirm my booking. Thank you.",
    ].filter((l) => l !== "");
    return lines.join("\n");
  }, [siteName, serviceName, duration, priceLabel, date, slot, name, phone, waNumber]);

  const waHref = whatsappLink(message, whatsappNumber);

  const confirm = () => {
    if (!detailsValid) return;
    void recordOrderAction({
      customerName: name.trim(),
      phone: phone.trim(),
      whatsappNumber: waNumber || undefined,
      itemName: serviceName,
      itemType: "SERVICE",
      amount: priceLabel,
      amountLabel: priceLabel,
      preferredDate: date ?? undefined,
      preferredTime: slot || undefined,
      deliveryAddress: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      pincode: pincode.trim() || undefined,
      source: "booking-modal",
    }).catch(() => undefined);
    window.open(waHref, "_blank", "noopener,noreferrer");
    setStep("done");
  };

  const steps: { key: Step; label: string }[] = [
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "details", label: "Details" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton
        className="max-w-md gap-0 overflow-hidden rounded-[var(--jaiguru-card-radius)] border border-premium-gold/40 bg-deep-navy p-0 text-white shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-royal-purple via-indigo-deep to-deep-navy px-6 pb-5 pt-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-golden">
            <CalendarDays className="h-3.5 w-3.5" />
            Book Appointment
          </div>
          <DialogTitle className="mt-2 font-display text-xl font-bold leading-snug text-white">
            {serviceName}
          </DialogTitle>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
            <Clock className="h-3.5 w-3.5 text-[#FACC15]" />
            {durationLabel(duration)} session · 07:00 AM – 12:00 PM
          </p>

          {/* Stepper */}
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
        </div>

        <div className="space-y-4 p-5">
          {step === "done" ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/15">
                <PartyPopper className="h-8 w-8 text-[#25D366]" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                Booking request ready!
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                We opened WhatsApp with your booking details pre-filled.
                Press send and we will confirm your appointment shortly.
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow-whatsapp mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
              >
                <WhatsappIcon className="h-4 w-4" />
                Open WhatsApp Again
              </a>
            </div>
          ) : (
            <>
              {/* STEP 1 — Date */}
              {step === "date" ? (
                <div>
                  <p className="text-sm font-semibold text-white">Select a date</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Available days over the next two weeks
                  </p>
                  {loadingDates ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-[#FACC15]" />
                    </div>
                  ) : dates.length === 0 ? (
                    <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
                      No dates available right now — please check back soon or
                      message us directly on WhatsApp.
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
                                : "border-white/15 bg-white/5 text-slate-200 hover:border-[#D4AF37]/60 hover:bg-white/10"
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

              {/* STEP 2 — Time */}
              {step === "time" ? (
                <div>
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
                    <select
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                      className="mt-3 h-11 w-full rounded-xl border border-white/15 bg-[#0B1120] px-3 text-sm text-white focus:border-[#FACC15] focus:outline-none"
                    >
                      <option value="">Choose a time slot</option>
                      {slots.map((s) => (
                        <option key={s} value={s}>
                          {formatSlot12h(s)} - {slotEnd12h(s, duration)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : null}

              {/* STEP 3 — Details */}
              {step === "details" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Your details</p>
                    <button
                      type="button"
                      onClick={() => setStep("time")}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-[#FACC15]"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Change time
                    </button>
                  </div>
                  {date && slot ? (
                    <p className="rounded-lg bg-[#FACC15]/10 px-3 py-2 text-xs text-[#FACC15]">
                      {formatDateKeyLong(date)} · {formatSlot12h(slot)} -{" "}
                      {slotEnd12h(slot, duration)}
                    </p>
                  ) : null}
                  <div className="space-y-1.5">
                    <label htmlFor="bk-name" className="text-xs font-semibold text-slate-300">
                      Your Name *
                    </label>
                    <input
                      id="bk-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="h-10 w-full rounded-xl border border-white/15 bg-[#0B1120] px-3 text-sm text-white placeholder:text-slate-600 focus:border-[#FACC15] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="bk-phone" className="text-xs font-semibold text-slate-300">
                      Phone Number *
                    </label>
                    <input
                      id="bk-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="h-10 w-full rounded-xl border border-white/15 bg-[#0B1120] px-3 text-sm text-white placeholder:text-slate-600 focus:border-[#FACC15] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="bk-wa" className="text-xs font-semibold text-slate-300">
                      WhatsApp Number (optional)
                    </label>
                    <input
                      id="bk-wa"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Same as phone if left blank"
                      className="h-10 w-full rounded-xl border border-white/15 bg-[#0B1120] px-3 text-sm text-white placeholder:text-slate-600 focus:border-[#FACC15] focus:outline-none"
                    />
                  </div>
                  {!nameValid && name ? (
                    <p className="text-xs text-red-400">Please enter your name.</p>
                  ) : null}
                  {!phoneValid && phone ? (
                    <p className="text-xs text-red-400">
                      Please enter a valid 10-digit phone number.
                    </p>
                  ) : null}
                  <div className="space-y-1.5">
                    <label htmlFor="bk-addr" className="text-xs font-semibold text-slate-300">
                      Address (optional)
                    </label>
                    <textarea
                      id="bk-addr"
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House no, street, area"
                      className="w-full resize-none rounded-xl border border-white/15 bg-[#0B1120] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#FACC15] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <label htmlFor="bk-city" className="text-xs font-semibold text-slate-300">
                        City
                      </label>
                      <input
                        id="bk-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Delhi"
                        className="h-10 w-full rounded-xl border border-white/15 bg-[#0B1120] px-3 text-sm text-white placeholder:text-slate-600 focus:border-[#FACC15] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="bk-state" className="text-xs font-semibold text-slate-300">
                        State
                      </label>
                      <input
                        id="bk-state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Delhi"
                        className="h-10 w-full rounded-xl border border-white/15 bg-[#0B1120] px-3 text-sm text-white placeholder:text-slate-600 focus:border-[#FACC15] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="bk-pin" className="text-xs font-semibold text-slate-300">
                        Pincode
                      </label>
                      <input
                        id="bk-pin"
                        type="tel"
                        inputMode="numeric"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="110001"
                        className="h-10 w-full rounded-xl border border-white/15 bg-[#0B1120] px-3 text-sm text-white placeholder:text-slate-600 focus:border-[#FACC15] focus:outline-none"
                      />
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
                  {step === "details" ? (
                    <button
                      type="button"
                      onClick={() => setStep("time")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
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
                      onClick={confirm}
                      className="btn-glow-whatsapp inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--jaiguru-whatsapp-hover)] disabled:opacity-40"
                    >
                      <WhatsappIcon className="h-4 w-4" />
                      Confirm Booking
                    </button>
                  ) : null}
                </div>

                <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                  <UserRound className="mt-0.5 h-3 w-3 shrink-0 text-[#FACC15]" />
                  Your request opens in WhatsApp pre-filled — we reply with
                  confirmation within business hours.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
}
