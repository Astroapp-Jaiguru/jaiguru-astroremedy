import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  GraduationCap,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { getServiceBySlug, SERVICE_MODE_LABELS } from "@/lib/services-data";
import { formatPrice } from "@/lib/shop-data";
import { serviceBookingMessage, whatsappLink } from "@/config/site";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.name} | JAIGURU ASTROREMEDY`,
    description:
      service.shortDescription ??
      `${service.name} — ${SERVICE_MODE_LABELS[service.mode]} service by Vedic Astrologer Arup Shastri (Jai Guru), Kolkata.`,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const waHref = whatsappLink(
    serviceBookingMessage({
      name: service.name,
      mode: SERVICE_MODE_LABELS[service.mode],
      price: service.priceLabel ?? service.price,
      url: `https://jaiguruastroremedy.in/services/${service.slug}`,
    })
  );

  return (
    <section className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="transition hover:text-[#FACC15]">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="transition hover:text-[#FACC15]">
            Services
          </Link>
          <span>/</span>
          <span className="truncate text-slate-200">{service.name}</span>
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
            <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
              {service.name}
            </h1>
            {service.shortDescription ? (
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                {service.shortDescription}
              </p>
            ) : null}

            {service.imageUrl ? (
              <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[#D4AF37]/30">
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
                      className="text-sm leading-relaxed text-slate-400"
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
            ) : null}

            {service.benefits.length > 0 ? (
              <div className="mt-10">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
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
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
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
          </div>

          <aside className="h-fit space-y-6 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#1E1B4B]/80 to-[#0F172A]/80 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                Service Price
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-[#FACC15]">
                {service.priceLabel ??
                  (service.price ? formatPrice(service.price) : "On Request")}
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
              </dl>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:bg-[#1EBE5B]"
              >
                <WhatsappIcon className="h-4 w-4" />
                Book on WhatsApp
              </a>
            </div>

            {service.related.length > 0 ? (
              <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#0F172A]/50 p-6">
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
                          {r.priceLabel ??
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
