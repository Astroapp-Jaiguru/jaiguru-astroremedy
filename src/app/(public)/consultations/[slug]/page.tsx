import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarCheck, ChevronRight, Sparkles } from "lucide-react";
import {
  CONSULTATION_TOPICS,
  getConsultationTopic,
} from "@/lib/consultation-topics";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProductCard, type ProductCardData } from "@/components/shop/product-card";
import { PaymentButton } from "@/components/shop/payment-button";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { CallButton } from "@/components/layout/cta-buttons";
import {
  getFeaturedProducts,
  getFeaturedServices,
  formatPrice,
  type FeaturedService,
} from "@/lib/shop-data";
import { whatsappLink, consultationMessage } from "@/config/site";
import { getSiteData } from "@/lib/site-data";
import { getVisibleModes } from "@/lib/mode-visibility-actions";
import { ConsultationPricing } from "@/components/shop/consultation-pricing";
import { getRazorpayKeyId } from "@/lib/payments/settings";
import { durationLabel } from "@/lib/booking";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ShareButtons } from "@/components/social/share-buttons";
import { absoluteUrl } from "@/lib/share";

/**
 * Dedicated consultation pages (scope §7.5).
 * Each topic gets a large modern consultation card with the full description,
 * benefit checklist and WhatsApp / call CTAs, followed by "Related Products"
 * and "Related Services" sections that drive purchases and bookings.
 */

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getConsultationTopic(slug);
  if (!topic) return { title: "Consultation not found" };
  const url = absoluteUrl(`/consultations/${topic.slug}`);
  return {
    title: `${topic.title} | JAIGURU ASTROREMEDY`,
    description: topic.longDescription.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "JAIGURU ASTROREMEDY",
      title: topic.title,
      description: topic.longDescription.slice(0, 160),
    },
    twitter: {
      card: "summary_large_image",
      title: topic.title,
      description: topic.longDescription.slice(0, 160),
    },
  };
}

function keywordMatch(text: string, keywords: string[]): boolean {
  const t = text.toLowerCase();
  return keywords.some((k) => t.includes(k.toLowerCase()));
}

export default async function ConsultationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getConsultationTopic(slug);
  if (!topic) notFound();

  const [{ contact }, featuredProducts, serviceGroups, razorpayKeyId, availableModes] =
    await Promise.all([
      getSiteData(),
      getFeaturedProducts(12),
      getFeaturedServices(),
      getRazorpayKeyId(),
      getVisibleModes(),
    ]);

  const number = contact.whatsappNumber;
  const waMessage = whatsappLink(consultationMessage(topic.title), number);

  // Related products: prefer keyword matches, top up with featured ones.
  const keywordProducts = featuredProducts.filter((p) =>
    keywordMatch(
      `${p.name} ${p.category?.name ?? ""} ${p.shortDescription ?? ""}`,
      topic.keywords
    )
  );
  const relatedProducts = [
    ...keywordProducts,
    ...featuredProducts.filter((p) => !keywordProducts.includes(p)),
  ].slice(0, 4);

  // Related services: same strategy.
  const allServices: FeaturedService[] = serviceGroups.flatMap((g) => g.services);
  const keywordServices = allServices.filter((s) =>
    keywordMatch(
      `${s.name} ${s.categoryName} ${s.shortDescription ?? ""}`,
      topic.keywords
    )
  );
  const relatedServices = [
    ...keywordServices,
    ...allServices.filter((s) => !keywordServices.includes(s)),
  ].slice(0, 3);

  const TopicIcon = topic.icon;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div className="hero-glow-top absolute inset-0" aria-hidden="true" />
        <div className="hero-glow-purple absolute inset-0" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm text-slate-300">
            <Link href="/" className="transition hover:text-[#FACC15]">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/consultations" className="transition hover:text-[#FACC15]">Consultations</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-[#FACC15]">{topic.title}</span>
          </nav>

          <Reveal>
            <SectionHeading
              eyebrow="Personalised Guidance"
              title={topic.title}
              highlight=""
              subtitle="One-on-one consultation with Vedic Astrologer Arup Shastri (Jai Guru) — online or at our Kolkata chamber."
            />
          </Reveal>

          {/* Large modern consultation card */}
          <Reveal className="mx-auto max-w-4xl">
            <div className="glass-card group relative overflow-hidden rounded-[var(--jaiguru-service-card-radius)] p-8 sm:p-12">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FACC15]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#4C1D95]/40 blur-3xl" />
              <div className="relative flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:text-left">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--jaiguru-card-radius)] border border-premium-gold/50 bg-golden/10 text-golden shadow-[0_0_35px_rgba(250,204,21,0.25)]">
                  <TopicIcon className="h-10 w-10" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                    {topic.fee} · {durationLabel(topic.durationMinutes)}
                  </p>
                  <div className="mt-3 max-w-sm">
                    <ConsultationPricing
                      topic={topic}
                      availableModes={availableModes}
                    />
                  </div>
                  <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                    {topic.title}
                  </h1>
                  <p className="mt-4 text-base leading-relaxed text-slate-300">
                    {topic.longDescription}
                  </p>

                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {topic.benefits.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 rounded-xl border border-[#D4AF37]/25 bg-white/5 px-4 py-3 text-sm text-slate-200"
                      >
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <PaymentButton
                      label="Book This Consultation"
                      icon={<CalendarCheck className="h-5 w-5" />}
                      className="btn-glow-gold inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-8 py-3.5 text-[15px] font-semibold text-slate-900 shadow-[0_10px_30px_rgba(250,204,21,0.4)] transition hover:brightness-105"
                      itemName={topic.title}
                      priceLabel={topic.fee}
                      price={topic.fee}
                      homePriceLabel={topic.homeFee}
                      upiId={contact.upiId}
                      whatsappNumber={number}
                      whatsappMessage={consultationMessage(topic.title)}
                      razorpayKeyId={razorpayKeyId}
                      kind="consultation"
                      durationMinutes={topic.durationMinutes}
                      availableModes={availableModes}
                      pageUrl={`/consultations/${topic.slug}`}
                    />
                    <CallButton
                      href={`tel:${contact.callNumber}`}
                      label="Call to Book"
                      variant="gold"
                    />
                  </div>
                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400 sm:justify-start">
                    <Sparkles className="h-3.5 w-3.5 text-[#FACC15]" />
                    Prefer chat?{" "}
                    <a
                      href={waMessage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-whatsapp transition hover:text-[#1EBE5B]"
                    >
                      Message us on WhatsApp
                    </a>
                    {" "}— we usually respond within a few hours during business hours.
                  </p>
                  <ShareButtons
                    title={topic.title}
                    description={topic.description}
                    path={`/consultations/${topic.slug}`}
                    className="mt-8"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 ? (
        <section aria-label="Related products" className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="Complete Your Healing"
                title="Related"
                highlight="Products"
                subtitle={`Energised spiritual items that support your ${topic.title.toLowerCase()} — each blessed and ready for use.`}
              />
            </Reveal>
            <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((product) => (
                <RevealItem key={product.id}>
                  <ProductCard product={product as ProductCardData} />
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal className="mt-10 flex justify-center">
              <Link
                href="/products"
                className="btn-glow-purple inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#4C1D95] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(76,29,149,0.5)] transition hover:bg-[#3B0F82]"
              >
                Browse All Products
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Related Services */}
      {relatedServices.length > 0 ? (
        <section aria-label="Related services" className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="Deepen Your Journey"
                title="Related"
                highlight="Services"
                subtitle={`Extend the benefit of your ${topic.title.toLowerCase()} with courses and guided sessions from Jai Guru.`}
              />
            </Reveal>
            <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedServices.map((service) => (
                <RevealItem key={service.id}>
                  <RelatedServiceCard
                    service={service}
                    number={number}
                    upiId={contact.upiId}
                    razorpayKeyId={razorpayKeyId}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal className="mt-10 flex justify-center">
              <Link
                href="/services"
                className="btn-glow-gold inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/10 px-8 py-3 text-sm font-semibold text-[#FACC15] shadow-[0_8px_25px_rgba(212,175,55,0.25)] backdrop-blur transition hover:bg-[#FACC15] hover:text-slate-900"
              >
                View All Services
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Other consultations */}
      <section aria-label="More consultations" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Keep Exploring"
              title="More"
              highlight="Consultations"
              subtitle="Choose the guidance you need next."
            />
          </Reveal>
          <RevealGroup className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {CONSULTATION_TOPICS.filter((t) => t.slug !== topic.slug)
              .slice(0, 6)
              .map((other) => (
                <RevealItem key={other.slug}>
                  <Link
                    href={other.href}
                    className="glass-card flex items-center gap-4 rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-premium-gold/70"
                  >
                    <other.icon className="h-6 w-6 shrink-0 text-[#FACC15]" />
                    <span className="flex-1 text-[15px] font-semibold text-white">
                      {other.title}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                  </Link>
                </RevealItem>
              ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}

function RelatedServiceCard({
  service,
  number,
  upiId,
  razorpayKeyId,
}: {
  service: FeaturedService;
  number: string;
  upiId: string;
  razorpayKeyId: string | null;
}) {
  const price = service.priceLabel ?? formatPrice(service.price);
  const waMessage = whatsappLink(
    [
      "Hello JAIGURU ASTROREMEDY,",
      "",
      `I want to book "${service.name}" (${price}).`,
      "",
      "My Name:",
      "Preferred Date:",
      "Preferred Time:",
    ].join("\n"),
    number
  );
  return (
    <div className="glass-card flex h-full flex-col gap-3 overflow-hidden rounded-[var(--jaiguru-service-card-radius)] p-6 transition hover:-translate-y-1 hover:border-premium-gold/70">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold leading-snug text-white">
          {service.name}
        </h3>
        <span className="shrink-0 rounded-full bg-[#FACC15]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#FACC15]">
          {service.mode.toLowerCase()}
        </span>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-slate-300">
        {service.shortDescription ?? `${service.categoryName} package.`}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="text-xl font-bold text-[#FACC15]">{price}</span>
        <PaymentButton
          label="Book"
          icon={<WhatsappIcon className="h-4 w-4" />}
          className="btn-glow-whatsapp inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-whatsapp px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition hover:bg-[#1EBE5B]"
          itemName={service.name}
          priceLabel={price}
          price={service.price}
          upiId={upiId}
          whatsappNumber={number}
          whatsappMessage={waMessage}
          razorpayKeyId={razorpayKeyId}
          kind="course"
          defaultMode={service.mode}
          pageUrl={`/services/${service.slug}`}
        />
      </div>
    </div>
  );
}
