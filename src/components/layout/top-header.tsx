import { Phone, UserRoundCheck } from "lucide-react";
import {
  SocialIconRow,
  WhatsappIcon,
} from "@/components/layout/social-icons";
import { whatsappLink } from "@/config/site";

/**
 * Top Header / Contact Bar (scope UI spec §5.1).
 * Background, text, icons and borders are fully controlled by the active
 * theme (--jaiguru-topbar-* variables) so every theme changes the bar.
 */
export function TopHeader({
  contact,
  socials,
}: {
  contact: {
    bookingLabel: string;
    whatsappDisplay: string;
    whatsappNumber: string;
    callDisplay: string;
    callNumber: string;
  };
  socials: { platform: string; url: string }[];
}) {
  const waHref = whatsappLink(
    "Hello JAIGURU ASTROREMEDY, I want to book a consultation.",
    contact.whatsappNumber
  );

  return (
    <div className="bg-topbar-gradient border-b border-[color:var(--jaiguru-topbar-border)] text-[color:var(--jaiguru-topbar-text)]">
      <div className="mx-auto flex h-[42px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: booking + contact numbers */}
        <div className="flex min-w-0 items-center gap-3 text-sm">
          <span className="hidden items-center gap-1.5 font-medium opacity-75 sm:flex">
            <UserRoundCheck className="h-4 w-4" />
            {contact.bookingLabel}
          </span>
          <span className="hidden opacity-40 sm:block" aria-hidden="true">
            |
          </span>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-100"
          >
            <WhatsappIcon className="h-4 w-4" />
            <span className="truncate">{contact.whatsappDisplay}</span>
          </a>
          <a
            href={`tel:${contact.callNumber}`}
            className="flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-100"
          >
            <Phone className="h-4 w-4" />
            <span className="truncate">{contact.callDisplay}</span>
          </a>
        </div>

        {/* Right: social icons (hidden on mobile/tablet - they live in the
            mobile menu drawer so the phone numbers never overlap) */}
        <SocialIconRow
          links={socials}
          variant="dark"
          size="sm"
          className="hidden lg:flex"
        />
      </div>
    </div>
  );
}