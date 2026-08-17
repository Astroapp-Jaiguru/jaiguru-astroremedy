import { getSiteData } from "@/lib/site-data";
import { getConsultationTopics } from "@/lib/consultation-topics";
import { getGallerySections } from "@/lib/gallery-data";
import { getArticlesEnabled } from "@/lib/articles-data";
import { TopHeader } from "@/components/layout/top-header";
import { SiteHeader } from "@/components/layout/site-header";
import { AnnouncementBars } from "@/components/layout/announcements";
import { whatsappLink } from "@/config/site";

/**
 * Public site header shell: top contact bar, sticky main header and the
 * two scrolling announcement bars. Reads editable content from the database.
 */
export async function SiteHeaderShell() {
  const [data, topics, sections, articlesEnabled] = await Promise.all([
    getSiteData(),
    getConsultationTopics(),
    getGallerySections(),
    getArticlesEnabled(),
  ]);
  const consultationTopics = topics.map((t) => ({
    label: t.title,
    href: t.href,
  }));
  const galleryLinks = [
    ...(sections.photo ? [{ label: "Photo Gallery", href: "/photo-gallery" }] : []),
    ...(sections.video ? [{ label: "Video Gallery", href: "/video-gallery" }] : []),
    ...(sections.youtube
      ? [{ label: "YouTube Gallery", href: "/youtube-gallery" }]
      : []),
  ];

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
          tagline: data.branding.tagline,
          logoAlt: data.branding.logoAlt,
          logo: data.branding.logo,
        }}
        contact={{ callNumber: data.contact.callNumber }}
        whatsappHref={whatsappLink("", data.contact.whatsappNumber)}
        socials={data.socials}
        consultationTopics={consultationTopics}
        galleryLinks={galleryLinks}
        showArticles={articlesEnabled}
      />
      <AnnouncementBars announcements={data.announcements} />
    </>
  );
}