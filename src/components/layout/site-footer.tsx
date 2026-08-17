import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Mail, Star, Building2 } from "lucide-react";
import {
  SocialIconRow,
  WhatsappIcon,
  GoogleIcon,
} from "@/components/layout/social-icons";
import { getSiteData } from "@/lib/site-data";
import { getLegalPages } from "@/lib/legal-data";
import { getGallerySections } from "@/lib/gallery-data";
import { getArticlesEnabled } from "@/lib/articles-data";
import { whatsappLink, siteConfig } from "@/config/site";
import { SubscribeForm } from "@/components/layout/subscribe-form";

/**
 * Footer (scope UI spec §19).
 * Theme-controlled premium background + heading color, 4 columns: brand /
 * quick links / products-services / contact + socials. Gold headings,
 * circular gold social buttons. Logo matches the header logo exactly
 * (same image + size, managed by the same Branding settings).
 */
export async function SiteFooter() {
  const [data, legalPages, gallerySections, articlesEnabled] = await Promise.all([
    getSiteData(),
    getLegalPages(),
    getGallerySections(),
    getArticlesEnabled(),
  ]);
  const contact = data.contact;

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Consultations", href: "/consultations" },
    { label: "Products", href: "/products" },
    ...(articlesEnabled ? [{ label: "Articles", href: "/articles" }] : []),
    { label: "Testimonials", href: "/testimonials" },
    { label: "Contact", href: "/contact" },
  ];

  const catalogLinks = [
    { label: "Astrology Consultation", href: "/consultations/astrology" },
    { label: "Numerology Consultation", href: "/consultations/numerology" },
    { label: "Vastu Consultation", href: "/consultations/vastu" },
    { label: "Yoga Guidance", href: "/consultations/yoga" },
    { label: "Spiritual Remedies", href: "/consultations/spiritual-remedies" },
    ...(gallerySections.photo
      ? [{ label: "Photo Gallery", href: "/photo-gallery" }]
      : []),
    ...(gallerySections.video
      ? [{ label: "Video Gallery", href: "/video-gallery" }]
      : []),
    ...(gallerySections.youtube
      ? [{ label: "YouTube Gallery", href: "/youtube-gallery" }]
      : []),
  ];

  return (
    <footer className="bg-dark-premium text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* 1. Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold-gradient font-heading text-xl font-bold text-white shadow-[0_8px_24px_rgba(250,204,21,0.35)] ring-1 ring-white/20 sm:h-11 sm:w-11 sm:text-2xl xl:h-[52px] xl:w-[52px] xl:text-3xl">
                <Image
                  src={data.branding.footerLogo ?? data.branding.logo ?? "/favicon.png"}
                  alt={data.branding.logoAlt}
                  fill
                  unoptimized={!!(data.branding.footerLogo ?? data.branding.logo)}
                  sizes="52px"
                  className="h-full w-full object-cover"
                />
              </span>
              <div>
                <p data-typo="branding-footerBrand" className="font-heading text-xl font-bold text-white">
                  {data.branding.siteName}
                </p>
                <p className="text-xs text-white/70">
                  <span data-typo="astrologer-title">{data.astrologer.title}</span>{" "}
                  <span data-typo="astrologer-name">{data.astrologer.name}</span>
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/70">
              {data.footer.about}
            </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-golden/35 bg-golden/10 px-4 py-1.5 text-[13px] font-semibold text-golden">
                <Star className="h-4 w-4" />
                {data.astrologer.yearsExperience} Years of Vedic Experience
              </p>
            <SocialIconRow links={data.socials} className="mt-6" />
            {(() => {
              const g = data.socials.find(
                (s) => s.platform === "googlebusiness"
              );
              return g?.url ? (
                <a
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[13px] text-white/75 transition-colors hover:border-golden/50 hover:text-golden"
                >
                  <GoogleIcon className="h-4 w-4 text-golden" />
                  Visit our Google Business Profile
                </a>
              ) : null;
            })()}
            <SubscribeForm />
          </div>

          {/* 2. Quick links */}
          <FooterColumn title="Quick Links">
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/72 transition-colors hover:text-golden"
                  >
                    <span className="h-1 w-1 rounded-full bg-golden/60 transition-all group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          {/* 3. Products & services */}
          <FooterColumn title="Our Services">
            <ul className="space-y-2.5">
              {catalogLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/72 transition-colors hover:text-golden"
                  >
                    <span className="h-1 w-1 rounded-full bg-golden/60 transition-all group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          {/* 4. Contact */}
          <FooterColumn title="Contact Us">
            <ul className="space-y-4 text-sm text-white/72">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-golden" />
                <span className="text-white/85">
                  Chamber: {contact.address}, {contact.landmark}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-golden" />
                <span className="text-white/85">
                  {siteConfig.registeredOffice.fullLine}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <WhatsappIcon className="h-4 w-4 shrink-0 text-golden" />
                <a
                  href={whatsappLink("", contact.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-golden"
                >
                  {contact.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-golden" />
                <a
                  href={`tel:${contact.callNumber}`}
                  className="transition-colors hover:text-golden"
                >
                  {contact.callDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-golden" />
                <span>{contact.businessHours}</span>
              </li>
              {contact.email ? (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-golden" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="transition-colors hover:text-golden"
                  >
                    {contact.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </FooterColumn>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[color:var(--jaiguru-footer-border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 pb-24 pt-5 text-center text-[13px] text-white/60 sm:flex-row sm:px-6 lg:px-8 lg:pb-5">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            {[data.footer.copyright, data.footer.ownedBy, data.footer.registered]
              .filter((line) => line && line.trim())
              .map((line) => (
                <small key={line} className="block">{line}</small>
              ))}
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
            {legalPages.map((page) => (
              <Link
                key={page.slug}
                href={`/legal/${page.slug}`}
                className="transition-colors hover:text-golden"
              >
                {page.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="font-heading text-lg font-bold text-[color:var(--jaiguru-footer-heading)]">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}