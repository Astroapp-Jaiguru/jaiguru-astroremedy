"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

/**
 * Homepage FAQ accordion - glassmorphism cards with gold accents that
 * match the premium spiritual theme.
 */
export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((item) => {
        const isOpen = open === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-2xl border backdrop-blur-xl transition-colors",
              isOpen
                ? "border-premium-gold/60 bg-golden/10 shadow-[0_10px_35px_rgba(212,175,55,0.18)]"
                : "border-white/10 bg-white/5 hover:border-premium-gold/40 hover:bg-white/[0.07]"
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold sm:flex",
                    isOpen
                      ? "border-premium-gold/70 bg-gold-gradient text-slate-900"
                      : "border-premium-gold/40 text-golden"
                  )}
                >
                  ?
                </span>
                <span className="font-heading text-base font-semibold text-[var(--jaiguru-page-text)] sm:text-lg">
                  {item.question}
                </span>
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "shrink-0 rounded-full border p-1.5",
                  isOpen
                    ? "border-premium-gold/70 text-golden"
                    : "border-white/20 text-[var(--jaiguru-page-text-muted)]"
                )}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-premium-gold/25 px-5 pb-5 pt-4 sm:px-6">
                    {item.category ? (
                      <span className="mb-2 inline-block rounded-full border border-premium-gold/40 bg-golden/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-golden">
                        {item.category}
                      </span>
                    ) : null}
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--jaiguru-page-text-muted)] sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}