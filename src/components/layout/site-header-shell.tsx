import { getSiteData } from "@/lib/site-data";
import { TopHeader } from "@/components/layout/top-header";
import { SiteHeader } from "@/components/layout/site-header";
import { AnnouncementBars } from "@/components/layout/announcements";
import { whatsappLink } from "@/config/site";

/**
 * Public site header shell: top contact bar, sticky main header and the
 * two scrolling announcement bars. Reads editable content from the database.
 */
export async function SiteHeaderShell() {
  const data = await getSiteData();

  return (
    <>
      <TopHeader
        contact={{
          bookingLabel: data.contact.bookingLabel,
          whatsappDisplay: data.contact.whatsappDisplay,
          whatsappNumber: data.contact.whatsappNumber,
          callDisplay: data.contact.callDisplay,
          callNumber: data.contact.callNumber,
        }}
        socials={data.socials}
      />
      <SiteHeader
        branding={{
          siteName: data.branding.siteName,
          logoAlt: data.branding.logoAlt,
          logo: data.branding.logo,
        }}
        contact={{ callNumber: data.contact.callNumber }}
        whatsappHref={whatsappLink(
          `Hello ${data.branding.siteName}, I want to book a consultation.`,
          data.contact.whatsappNumber
        )}
        socials={data.socials}
      />
      <AnnouncementBars announcements={data.announcements} />
    </>
  );
}