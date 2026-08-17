"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  GraduationCap,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { whatsappLink } from "@/config/site";
import { cn } from "@/lib/utils";

const NAV_CARDS = [
  {
    href: "/consultations",
    title: "Book a Consultation",
    subtitle: "Astrology, numerology, vastu & more — ₹700",
    icon: Calendar,
    accent: "text-[#B8860B]",
  },
  {
    href: "/services",
    title: "Book a Course",
    subtitle: "Vedic astrology & yoga courses — online or in person",
    icon: GraduationCap,
    accent: "text-orange-600",
  },
  {
    href: "/products",
    title: "Buy a Product",
    subtitle: "Rudraksha, gemstones & spiritual remedies",
    icon: ShoppingBag,
    accent: "text-emerald-600",
  },
];

/**
 * Navigation dialog with the three main booking paths (Consultation /
 * Course / Product) plus a "Talk to Executive" WhatsApp shortcut.
 * Reused by the hero "Book a Service" button and every WhatsApp CTA.
 */
export function ServiceNavModal({
  open,
  onOpenChange,
  whatsappNumber,
  waMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsappNumber: string;
  waMessage?: string;
}) {
  const talkHref =
    waMessage ?? whatsappLink("", whatsappNumber);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-deep-navy/70 backdrop-blur-md"
        className="max-w-[calc(100%-2rem)] sm:max-w-md"
      >
<button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="font-display text-xl font-bold text-gray-900">
            What would you like to book?
          </DialogTitle>
          <p className="mt-1 text-sm text-gray-500">
            Choose a service to get started.
          </p>

        <div className="mt-5 grid gap-3">
          {NAV_CARDS.map(({ href, title, subtitle, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              onClick={() => onOpenChange(false)}
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-premium-gold hover:bg-golden/10 hover:shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
            >
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-premium-gold/50 bg-golden/10",
                  accent
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="flex-1">
                <span className="block text-lg font-bold text-gray-900">{title}</span>
                <span className="mt-1 block text-sm font-medium leading-relaxed text-gray-700">
                  {subtitle}
                </span>
              </span>
              <span className={cn("transition group-hover:translate-x-1", accent)}>
                →
              </span>
            </Link>
          ))}
        </div>

        <a
          href={talkHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onOpenChange(false)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
        >
          <WhatsappIcon className="h-5 w-5" />
          Talk to Executive
        </a>
        <p className="mt-2 text-center text-[11px] text-gray-500">
          WhatsApp: {whatsappNumber}
        </p>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hero "Book a Service" button — opens the navigation dialog.
 */
export function ServiceNavButton({
  whatsappNumber,
  waMessage,
}: {
  whatsappNumber: string;
  waMessage: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-glow-whatsapp inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-whatsapp px-8 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition hover:bg-[var(--jaiguru-whatsapp-hover)] hover:shadow-[0_12px_36px_rgba(37,211,102,0.5)] sm:w-auto"
      >
        <Sparkles className="h-5 w-5" />
        Book a Service
      </button>

      <ServiceNavModal
        open={open}
        onOpenChange={setOpen}
        whatsappNumber={whatsappNumber}
        waMessage={waMessage}
      />
    </>
  );
}