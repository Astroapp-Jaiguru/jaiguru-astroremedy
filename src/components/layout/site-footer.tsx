import type { ReactNode } from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, Mail, Star } from "lucide-react";
import {
  SocialIconRow,
  WhatsappIcon,
} from "@/components/layout/social-icons";
import { getSiteData } from "@/lib/site-data";
import { getLegalPages } from "@/lib/legal-data";
import { whatsappLink } from "@/config/site";

/**
 * Footer (scope UI spec §19).
 * Dark premium gradient, 4 columns: brand / quick links / products-services /
 * contact + socials. Gold headings, circular gold social buttons.
 */
export async function SiteFooter() {
  const [data, legalPages] = await Promise.all([getSiteData(), getLegalPages()]);
  const contact = data.contact;

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Consultations", href: "/consultations" },
    { label: "Products", href: "/products" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Contact", href: "/contact" },
  ];

  const catalogLinks = [
    { label: "Astrology Consultation", href: "/consultations/astrology" },
    { label: "Numerology Consultation", href: "/consultations/numerology" },
    { label: "Vastu Consultation", href: "/consultations/vastu" },
    { label: "Yoga Guidance", href: "/consultations/yoga" },
    { label: "Spiritual Remedies", href: "/consultations/spiritual-remedies" },
    { label: "Photo Gallery", href: "/photo-gallery" },
  ];

  return (
    <footer className="bg-dark-premium text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* 1. Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient font-heading text-2xl font-bold text-white">
                <span aria-hidden="true">ॐ</span>
              </span>
              <div>
                <p className="font-heading text-xl font-bold text-white">
                  {data.branding.siteName}
                </p>
                <p className="text-xs text-white/70">Vedic Astrologer Arup Shastri (Jai Guru)</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/70">
              {data.footer.about}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-golden/35 bg-golden/10 px-4 py-1.5 text-[13px] font-semibold text-golden">
              <Star className="h-4 w-4" />
              20+ Years of Vedic Experience
            </p>
            <SocialIconRow links={data.socials} className="mt-6" />
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
                <span>
                  {contact.address}
                  <br />
                  <span className="font-medium text-white/85">
                    {contact.landmark}
                  </span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <WhatsappIcon className="h-4 w-4 shrink-0 text-golden" />
                <a
                  href={whatsappLink(
                    "Hello JAIGURU ASTROREMEDY,",
                    contact.whatsappNumber
                  )}
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
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 pb-24 pt-5 text-center text-[13px] text-white/60 sm:flex-row sm:px-6 lg:px-8 lg:pb-5">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            {[data.footer.copyright, data.footer.ownedBy, data.footer.registered]
              .filter((line) => line && line.trim())
              .map((line) => (
                <p key={line}>{line}</p>
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
      <h3 className="font-heading text-lg font-bold text-golden">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}