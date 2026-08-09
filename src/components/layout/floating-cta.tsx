import { Phone } from "lucide-react";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { getSiteData } from "@/lib/site-data";
import { whatsappLink } from "@/config/site";

/**
 * Floating CTAs (scope UI spec §20).
 * Desktop: WhatsApp + Call stack bottom-right.
 * Mobile: sticky bottom bar with Call Now + WhatsApp.
 */
export async function FloatingCta() {
  const data = await getSiteData();
  const contact = data.contact;
  const waHref = whatsappLink(
    `Hello ${data.branding.siteName}, I want to book a consultation.`,
    contact.whatsappNumber
  );
  const telHref = `tel:${contact.callNumber}`;

  return (
    <>
      {/* Desktop: floating stack */}
      <div className="fixed bottom-6 right-6 z-40 hidden flex-col gap-3 md:flex">
        <a
          href={telHref}
          aria-label="Call Now"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--jaiguru-cta-primary)] text-white shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
        >
          <Phone className="h-6 w-6" />
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_12px_35px_rgba(37,211,102,0.4)] transition-transform hover:scale-105"
        >
          <WhatsappIcon className="h-7 w-7" />
        </a>
      </div>

      {/* Mobile: sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-2 md:hidden">
        <a
          href={telHref}
          className="flex items-center justify-center gap-2 bg-[var(--jaiguru-cta-primary)] text-[15px] font-semibold text-white"
        >
          <Phone className="h-5 w-5" />
          Call Now
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-whatsapp text-[15px] font-semibold text-white"
        >
          <WhatsappIcon className="h-5 w-5" />
          WhatsApp
        </a>
      </div>
    </>
  );
}