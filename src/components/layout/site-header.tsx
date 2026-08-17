import Link from "next/link";
import Image from "next/image";
import { WhatsAppButton, CallButton } from "@/components/layout/cta-buttons";
import { NavMenu } from "@/components/layout/nav-menu";
import { MAIN_NAV_ITEMS } from "@/components/layout/nav-items";
import { MobileMenu } from "@/components/layout/mobile-menu";

/**
 * Main Header (scope UI spec §5.2).
 * Sticky, white/translucent with backdrop blur. Logo image (CMS override,
 * falls back to the site favicon), brand wordmark in Playfair Display,
 * desktop navigation and pill CTAs.
 */
export function SiteHeader({
  branding,
  contact,
  whatsappHref,
  socials,
  consultationTopics,
}: {
  branding: {
    siteName: string;
    tagline: string;
    logoAlt: string;
    logo: string | null;
  };
  contact: {
    callNumber: string;
  };
  whatsappHref: string;
  socials: { platform: string; url: string }[];
  consultationTopics: { label: string; href: string }[];
}) {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass-header">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:h-[72px] sm:gap-4 sm:px-6 xl:h-[88px] xl:gap-8 xl:px-8 2xl:max-w-[1520px]">
          {/* Brand */}
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3 xl:gap-4">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold-gradient font-heading text-xl font-bold text-white shadow-[0_8px_24px_rgba(250,204,21,0.35)] ring-1 ring-white/20 sm:h-11 sm:w-11 sm:text-2xl xl:h-[52px] xl:w-[52px] xl:text-3xl">
              <Image
                src={branding.logo ?? "/favicon.png"}
                alt={branding.logoAlt}
                fill
                unoptimized={!!branding.logo}
                sizes="52px"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="min-w-0">
              <span data-typo="branding-siteName" className="block whitespace-nowrap font-heading text-base font-bold leading-tight tracking-tight text-royal-purple sm:text-lg xl:text-[26px]">
                {branding.siteName}
              </span>
              <span data-typo="branding-tagline" className="hidden truncate text-[11px] font-medium text-muted-foreground lg:block lg:text-xs">
                {branding.tagline}
              </span>
              <span className="hidden text-[11px] text-muted-foreground/80 lg:block">
                Expert in Vastu, Numerology, Yoga
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <NavMenu
            consultationTopics={consultationTopics}
            className="xl:ml-3 xl:gap-3.5 2xl:ml-8 2xl:gap-4"
          />

          {/* Desktop CTA area */}
          <div className="hidden items-center gap-2 xl:flex xl:ml-4 2xl:ml-8 2xl:gap-3">
            <WhatsAppButton
              href={whatsappHref}
              label="WhatsApp"
              size="sm"
              className="xl:px-2.5 2xl:px-4"
              labelClassName="hidden 2xl:inline"
            />
            <CallButton
              href={`tel:${contact.callNumber}`}
              size="sm"
              className="xl:px-2.5 2xl:px-4"
              labelClassName="hidden 2xl:inline"
            />
          </div>

          {/* Mobile menu */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 xl:hidden">
            <WhatsAppButton
              href={whatsappHref}
              label="WhatsApp"
              size="sm"
              className="h-9 gap-1 px-2 text-xs sm:h-10 sm:px-3 sm:text-sm"
              labelClassName="hidden min-[400px]:inline"
            />
            <MobileMenu
              navItems={MAIN_NAV_ITEMS.map((item) =>
                item.label === "Consultations" && consultationTopics.length
                  ? { ...item, children: consultationTopics }
                  : item
              )}
              socials={socials}
              whatsappHref={whatsappHref}
              callNumber={contact.callNumber}
              siteName={branding.siteName}
              tagline={branding.tagline}
              logo={branding.logo}
              logoAlt={branding.logoAlt}
            />
          </div>
        </div>
      </div>
    </header>
  );
}