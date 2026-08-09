import Link from "next/link";
import type { ReactElement } from "react";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { SectionHeading } from "@/components/sections/section-heading";
import { whatsappLink, consultationMessage } from "@/config/site";
import { siteConfig } from "@/config/site";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CONSULTATION_TOPICS } from "@/lib/consultation-topics";

/**
 * Featured consultation cards (scope §7.5).
 * 9 cards on the celestial canvas with gold border, icon, title, short
 * description and a WhatsApp CTA (₹700 consultation fee). Each card links
 * to its dedicated /consultations/<slug> page.
 */
export function ConsultationCards(): ReactElement {
  const number = siteConfig.contact.whatsappNumber;
  return (
    <section
      id="consultations"
      aria-label="Consultation services"
      className="scroll-mt-24 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Expert Consultations"
            title="Begin Your Spiritual"
            highlight="Journey"
            subtitle="Personalised astrological guidance by Vedic Astrologer Arup Shastri (Jai Guru) — online or at our chamber in Kolkata."
          />
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONSULTATION_TOPICS.map((card) => {
            const Icon = card.icon;
            const waMessage = whatsappLink(consultationMessage(card.title), number);
            return (
              <RevealItem key={card.title}>
              <div
                className="group relative flex flex-col overflow-hidden rounded-[var(--jaiguru-card-radius)] glass-card p-6 transition duration-300 hover:-translate-y-1 hover:border-premium-gold/80 hover:shadow-[0_16px_50px_rgba(212,175,55,0.28)]"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-golden/10 blur-2xl" />
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-premium-gold/50 bg-golden/10 text-golden transition group-hover:scale-105">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-white">
                  {card.title}
                </h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-300/90">
                  {card.description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={card.href}
                    className="whitespace-nowrap text-sm font-semibold text-golden transition hover:text-saffron"
                  >
                    Know More →
                  </Link>
                  <a
                    href={waMessage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glow-whatsapp inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-whatsapp px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
                  >
                    <WhatsappIcon className="h-4 w-4" />
                    Book @ {card.fee}
                  </a>
                </div>
              </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}