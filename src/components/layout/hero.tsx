import { LucideIcon, Receipt, Store, Star } from "lucide-react";
import {
  WhatsAppButton,
  CallButton,
  OutlineButton,
} from "@/components/layout/cta-buttons";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { getSiteData } from "@/lib/site-data";
import { whatsappLink } from "@/config/site";
import { Starfield } from "@/components/motion/starfield";
import { Reveal } from "@/components/motion/reveal";

const FLOATING_ICONS: Record<string, LucideIcon> = {
  receipt: Receipt,
  store: Store,
  whatsapp: WhatsappIcon as unknown as LucideIcon,
};

function Mandala() {
  return (
    <svg
      viewBox="0 0 600 600"
      className="pointer-events-none absolute -right-40 top-1/2 h-[900px] w-[900px] -translate-y-1/2 opacity-[0.07]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <circle cx="300" cy="300" r="290" />
      <circle cx="300" cy="300" r="240" />
      <circle cx="300" cy="300" r="190" strokeDasharray="3 8" />
      <g>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI) / 6;
          const cx = 300 + 265 * Math.cos(angle);
          const cy = 300 + 265 * Math.sin(angle);
          return <circle key={i} cx={cx} cy={cy} r="14" />;
        })}
      </g>
      <g>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4 + Math.PI / 8;
          const cx = 300 + 220 * Math.cos(angle);
          const cy = 300 + 220 * Math.sin(angle);
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx="20"
              ry="34"
              transform={`rotate(${i * 45} ${cx} ${cy})`}
            />
          );
        })}
      </g>
      <circle cx="300" cy="300" r="70" strokeDasharray="6 6" />
    </svg>
  );
}

export async function Hero() {
  const data = await getSiteData();
  const hero = data.hero;
  const contact = data.contact;

  if (!hero.active) return null;

  const waMessage = whatsappLink(
    [
      `Hello ${data.branding.siteName},`,
      "",
      "I want to book a consultation (₹700).",
      "",
      "My Name:",
      "My Date of Birth:",
      "My Place of Birth:",
      "Preferred Date & Time:",
    ].join("\n"),
    contact.whatsappNumber
  );

  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      {/* Cosmic background layers */}
      <div className="hero-stars absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="hero-glow-top absolute inset-0" aria-hidden="true" />
      <div className="hero-glow-purple absolute inset-0" aria-hidden="true" />
      <div
        className="hero-glow-gold absolute inset-0"
        aria-hidden="true"
      />
      <Mandala />
      <div className="glow-aurora-emerald absolute inset-0" aria-hidden="true" />
      <div className="glow-aurora-violet absolute inset-0" aria-hidden="true" />
      <Starfield count={18} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-4 sm:px-6 lg:min-h-[720px] lg:grid-cols-[55fr_45fr] lg:items-start lg:gap-10 lg:px-8 lg:pb-24 lg:pt-4">
        {/* Left: content */}
        <Reveal className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-golden/35 bg-golden/10 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-golden backdrop-blur-sm">
            <Star className="h-3.5 w-3.5" />
            {hero.badge}
          </span>

          <h1 className="mt-6 font-heading text-[clamp(2.125rem,1rem+3.2vw,4.25rem)] font-bold leading-[1.08] text-white [text-shadow:0_2px_30px_rgba(250,204,21,0.25)]">
            {hero.headlineLine1 && (
              <span className="block">{hero.headlineLine1}</span>
            )}
            <span className="block text-gold-gradient">
              {hero.headlineLine2 || "Astrology, Vastu, Numerology"}
            </span>
            {hero.headlineLine3 && (
              <span className="block">{hero.headlineLine3}</span>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg lg:mx-0">
            {hero.subtext}
          </p>

          {/* Fee + experience pills */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-golden/60 bg-white/5 px-5 py-2 shadow-[0_8px_30px_rgba(250,204,21,0.15)] backdrop-blur">
              <SparkleDot />
              <span className="text-[15px] font-semibold text-golden">
                {hero.feeText}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-golden/35 bg-golden/10 px-5 py-2 backdrop-blur">
              <Star className="h-4 w-4 text-golden" />
              <span className="text-[15px] font-semibold text-golden">
                {data.astrologer.yearsExperience} Years of Vedic Experience
              </span>
            </span>
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <WhatsAppButton
              href={waMessage}
              label={hero.buttons.whatsapp.label}
              size="lg"
              className="w-full sm:w-auto"
            />
            <CallButton
              href={`tel:${contact.callNumber}`}
              label={hero.buttons.call.label}
              size="lg"
              variant="gold"
              className="w-full sm:w-auto"
            />
            <OutlineButton
              href="/products"
              label={hero.buttons.products.label}
              size="lg"
              className="w-full sm:w-auto"
            />
          </div>

          {/* Trust chips */}
          <div className="mt-9 flex flex-wrap justify-center gap-2.5 lg:justify-start">
            {hero.trustChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-white/85 transition-colors hover:border-golden/40 hover:text-golden"
              >
                {chip}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Right: astrologer image + master image + floating cards */}
        <Reveal delay={0.15} className="relative mx-auto w-full max-w-[420px] lg:max-w-[460px]">
          {/* Floating cards (desktop) */}
          <div className="absolute -left-6 top-16 z-20 hidden animate-float lg:block">
            <FloatingCard icon="receipt" label="Consultation" value="₹700" />
          </div>
          <div className="absolute -left-8 bottom-44 z-20 hidden animate-float-slow lg:block">
            <FloatingCard icon="store" label="Kolkata Chamber" value="Sovabazar" />
          </div>
          <div className="absolute -right-4 bottom-14 z-20 hidden animate-float lg:block">
            <FloatingCard icon="whatsapp" label="WhatsApp Booking" value="Fast Response" />
          </div>

          {/* Astrologer main image (frame + master circle shifted down ~45px on desktop for visual balance) */}
          <div className="relative mt-3 md:mt-[57px]">
            <div className="relative overflow-hidden rounded-[calc(var(--jaiguru-card-radius)*2)] border-2 border-golden/45 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="relative aspect-[4/5] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.astrologerImage ?? "/astrologer.jpeg"}
                  alt={`${data.astrologer.title} ${data.astrologer.name}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Guru / master circular image */}
            <div className="absolute -right-2 -top-[18px] z-30 sm:-right-4">
              <div className="relative">
                <div
                  className="flex h-[78px] w-[78px] items-center justify-center overflow-hidden rounded-full border-4 border-golden bg-indigo-deep shadow-[0_12px_35px_rgba(250,204,21,0.35)] sm:h-[110px] sm:w-[110px]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--jaiguru-secondary) 0%, var(--jaiguru-primary) 60%, var(--jaiguru-accent-3) 160%)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.masterImage ?? "/master.jpeg"}
                    alt={`Guru Blessings - ${data.astrologer.name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="absolute left-1/2 top-full mt-2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-golden px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-deep-navy shadow-md">
                  Jai Guru
                </span>
              </div>
            </div>
          </div>

          {/* Floating cards (mobile compact row) */}
          <div className="mt-8 grid grid-cols-3 gap-2.5 lg:hidden">
            {hero.floatingCards.map(
              (card) =>
                card && (
                  <div
                    key={card.label}
                    className="glass-frost rounded-[18px] px-2 py-3 text-center shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                  >
                    <FloatingIcon name={card.icon} />
                    <p className="mt-1.5 text-[10px] font-semibold text-white">
                      {card.label}
                    </p>
                    <p className="text-[12px] font-bold text-golden">
                      {card.value}
                    </p>
                  </div>
                )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SparkleDot() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-golden"
      aria-hidden="true"
    >
      <path d="M12 1.5 14.8 9.2 22 12l-7.2 2.8L12 21.5 9.2 14.8 2 12l7.2-2.8 2.8-7.7z" />
    </svg>
  );
}

function FloatingIcon({ name }: { name: string }) {
  const Icon = FLOATING_ICONS[name] ?? Receipt;
  return <Icon className="mx-auto h-6 w-6 text-golden" />;
}

function FloatingCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-frost flex items-center gap-2.5 rounded-[18px] px-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-golden/20">
        <FloatingIcon name={icon} />
      </span>
      <span>
        <span className="block text-[11px] font-semibold text-deep-navy">
          {label}
        </span>
        <span className="block text-[13px] font-bold text-royal-purple">
          {value}
        </span>
      </span>
    </div>
  );
}