import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  Clock,
  GraduationCap,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { WhatsappNavTrigger } from "@/components/layout/whatsapp-nav-trigger";
import { getServiceBySlug, SERVICE_MODE_LABELS } from "@/lib/services-data";
import { formatPrice } from "@/lib/shop-data";
import { servicePriceDisplay, type ServicePriceDisplay } from "@/lib/pricing/geo";
import { serviceBookingMessage } from "@/config/site";
import { getSiteData } from "@/lib/site-data";
import { PaymentButton } from "@/components/shop/payment-button";
import { getRazorpayKeyId } from "@/lib/payments/settings";
import { ShareButtons } from "@/components/social/share-buttons";
import { absoluteUrl } from "@/lib/share";

export const dynamic = "force-dynamic";

interface Props {
 params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const { slug } = await params;
 const service = await getServiceBySlug(slug);
 if (!service) return {};
 const url = absoluteUrl(`/services/${service.slug}`);
 const description =
  service.shortDescription ??
  `${service.name} — ${SERVICE_MODE_LABELS[service.mode]} service by Vedic Astrologer Arup Shastri (Jai Guru), Kolkata.`;
 return {
 title: `${service.name} | JAIGURU ASTROREMEDY`,
 description,
 alternates: { canonical: url },
 openGraph: {
  type: "website",
  url,
  siteName: "JAIGURU ASTROREMEDY",
  title: service.name,
  description,
 },
 twitter: {
  card: "summary_large_image",
  title: service.name,
  description,
 },
 };
}

export default async function ServiceDetailPage({ params }: Props) {
 const { slug } = await params;
 const service = await getServiceBySlug(slug);
 if (!service) notFound();

  const [{ contact }, razorpayKeyId] = await Promise.all([
    getSiteData(),
    getRazorpayKeyId(),
  ]);
  const converted = await servicePriceDisplay(service.price, service.priceLabel);
  const priceLabel =
    converted?.label ??
    service.priceLabel ??
    (service.price ? formatPrice(service.price) : "On Request");
  const bookingMessage = serviceBookingMessage(
    {
      name: service.name,
      mode: SERVICE_MODE_LABELS[service.mode],
      price: priceLabel,
      url: `https://www.jaiguruastroremedy.com/services/${service.slug}`,
      displayPrice: converted?.label ?? null,
    },
    contact.upiId
  );
  const relatedConverted = new Map(
    await Promise.all(
      service.related.map(
        async (r): Promise<[string, ServicePriceDisplay | null]> => [
          r.id,
          await servicePriceDisplay(r.price, r.priceLabel),
        ]
      )
    )
  );

 return (
 <section className="scroll-mt-24 py-16 sm:py-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
<nav className="mb-8 flex items-center gap-2 text-sm text-[color:var(--jaiguru-page-text-muted)]">
  <Link href="/" className="transition hover:text-[#FACC15]">
  Home
  </Link>
  <span>/</span>
  <Link href="/services" className="transition hover:text-[#FACC15]">
  Services
  </Link>
  <span>/</span>
  <span className="truncate text-[color:var(--jaiguru-page-text)]">{service.name}</span>
  </nav>

 <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
 <div>
 <div className="flex flex-wrap items-center gap-3">
 <span className="inline-flex items-center rounded-full border border-[#D4AF37]/40 bg-[#4C1D95]/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-200">
 {SERVICE_MODE_LABELS[service.mode]}
 </span>
 <span className="text-xs font-medium uppercase tracking-wider text-[#D4AF37]">
 {service.categoryName}
 </span>
 </div>
<h1 className="mt-4 font-display text-3xl font-bold text-[var(--jaiguru-page-text)] sm:text-4xl">
  {service.name}
  </h1>
  {service.shortDescription ? (
  <p className="mt-4 text-base leading-relaxed text-[color:var(--jaiguru-page-text-muted)]">
 {service.shortDescription}
 </p>
 ) : null}

 {service.imageUrl ? (
  <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[var(--jaiguru-service-card-radius)] border border-premium-gold/30">
 <Image
 src={service.imageUrl}
 alt={service.name}
 fill
 priority
 unoptimized={service.imageUrl.startsWith("http")}
 className="object-cover"
 />
 </div>
 ) : null}

 {service.longDescription ? (
 <div className="mt-8 space-y-4">
 {service.longDescription
 .split(/\n{2,}/)
 .map((paragraph, i) => (
 <p
 key={i}
className="text-sm leading-relaxed text-[color:var(--jaiguru-page-text-muted)]"
  >
  {paragraph}
  </p>
  ))}
  </div>
  ) : null}

  {service.benefits.length > 0 ? (
  <div className="mt-10">
  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[var(--jaiguru-page-text)]">
 <Sparkles className="h-5 w-5 text-[#FACC15]" /> What You Get
 </h2>
 <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
 {service.benefits.map((b, i) => (
 <li
 key={i}
 className="flex items-start gap-2.5 rounded-xl border border-[#D4AF37]/20 bg-[#0F172A]/50 px-4 py-3 text-sm text-slate-300"
 >
 <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
 {b}
 </li>
 ))}
 </ul>
 </div>
 ) : null}

  {service.syllabus.length > 0 ? (
  <div className="mt-10">
  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[var(--jaiguru-page-text)]">
  <GraduationCap className="h-5 w-5 text-[#FACC15]" /> Syllabus /
  What&apos;s Covered
  </h2>
  <ol className="mt-4 space-y-3">
  {service.syllabus.map((item, i) => (
  <li
  key={i}
  className="flex items-start gap-3 rounded-xl border border-[#D4AF37]/20 bg-[#0F172A]/50 px-4 py-3 text-sm text-slate-300"
  >
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FACC15] to-[#F97316] text-xs font-bold text-slate-900">
  {i + 1}
  </span>
  {item}
  </li>
  ))}
  </ol>
  </div>
  ) : null}

  <ShareButtons
  title={service.name}
  description={service.shortDescription ?? undefined}
  path={`/services/${service.slug}`}
  className="mt-10"
  />
  </div>

 <aside className="h-fit space-y-6 lg:sticky lg:top-24">
  <div className="glass-card rounded-[var(--jaiguru-service-card-radius)] p-6">
 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
 Service Price
 </p>
 <p className="mt-2 font-display text-3xl font-bold text-[#FACC15]">
 {priceLabel}
 </p>
 <dl className="mt-5 space-y-3 text-sm">
 <div className="flex items-center gap-3 text-slate-300">
 <Clock className="h-4 w-4 text-[#FACC15]" />
 <dt className="text-slate-400">Duration:</dt>
 <dd>{service.duration ?? "-"}</dd>
 </div>
 <div className="flex items-center gap-3 text-slate-300">
 <MapPin className="h-4 w-4 text-[#FACC15]" />
 <dt className="text-slate-400">Mode:</dt>
 <dd>{SERVICE_MODE_LABELS[service.mode]}</dd>
 </div>
  {service.serviceArea ? (
  <div className="flex items-start gap-3 text-slate-300">
  <Star className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
  <dt className="text-slate-400">Service area:</dt>
  <dd>{service.serviceArea}</dd>
  </div>
  ) : null}
  {service.slotDuration ? (
  <div className="flex items-start gap-3 text-slate-300">
  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
  <dt className="text-slate-400">Session length:</dt>
  <dd>{service.slotDuration >= 60 ? `${service.slotDuration / 60} hour${service.slotDuration / 60 > 1 ? "s" : ""}` : `${service.slotDuration} mins`}</dd>
  </div>
  ) : null}
  </dl>
  <PaymentButton
  label="Book Appointment"
  icon={<CalendarCheck className="h-4 w-4" />}
  className="mt-6 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-8 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-[#FACC15]/25 transition hover:brightness-105"
  itemName={service.name}
  priceLabel={priceLabel}
  price={service.price}
  upiId={contact.upiId}
  whatsappNumber={contact.whatsappNumber}
  whatsappMessage={bookingMessage}
  razorpayKeyId={razorpayKeyId}
  kind={service.categorySlug?.includes("course") ? "course" : "consultation"}
  durationMinutes={service.slotDuration ?? undefined}
  defaultMode={service.mode}
  pageUrl={`/services/${service.slug}`}
  />
  <WhatsappNavTrigger
  whatsappNumber={contact.whatsappNumber}
  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-6 py-3 text-sm font-semibold text-[#25D366] transition hover:bg-[#25D366]/20"
  >
  <WhatsappIcon className="h-4 w-4" />
  Chat directly on WhatsApp
  </WhatsappNavTrigger>
  </div>

 {service.related.length > 0 ? (
  <div className="rounded-[var(--jaiguru-card-radius)] border border-premium-gold/20 bg-deep-navy/50 p-6">
 <h3 className="font-display text-lg font-bold text-white">
 Related Services
 </h3>
 <ul className="mt-4 space-y-3">
 {service.related.map((r) => (
 <li key={r.id}>
 <Link
 href={`/services/${r.slug}`}
 className="group flex items-center justify-between gap-3 text-sm"
 >
 <span className="text-slate-300 transition group-hover:text-[#FACC15]">
 {r.name}
 </span>
  <span className="text-xs text-[#D4AF37]">
  {relatedConverted.get(r.id)?.label ??
  r.priceLabel ??
  (r.price ? formatPrice(r.price) : "On Request")}
  </span>
 </Link>
 </li>
 ))}
 </ul>
 </div>
 ) : null}

 <Link
 href="/services"
 className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#FACC15]"
 >
 <ArrowLeft className="h-4 w-4" /> Back to all services
 </Link>
 </aside>
 </div>
 </div>
 </section>
 );
}
