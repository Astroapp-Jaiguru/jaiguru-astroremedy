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
import { getSiteData } from "@/lib/site-data";
import { PaymentButton } from "@/components/shop/payment-button";
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

function ServiceCard({
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
  const price = service.priceLabel ?? formatPrice(service.price);
  const waMessage = whatsappLink(
    serviceBookingMessage(
      {
        name: service.name,
        mode: label,
        price,
        url: `/services/${service.slug}`,
      },
      upiId
    ),
    number
  );
  const GroupIcon = group.slug.includes("yoga") ? GraduationCap : BookOpen;
  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--jaiguru-service-card-radius)] bg-gradient-to-b from-white to-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(76,29,149,0.45)]">
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#312E81] to-[#4C1D95]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(250,204,21,0.2),transparent_55%)]" />
        <GroupIcon className="h-14 w-14 text-[#FACC15]/70 drop-shadow-[0_0_18px_rgba(250,204,21,0.4)]" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/60 bg-[#0F172A]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#FACC15] backdrop-blur">
          <Icon className="h-3 w-3" />
          {label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3 className="font-display text-lg font-bold leading-snug text-slate-900">
          {service.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
          {service.shortDescription}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-[#FACC15]/20 px-2.5 py-1 font-semibold text-[#9A6B00]">
            {service.duration ?? "Flexible"}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="whitespace-nowrap">
            <span className="text-xl font-bold text-[#4C1D95]">{price}</span>
          </div>
          <PaymentButton
            label="Book"
            icon={<WhatsappIcon className="h-3.5 w-3.5" />}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--jaiguru-btn-radius)] bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#1EBE5B]"
            itemName={service.name}
            priceLabel={price}
            price={service.price}
            upiId={upiId}
            whatsappNumber={number}
            whatsappMessage={waMessage}
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
        <SectionHeading
          eyebrow="Courses & Services"
          title="Featured"
          highlight="Services"
          subtitle="Learn Vedic Astrology and Yoga directly from Jai Guru — online, offline and personal home guidance."
        />
        <div className="flex flex-col gap-16">
          {groups.map((group) => (
            <div key={group.slug}>
              <div className="mb-8 flex items-center gap-4">
                <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                  {group.name}
                </h3>
                <span className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/60 to-transparent" />
                <span className="whitespace-nowrap rounded-full border border-[#D4AF37]/40 bg-[#FACC15]/10 px-3 py-1 text-xs font-semibold text-[#FACC15]">
                  {group.services.length} packages
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    group={group}
                    number={number}
                    upiId={upiId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#4C1D95] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(76,29,149,0.45)] transition hover:bg-[#3B0F82]"
          >
            View All Services
          </Link>
          <Link
            href="/astrology-course"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#D4AF37] px-8 py-3 text-sm font-semibold text-[#FACC15] transition hover:bg-[#FACC15] hover:text-slate-900"
          >
            Join Astrology Course
          </Link>
        </div>
      </div>
    </section>
  );
}