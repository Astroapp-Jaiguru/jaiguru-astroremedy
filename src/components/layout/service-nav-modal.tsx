"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { cn } from "@/lib/utils";

/**
 * Hero "Book a Service" button — opens a navigation dialog with the three
 * main booking paths (Consultation / Course / Product) plus a direct
 * "Talk to Executive" WhatsApp shortcut.
 */
export function ServiceNavButton({
  whatsappNumber,
  waMessage,
}: {
  whatsappNumber: string;
  waMessage: string;
}) {
  const [open, setOpen] = useState(false);

  const cards = [
    {
      href: "/consultations",
      title: "Book a Consultation",
      subtitle: "Astrology, numerology, vastu & more — ₹700",
      emoji: "📅",
      accent: "text-golden",
    },
    {
      href: "/services",
      title: "Book a Course",
      subtitle: "Vedic astrology & yoga courses — online or in person",
      emoji: "📚",
      accent: "text-saffron",
    },
    {
      href: "/products",
      title: "Buy a Product",
      subtitle: "Rudraksha, gemstones & spiritual remedies",
      emoji: "🛍️",
      accent: "text-emerald-300",
    },
  ];

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          overlayClassName="bg-deep-navy/70 backdrop-blur-md"
          className="max-w-[calc(100%-2rem)] sm:max-w-md"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="font-display text-xl font-bold text-white">
            What would you like to book?
          </DialogTitle>
          <p className="mt-1 text-sm text-slate-300/80">
            Choose a service to get started.
          </p>

          <div className="mt-5 grid gap-3">
            {cards.map(({ href, title, subtitle, emoji, accent }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-4 rounded-2xl border border-premium-gold/40 bg-white/5 p-4 transition hover:border-premium-gold/80 hover:bg-white/10"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-premium-gold/50 bg-golden/10 text-lg">
                  {emoji}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-white">{title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-300/80">
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
            href={waMessage}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
          >
            <WhatsappIcon className="h-5 w-5" />
            Talk to Executive
          </a>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            WhatsApp: {whatsappNumber}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}