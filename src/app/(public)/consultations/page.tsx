import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CONSULTATION_TOPICS } from "@/lib/consultation-topics";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

/**
 * Consultations landing page — lists all 9 consultation topics as premium
 * glass cards. Each links to its dedicated /consultations/<slug> page.
 */
export default function ConsultationsPage() {
  return (
    <section className="py-14 sm:py-20">
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
          {CONSULTATION_TOPICS.map((topic) => (
            <RevealItem key={topic.slug}>
              <Link
                href={topic.href}
                className="glass-card group relative flex h-full flex-col gap-4 overflow-hidden rounded-[var(--jaiguru-service-card-radius)] p-6 transition duration-300 hover:-translate-y-1 hover:border-premium-gold/80 hover:shadow-[0_16px_50px_rgba(212,175,55,0.28)]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-premium-gold/50 bg-golden/10 text-golden transition group-hover:scale-105">
                  <topic.icon className="h-7 w-7" />
                </span>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold text-white">
                    {topic.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300/90">
                    {topic.description}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="whitespace-nowrap rounded-full bg-[#FACC15]/15 px-3 py-1 text-xs font-semibold text-[#FACC15]">
                    {topic.fee}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-[#FACC15] transition group-hover:gap-2 group-hover:text-[#F97316]">
                    Know More <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
