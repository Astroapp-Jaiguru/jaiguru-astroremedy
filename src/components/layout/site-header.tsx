import Link from "next/link";
import { WhatsAppButton, CallButton } from "@/components/layout/cta-buttons";
import { NavMenu, MAIN_NAV_ITEMS } from "@/components/layout/nav-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";

/**
 * Main Header (scope UI spec §5.2).
 * Sticky, white/translucent with backdrop blur. Square logo placeholder,
 * brand wordmark in Playfair Display, desktop navigation and pill CTAs.
 */
export function SiteHeader({
  branding,
  contact,
  whatsappHref,
  socials,
}: {
  branding: {
    siteName: string;
    logoAlt: string;
    logo: string | null;
  };
  contact: {
    callNumber: string;
  };
  whatsappHref: string;
  socials: { platform: string; url: string }[];
}) {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass-header">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6 lg:h-[88px] lg:gap-8 lg:px-8 2xl:max-w-[1520px]">
          {/* Brand */}
          <Link href="/" className="flex min-w-0 items-center gap-3 lg:gap-4">
            <span className="relative flex h-[44px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold-gradient font-heading text-2xl font-bold text-white shadow-[0_8px_24px_rgba(250,204,21,0.35)] ring-1 ring-white/20 lg:h-[52px] lg:w-[52px] lg:text-3xl">
              <span aria-hidden="true">ॐ</span>
            </span>
            <span className="min-w-0">
              <span className="block truncate font-heading text-[20px] font-bold leading-tight tracking-tight text-royal-purple lg:text-[26px]">
                {branding.siteName}
              </span>
              <span className="hidden truncate text-[11px] font-medium text-muted-text lg:block lg:text-xs">
                Vedic Astrologer Arup Shastri (Jai Guru)
              </span>
              <span className="hidden text-[11px] text-muted-text/80 lg:block">
                Expert in Vastu, Numerology, Yoga
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <NavMenu className="xl:ml-3 xl:gap-3.5 2xl:ml-8 2xl:gap-4" />

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
          <div className="flex items-center gap-2 xl:hidden">
            <WhatsAppButton
              href={whatsappHref}
              label="WhatsApp"
              size="sm"
              className="h-10 px-3 text-sm"
            />
            <MobileMenu
              navItems={MAIN_NAV_ITEMS}
              socials={socials}
              whatsappHref={whatsappHref}
              callNumber={contact.callNumber}
            />
          </div>
        </div>
      </div>
    </header>
  );
}