import Link from "next/link";
import {
  Star,
  Hash,
  Compass,
  Stethoscope,
  Sparkles,
  Gem,
  Activity,
  Shield,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { SectionHeading } from "@/components/sections/section-heading";
import { whatsappLink, consultationMessage } from "@/config/site";
import { siteConfig } from "@/config/site";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { ReactElement } from "react";

/**
 * Featured consultation cards (scope §7.5).
 * 9 cards on a dark royal gradient with gold border, icon, title, short
 * description and a WhatsApp CTA (₹700 consultation fee).
 */
interface ConsultationCard {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  fee: string;
}

const CARDS: ConsultationCard[] = [
  {
    title: "Astrology Consultation",
    description:
      "Complete birth chart reading with personalised predictions for career, health, marriage and finance.",
    icon: Star,
    href: "/astrology-consultation",
    fee: "₹700",
  },
  {
    title: "Numerology Consultation",
    description:
      "Name, number and date-of-birth analysis to unlock luck, and correct remedies for a harmonious life.",
    icon: Hash,
    href: "/numerology-consultation",
    fee: "₹700",
  },
  {
    title: "Vastu Consultation",
    description:
      "In-depth vastu analysis for home, office or business with practical corrective remedies.",
    icon: Compass,
    href: "/vastu-consultation",
    fee: "₹700",
  },
  {
    title: "Medical Astrology Guidance",
    description:
      "Health insights from your birth chart and natural remedies to improve wellbeing and balance.",
    icon: Stethoscope,
    href: "/medical-astrology",
    fee: "₹700",
  },
  {
    title: "Spiritual Remedy Guidance",
    description:
      "Personalised mantra, ritual and spiritual remedies to dissolve obstacles and negative energy.",
    icon: Sparkles,
    href: "/spiritual-remedies",
    fee: "₹700",
  },
  {
    title: "Gemstone Recommendation",
    description:
      "Right gemstone, quality and timing recommendation based on your exact kundali birth chart.",
    icon: Gem,
    href: "/contact",
    fee: "₹700",
  },
  {
    title: "Yoga Guidance",
    description:
      "Personalised asanas, pranayama and meditation routines for health, peace and focus.",
    icon: Activity,
    href: "/yoga-guidance",
    fee: "₹700",
  },
  {
    title: "Black Magic Protection Guidance",
    description:
      "Detection of negative energies and traditional protective remedies for safety and peace of mind.",
    icon: Shield,
    href: "/black-magic-protection",
    fee: "₹700",
  },
  {
    title: "Personal Problem Guidance",
    description:
      "Support for love, family, business and emotional problems with honest astrological direction.",
    icon: HeartHandshake,
    href: "/contact",
    fee: "₹700",
  },
];

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
          {CARDS.map((card) => {
            const Icon = card.icon;
            const waMessage = whatsappLink(consultationMessage(card.title), number);
            return (
              <RevealItem key={card.title}>
              <div
                className="group relative flex flex-col overflow-hidden rounded-3xl border-2 border-[#D4AF37]/40 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#4C1D95] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/80 hover:shadow-[0_16px_50px_rgba(212,175,55,0.18)]"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#FACC15]/10 blur-2xl" />
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/50 bg-[#FACC15]/10 text-[#FACC15] transition group-hover:scale-105">
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
                    className="whitespace-nowrap text-sm font-semibold text-[#FACC15] transition hover:text-[#F97316]"
                  >
                    Know More →
                  </Link>
                  <a
                    href={waMessage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#1EBE5B]"
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