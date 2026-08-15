import Link from "next/link";
import { BookOpen, GraduationCap, Wifi, Building2, Home } from "lucide-react";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { SectionHeading } from "@/components/sections/section-heading";
import {
  getFeaturedServices,
  formatPrice,
  type ServiceGroup,
  type FeaturedService,
} from "@/lib/shop-data";
import { whatsappLink, serviceBookingMessage } from "@/config/site";
import { displayPriceForViewer } from "@/lib/pricing/geo";
import { getSiteData } from "@/lib/site-data";
import { PaymentButton } from "@/components/shop/payment-button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { ReactElement } from "react";

/**
 * Featured services (scope §7.7). The 9 featured service packages grouped
 * under their two main categories (Astrology Course & Yoga Course) in a
 * 3-column grid. Each card has an image placeholder, title, mode badge,
 * duration, price, short description and a WhatsApp "Book" button.
 */

function modeBadge(mode: string): { label: string; Icon: typeof Wifi } {
  if (mode === "ONLINE") return { label: "Online", Icon: Wifi };
  if (mode === "OFFLINE") return { label: "Offline", Icon: Building2 };
  return { label: "Home Service", Icon: Home };
}

async function ServiceCard({
  service,
  group,
  number,
  upiId,
}: {
  service: FeaturedService;
  group: ServiceGroup;
  number: string;
  upiId: string;
}) {
  const { label, Icon } = modeBadge(service.mode);
  const conv =
    service.price && service.price !== "0" && !service.priceLabel
      ? await displayPriceForViewer(service.price)
      : null;
  const price = conv?.label ?? service.priceLabel ?? formatPrice(service.price);
  const waMessage = whatsappLink(
    serviceBookingMessage(
      {
        name: service.name,
        mode: label,
        price,
        url: `/services/${service.slug}`,
        displayPrice: conv?.label ?? null,
      },
      upiId
    ),
    number
  );
  const GroupIcon = group.slug.includes("yoga") ? GraduationCap : BookOpen;
  return (
    <article className="glass-card-light group flex flex-col overflow-hidden rounded-[var(--jaiguru-service-card-radius)] transition-all duration-300 hover:-translate-y-1.5 hover:border-golden/70 hover:shadow-[0_18px_50px_rgba(250,204,21,0.25)]">
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-deep-navy via-indigo-deep to-royal-purple">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(250,204,21,0.2),transparent_55%)]" />
        <GroupIcon className="h-14 w-14 text-golden/70 drop-shadow-[0_0_18px_rgba(250,204,21,0.4)]" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-premium-gold/60 bg-deep-navy/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-golden backdrop-blur">
          <Icon className="h-3 w-3" />
          {label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3 className="font-display text-lg font-bold leading-snug text-[var(--jaiguru-card-text)]">
          {service.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-[var(--jaiguru-card-text-muted)]">
          {service.shortDescription}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-golden/20 px-2.5 py-1 font-semibold text-[var(--jaiguru-accent-ink)]">
            {service.duration ?? "Flexible"}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="whitespace-nowrap">
            <span className="text-xl font-bold text-royal-purple">{price}</span>
          </div>
          <PaymentButton
            label="Book"
            icon={<WhatsappIcon className="h-3.5 w-3.5" />}
            className="btn-glow-whatsapp inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--jaiguru-btn-radius)] bg-whatsapp px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
            itemName={service.name}
            priceLabel={price}
            price={conv?.amount ?? service.price}
            upiId={upiId}
            whatsappNumber={number}
            whatsappMessage={waMessage}
            kind="course"
            defaultMode={service.mode}
            pageUrl={`/services/${service.slug}`}
          />
        </div>
      </div>
    </article>
  );
}

export async function FeaturedServices(): Promise<ReactElement> {
  const [groups, { contact }] = await Promise.all([
    getFeaturedServices(),
    getSiteData(),
  ]);
  if (groups.length === 0) return <></>;

  const number = contact.whatsappNumber;
  const upiId = contact.upiId;

  return (
    <section
      id="featured-services"
      aria-label="Featured services and courses"
      className="scroll-mt-24 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Courses & Services"
            title="Featured"
            highlight="Services"
            subtitle="Learn Vedic Astrology and Yoga directly from Jai Guru — online, offline and personal home guidance."
          />
        </Reveal>
        <RevealGroup className="flex flex-col gap-16">
          {groups.map((group) => (
            <div key={group.slug}>
              <div className="mb-8 flex items-center gap-4">
                <h3 className="font-display text-xl font-bold text-[var(--jaiguru-page-text)] sm:text-2xl">
                  {group.name}
                </h3>
                <span className="h-px flex-1 bg-gradient-to-r from-premium-gold/60 to-transparent" />
                <span className="whitespace-nowrap rounded-full border border-premium-gold/40 bg-golden/10 px-3 py-1 text-xs font-semibold text-golden">
                  {group.services.length} packages
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => (
                  <RevealItem key={service.id}>
                    <ServiceCard
                      service={service}
                      group={group}
                      number={number}
                      upiId={upiId}
                    />
                  </RevealItem>
                ))}
              </div>
            </div>
          ))}
        </RevealGroup>
        <Reveal className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/services"
            className="btn-glow-purple inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--jaiguru-cta-primary)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(76,29,149,0.5)] transition hover:bg-[var(--jaiguru-primary-hover)]"
          >
            View All Services
          </Link>
          <Link
            href="/astrology-course"
            className="btn-glow-gold inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-premium-gold px-8 py-3 text-sm font-semibold text-golden transition hover:bg-golden hover:text-slate-900"
          >
            Join Astrology Course
          </Link>
        </Reveal>
      </div>
    </section>
  );
}