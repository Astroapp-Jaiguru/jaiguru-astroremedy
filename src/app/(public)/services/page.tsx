import Link from "next/link";
import type { Metadata } from "next";
import { Clock, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import {
 getServices,
 SERVICE_MODE_LABELS,
 SERVICE_MODE_SLUGS,
 type ServiceMode,
} from "@/lib/services-data";
import { formatPrice } from "@/lib/shop-data";
import { servicePriceDisplay, type ServicePriceDisplay } from "@/lib/pricing/geo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
 title: "Services & Courses | JAIGURU ASTROREMEDY",
 description:
 "Astrology, numerology, vastu, yoga and spiritual remedy services — online, offline and home service options from Vedic Astrologer Arup Shastri (Jai Guru), Kolkata.",
};

const MODE_TABS: { key: string; label: string }[] = [
 { key: "all", label: "All Services" },
 { key: "online", label: "Online" },
 { key: "offline", label: "Offline" },
 { key: "home-service", label: "Home Service" },
];

function ModeBadge({ mode }: { mode: ServiceMode }) {
 const styles: Record<ServiceMode, string> = {
 ONLINE: "bg-sky-500/15 text-sky-300 border-sky-400/40",
 OFFLINE: "bg-[#4C1D95]/30 text-purple-200 border-[#D4AF37]/40",
 HOME_SERVICE: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
 };
 return (
 <span
 className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${styles[mode]}`}
 >
 {SERVICE_MODE_LABELS[mode]}
 </span>
 );
}

export default async function ServicesPage({
 searchParams,
}: PageProps<"/services">) {
 const sp = await searchParams;
 const modeKey = typeof sp?.mode === "string" ? sp.mode : "all";
 const mode = modeKey === "all" ? null : SERVICE_MODE_SLUGS[modeKey] ?? null;
 const services = await getServices(mode);
 const modeCounts = await getServices();

  const countFor = (key: string) =>
    key === "all"
      ? modeCounts.length
      : modeCounts.filter((s) => s.mode === SERVICE_MODE_SLUGS[key]).length;

  const converted = new Map(
    await Promise.all(
      services.map(
        async (s): Promise<[string, ServicePriceDisplay | null]> => [
          s.id,
          await servicePriceDisplay(s.price, s.priceLabel),
        ]
      )
    )
  );

 return (
 <section className="scroll-mt-24 py-16 sm:py-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <SectionHeading
 eyebrow="Guidance & Courses"
 title="Our"
 highlight="Services"
 subtitle="Astrology, numerology, vastu, yoga and spiritual remedy guidance by Arup Shastri ( Jai Guru )— available online, at the chamber or at your home ( 100% Privacy )."
 />

 <div className="flex flex-wrap items-center justify-center gap-2.5">
 {MODE_TABS.map((tab) => {
 const isActive =
 tab.key === "all" ? modeKey === "all" : modeKey === tab.key;
 return (
 <Link
 key={tab.key}
 href={tab.key === "all" ? "/services" : `/services?mode=${tab.key}`}
 className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
 isActive
 ? "border-[#D4AF37] bg-gradient-to-r from-[#FACC15] to-[#F97316] text-slate-900"
 : "border-[#D4AF37]/40 bg-[#0F172A]/60 text-slate-300 hover:border-[#D4AF37]/80"
 }`}
 >
 {tab.label}
 <span className="ml-2 text-xs opacity-70">
 {countFor(tab.key)}
 </span>
 </Link>
 );
 })}
 </div>

 <p className="mt-6 text-center text-sm text-[color:var(--jaiguru-page-text-muted)]">
 Showing {services.length} service
 {services.length === 1 ? "" : "s"}
 </p>

 {services.length === 0 ? (
  <div className="mt-10 rounded-[var(--jaiguru-card-radius)] border border-dashed border-premium-gold/30 bg-deep-navy/40 p-16 text-center text-slate-400">
 No services in this category yet. Please check back soon.
 </div>
 ) : (
 <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
 {services.map((s) => (
 <article
 key={s.id}
 className="group relative flex flex-col gap-4 overflow-hidden rounded-[var(--jaiguru-service-card-radius)] p-6 glass-card transition duration-300 hover:-translate-y-1 hover:border-premium-gold/60"
 >
 <div className="flex items-center justify-between gap-3">
 <ModeBadge mode={s.mode} />
 <span className="text-xs font-medium uppercase tracking-wider text-[#D4AF37]">
 {s.categoryName}
 </span>
 </div>
 <div>
 <h3 className="font-display text-xl font-bold text-white">
 <Link href={`/services/${s.slug}`} className="hover:text-[#FACC15]">
 {s.name}
 </Link>
 </h3>
 {s.shortDescription ? (
 <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
 {s.shortDescription}
 </p>
 ) : null}
 </div>
 <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
 {s.duration ? (
 <span className="inline-flex items-center gap-1.5">
 <Clock className="h-3.5 w-3.5 text-[#FACC15]" /> {s.duration}
 </span>
 ) : null}
 {s.mode === "HOME_SERVICE" ? (
 <span className="inline-flex items-center gap-1.5">
 <MapPin className="h-3.5 w-3.5 text-[#FACC15]" /> Home visits
 </span>
 ) : null}
 </div>
  <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
  <span className="flex flex-col">
    <span className="font-display text-lg font-bold text-[#FACC15]">
    {converted.get(s.id)?.label ??
    s.priceLabel ??
    (s.price ? formatPrice(s.price) : "On Request")}
    </span>
    {converted.get(s.id)?.note ? (
    <span className="mt-0.5 text-[10px] text-slate-500">
    {converted.get(s.id)?.note}
    </span>
    ) : null}
  </span>
 <Link
 href={`/services/${s.slug}`}
 className="whitespace-nowrap rounded-full border-2 border-[#D4AF37] px-5 py-2 text-xs font-semibold text-[#FACC15] transition hover:bg-[#FACC15] hover:text-slate-900"
 >
 View Details
 </Link>
 </div>
 </article>
 ))}
 </div>
 )}
 </div>
 </section>
 );
}
