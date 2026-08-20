import { getSiteData } from "@/lib/site-data";
import { getConsultationTopics } from "@/lib/consultation-topics";
import { getGallerySections } from "@/lib/gallery-data";
import { getArticlesEnabled } from "@/lib/articles-data";
import { prisma } from "@/lib/prisma";
import { buildNavMenu } from "@/lib/product-navigation";
import { TopHeader } from "@/components/layout/top-header";
import { SiteHeader } from "@/components/layout/site-header";
import { AnnouncementBars } from "@/components/layout/announcements";
import { whatsappLink } from "@/config/site";

/**
 * Public site header shell: top contact bar, sticky main header and the
 * two scrolling announcement bars. Reads editable content from the database.
 */
export async function SiteHeaderShell() {
  const [data, topics, sections, articlesEnabled, navNodes] = await Promise.all([
    getSiteData(),
    getConsultationTopics(),
    getGallerySections(),
    getArticlesEnabled(),
    prisma.productNavigation.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        kind: true,
        parentId: true,
        isActive: true,
        sortOrder: true,
      },
    }),
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
  const productNav = buildNavMenu(navNodes);

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
        productNav={productNav}
        showArticles={articlesEnabled}
      />
      <AnnouncementBars announcements={data.announcements} />
    </>
  );
}