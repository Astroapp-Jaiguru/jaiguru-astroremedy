import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

/**
 * Public site data layer.
 * Reads editable content from the database (SiteSetting / ThemeSetting /
 * Announcement / SocialLink models) and falls back to design defaults so the
 * site renders correctly even if the database is unreachable.
 */

export interface AnnouncementData {
  id: string;
  title: string | null;
  text: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  fontStyle: string | null;
  speed: number;
  isActive: boolean;
  sortOrder: number;
}

export interface SocialLinkData {
  platform: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
}

const DEFAULT_ANNOUNCEMENTS: Omit<AnnouncementData, "id">[] = [
  {
    title: "Astrology Course Announcement",
    text: "New Batch for Astrology Course Starting Soon || Consultation Fee: ₹700",
    textColor: "#111827",
    backgroundColor: "#FACC15",
    fontSize: 15,
    fontStyle: "bold",
    speed: 30,
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Home & Online Consultations Announcement",
    text: "Home Visits Available in Kolkata || Worldwide Online Consultations Available",
    textColor: "#FFFFFF",
    backgroundColor: "#4C1D95",
    fontSize: 15,
    fontStyle: "normal",
    speed: 30,
    isActive: true,
    sortOrder: 2,
  },
];

const DEFAULT_SOCIALS: SocialLinkData[] = [
  { platform: "facebook", url: "", sortOrder: 1, isActive: true },
  { platform: "youtube", url: "", sortOrder: 2, isActive: true },
  { platform: "instagram", url: "", sortOrder: 3, isActive: true },
  { platform: "twitter", url: "", sortOrder: 4, isActive: true },
  { platform: "whatsapp", url: "", sortOrder: 5, isActive: true },
  { platform: "googlebusiness", url: "", sortOrder: 6, isActive: true },
];

/** Default content used when a SiteSetting row is missing. */
export const defaultSiteData = {
  branding: {
    siteName: siteConfig.name,
    logoAlt: `${siteConfig.name} Logo`,
    tagline: siteConfig.tagline,
    logo: null as string | null,
    favicon: null as string | null,
  },
  hero: {
    badge: "Trusted Vedic Astrology, Vastu, Numerology & Yoga Guidance in Kolkata",
    astrologerImage: null as string | null,
    masterImage: null as string | null,
    headlineBefore: "Personalized ",
    headlineHighlight: "Astrology, Vastu, Numerology",
    headlineAfter: " & Spiritual Guidance",
    subtext:
      "Consult Vedic Astrologer Arup Shastri (Jai Guru) for astrology, numerology, vastu, yoga and spiritual remedy guidance at Sovabazar, Kolkata.",
    feeText: "Consultation Fee: ₹700",
    buttons: {
      whatsapp: { label: "Book Consultation", active: true },
      call: { label: "Call Now", active: true },
      products: { label: "View Products", active: true },
    },
    trustChips: [
      "Astrology Consultation",
      "Numerology",
      "Vastu",
      "Yoga",
      "Spiritual Remedies",
    ],
    floatingCards: [
      { icon: "receipt", label: "Consultation", value: "₹700" },
      { icon: "store", label: "Kolkata Chamber", value: "Sovabazar Metro" },
      { icon: "whatsapp", label: "WhatsApp Booking", value: "Fast Response" },
    ],
  },
  contact: {
    whatsappNumber: siteConfig.contact.whatsappNumber,
    whatsappDisplay: siteConfig.contact.whatsappDisplay,
    callNumber: siteConfig.contact.callNumber,
    callDisplay: siteConfig.contact.callDisplay,
    bookingLabel: siteConfig.contact.bookingLabel,
    email: siteConfig.contact.email,
    address: siteConfig.chamber.address,
    landmark: siteConfig.chamber.landmark,
    businessHours: "Mon - Sat: 10:00 AM - 8:00 PM | Sun: By Appointment",
    consultationFee: siteConfig.consultation.astrologyFee,
    upiId: siteConfig.contact.upiId,
  },
  footer: {
    about:
      "Premium Vedic Astrology, Vastu, Numerology, Yoga and Spiritual Remedy guidance in Kolkata by Vedic Astrologer Arup Shastri (Jai Guru).",
    ownedBy: siteConfig.business.ownedByLine,
    registered: siteConfig.business.registeredLine,
    copyright: siteConfig.business.copyrightLine,
  },
} as const;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function deepMerge<T extends object>(base: T, override: DeepPartial<T>): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value === null || value === undefined) continue;
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof out[key] === "object" &&
      out[key] !== null &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(
        out[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

export interface SiteData {
  branding: typeof defaultSiteData.branding;
  hero: typeof defaultSiteData.hero;
  contact: typeof defaultSiteData.contact;
  footer: typeof defaultSiteData.footer;
  socials: SocialLinkData[];
  announcements: AnnouncementData[];
}

/**
 * Loads all editable public site content in a single query.
 * Merged with design defaults, memoized per request.
 */
export const getSiteData = cache(async (): Promise<SiteData> => {
  const [siteSettings, socialRows, announcementRows] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 2,
    }),
  ]);

  const settingsMap = new Map(siteSettings.map((s) => [s.key, s.value]));

  const branding = deepMerge(
    defaultSiteData.branding,
    (settingsMap.get("branding") as DeepPartial<typeof defaultSiteData.branding>) ??
      {}
  );
  const hero = deepMerge(
    defaultSiteData.hero,
    (settingsMap.get("hero") as DeepPartial<typeof defaultSiteData.hero>) ?? {}
  );
  const contact = deepMerge(
    defaultSiteData.contact,
    (settingsMap.get("contact") as DeepPartial<typeof defaultSiteData.contact>) ??
      {}
  );
  const footer = deepMerge(
    defaultSiteData.footer,
    (settingsMap.get("footer") as DeepPartial<typeof defaultSiteData.footer>) ?? {}
  );

  const socials: SocialLinkData[] = socialRows.length
    ? socialRows.map((r) => ({
        platform: r.platform,
        url: r.url,
        sortOrder: r.sortOrder,
        isActive: r.isActive,
      }))
    : DEFAULT_SOCIALS;

  const announcements: AnnouncementData[] = announcementRows.length
    ? announcementRows.map((r) => ({
        id: r.id,
        title: r.title,
        text: r.text,
        textColor: r.textColor,
        backgroundColor: r.backgroundColor,
        fontSize: r.fontSize,
        fontStyle: r.fontStyle,
        speed: r.speed,
        isActive: r.isActive,
        sortOrder: r.sortOrder,
      }))
    : DEFAULT_ANNOUNCEMENTS.map((a, i) => ({
        id: `default-${i + 1}`,
        ...a,
      }));

  return {
    branding,
    hero,
    contact,
    footer,
    socials,
    announcements,
  };
});

/** Theme palette values (editable from admin Theme settings). */
export interface ThemePalette {
  primary: string;
  golden: string;
  premiumGold: string;
  whatsapp: string;
  deepNavy: string;
  indigoDeep: string;
}

export const getThemePalette = cache(async (): Promise<ThemePalette> => {
  const settings = await prisma.themeSetting.findMany();
  const colors = settings.find((s) => s.key === "colors")?.value as
    | Partial<ThemePalette>
    | undefined;
  return {
    primary: colors?.primary ?? "#4C1D95",
    golden: colors?.golden ?? "#FACC15",
    premiumGold: colors?.premiumGold ?? "#D4AF37",
    whatsapp: colors?.whatsapp ?? "#25D366",
    deepNavy: colors?.deepNavy ?? "#0F172A",
    indigoDeep: colors?.indigoDeep ?? "#312E81",
  };
});
