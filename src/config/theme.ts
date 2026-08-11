/**
 * Theme settings (Phase 8) - values stored in the ThemeSetting model under
 * the "theme" key as JSON and applied to the public frontend via CSS custom
 * properties injected by <ThemeStyles />.
 */

export interface ThemeSettings {
  primary: string;
  secondary: string;
  accent: string;
  accent2: string;
  accent3: string;
  whatsapp: string;
  emerald: string;
  deepNavy: string;
  pageBackground: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  ctaPrimary: string;
  cardBackground: string;
  cardBorder: string;
  heroGradientStart: string;
  heroGradientEnd: string;
  topbarGradientStart: string;
  topbarGradientEnd: string;
  footerGradientStart: string;
  footerGradientEnd: string;
  goldGradientStart: string;
  goldGradientEnd: string;
  bodyFont: string;
  headingFont: string;
  bodyFontSize: number;
  headingScale: number;
  cardRadius: number;
  buttonRadius: number;
  sectionSpacing: number;
  productCardRadius: number;
  serviceCardRadius: number;
  legalTitleColor: string;
  legalBreadcrumbColor: string;
  legalCardBackground: string;
  legalCardBorder: string;
  legalTextColor: string;
  legalHeadingColor: string;
  contactFormSurface: string;
  contactFormLabelColor: string;
  experienceBannerBackground: string;
  experienceBannerTextColor: string;
  experienceBannerBorder: string;
  topbarBackground: string;
  topbarTextColor: string;
  announcementBar1Background: string;
  announcementBar1TextColor: string;
  announcementBar2Background: string;
  announcementBar2TextColor: string;
  footerBackground: string;
  footerHeadingColor: string;
}

/**
 * Design defaults = the "Deep Space Luxe" preset. New installations and
 * the "Reset" button in /admin/theme-settings start from this palette.
 */
export const THEME_DEFAULTS: ThemeSettings = {
  primary: "#4C1D95",
  secondary: "#1E1B4B",
  accent: "#D4AF37",
  accent2: "#EAB308",
  accent3: "#B45309",
  whatsapp: "#10B981",
  emerald: "#10B981",
  deepNavy: "#0F172A",
  pageBackground: "#0F172A",
  primaryTextColor: "#0F172A",
  secondaryTextColor: "#64748B",
  ctaPrimary: "#4C1D95",
  cardBackground: "#FFF7ED",
  cardBorder: "#D4AF37",
  heroGradientStart: "#0F172A",
  heroGradientEnd: "#4C1D95",
  topbarGradientStart: "#0F172A",
  topbarGradientEnd: "#4C1D95",
  footerGradientStart: "#111827",
  footerGradientEnd: "#312E81",
  goldGradientStart: "#FACC15",
  goldGradientEnd: "#F97316",
  bodyFont: "inter",
  headingFont: "playfair-display",
  bodyFontSize: 16,
  headingScale: 1,
  cardRadius: 12,
  buttonRadius: 9999,
  sectionSpacing: 80,
  productCardRadius: 16,
  serviceCardRadius: 16,
  legalTitleColor: "#4C1D95",
  legalBreadcrumbColor: "#111827",
  legalCardBackground: "#FFFFFF",
  legalCardBorder: "#D4AF37",
  legalTextColor: "#111827",
  legalHeadingColor: "#4C1D95",
  contactFormSurface: "#1E1B4B",
  contactFormLabelColor: "#FFFFFF",
  experienceBannerBackground: "#D4AF37",
  experienceBannerTextColor: "#111827",
  experienceBannerBorder: "#B45309",
  topbarBackground: "#0F172A",
  topbarTextColor: "#D4AF37",
  announcementBar1Background: "#10B981",
  announcementBar1TextColor: "#FFFFFF",
  announcementBar2Background: "#D4AF37",
  announcementBar2TextColor: "#0F172A",
  footerBackground: "#111827",
  footerHeadingColor: "#D4AF37",
};

export const THEME_STORAGE_KEY = "theme";

// ---------------------------------------------------------------------------
// WCAG contrast helpers (Theme Quality Audit)
// Guards every editable text color so no theme can render illegible text:
// preferred color is kept when it passes 4.5:1 on its background, otherwise
// the closest of white / dark ink that does pass is chosen automatically.
// ---------------------------------------------------------------------------

function luminance(hex: string): number {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return 0;
  const n = Number.parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Returns `preferred` when it is readable on `bg`, else a readable ink. */
function readableText(bg: string, preferred: string): string {
  if (contrastRatio(preferred, bg) >= 4.5) return preferred;
  const WHITE = "#FFFFFF";
  const INK = "#0F172A";
  return contrastRatio(WHITE, bg) >= contrastRatio(INK, bg) ? WHITE : INK;
}

export function contrastText(bgHex: string, preferredHex: string): string {
  return readableText(bgHex, preferredHex);
}

export const BODY_FONTS = [
  { id: "inter", label: "Inter" },
  { id: "poppins", label: "Poppins" },
  { id: "lato", label: "Lato" },
  { id: "roboto", label: "Roboto" },
  { id: "montserrat", label: "Montserrat" },
  { id: "open-sans", label: "Open Sans" },
  { id: "georgia", label: "Georgia" },
  { id: "arial", label: "Arial" },
] as const;

export const HEADING_FONTS = [
  { id: "playfair-display", label: "Playfair Display" },
  { id: "merriweather", label: "Merriweather" },
  { id: "lora", label: "Lora" },
  { id: "cormorant-garamond", label: "Cormorant Garamond" },
  { id: "dm-serif-display", label: "DM Serif Display" },
  { id: "georgia", label: "Georgia" },
  { id: "arial", label: "Arial" },
] as const;

/** Validates and normalizes a raw JSON value from the database. */
export function normalizeTheme(raw: unknown): ThemeSettings {
  const v =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};
  const hex = (x: unknown, fb: string) =>
    typeof x === "string" && /^#[0-9a-fA-F]{3,8}$/.test(x) ? x : fb;
  const num = (x: unknown, fb: number, min: number, max: number) => {
    const n = typeof x === "number" ? x : Number.parseFloat(String(x));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb;
  };
  const font = (x: unknown, list: readonly { id: string }[], fb: string) =>
    typeof x === "string" && list.some((f) => f.id === x) ? x : fb;

  // Backgrounds first - the text colors below are contrast-guarded against them.
  const pageBackground = hex(v.pageBackground, THEME_DEFAULTS.pageBackground);
  const cardBackground = hex(v.cardBackground, THEME_DEFAULTS.cardBackground);
  const heroGradientStart = hex(v.heroGradientStart, THEME_DEFAULTS.heroGradientStart);
  const heroGradientEnd = hex(v.heroGradientEnd, THEME_DEFAULTS.heroGradientEnd);
  const topbarBackground = hex(v.topbarBackground, THEME_DEFAULTS.topbarBackground);
  const footerBackground = hex(v.footerBackground, THEME_DEFAULTS.footerBackground);
  const legalCardBackground = hex(v.legalCardBackground, THEME_DEFAULTS.legalCardBackground);
  const contactFormSurface = hex(v.contactFormSurface, THEME_DEFAULTS.contactFormSurface);
  const experienceBannerBackground = hex(v.experienceBannerBackground, THEME_DEFAULTS.experienceBannerBackground);
  const announcementBar1Background = hex(v.announcementBar1Background, THEME_DEFAULTS.announcementBar1Background);
  const announcementBar2Background = hex(v.announcementBar2Background, THEME_DEFAULTS.announcementBar2Background);

  // TEXT = contrast-guarded against its own background surface.
  const TEXT = (bg: string, key: string, fb: string) => {
    const candidate = hex(v[key], fb);
    return contrastText(bg, candidate);
  };

  return {
    primary: hex(v.primary, THEME_DEFAULTS.primary),
    secondary: hex(v.secondary, THEME_DEFAULTS.secondary),
    accent: hex(v.accent, THEME_DEFAULTS.accent),
    accent2: hex(v.accent2, THEME_DEFAULTS.accent2),
    accent3: hex(v.accent3, THEME_DEFAULTS.accent3),
    whatsapp: hex(v.whatsapp, THEME_DEFAULTS.whatsapp),
    emerald: hex(v.emerald, THEME_DEFAULTS.emerald),
    deepNavy: hex(v.deepNavy, THEME_DEFAULTS.deepNavy),
    pageBackground,
    primaryTextColor: TEXT(pageBackground, "primaryTextColor", THEME_DEFAULTS.primaryTextColor),
    secondaryTextColor: TEXT(pageBackground, "secondaryTextColor", THEME_DEFAULTS.secondaryTextColor),
    ctaPrimary: hex(v.ctaPrimary, THEME_DEFAULTS.ctaPrimary),
    cardBackground,
    cardBorder: hex(v.cardBorder, THEME_DEFAULTS.cardBorder),
    heroGradientStart,
    heroGradientEnd,
    topbarGradientStart: hex(v.topbarGradientStart, THEME_DEFAULTS.topbarGradientStart),
    topbarGradientEnd: hex(v.topbarGradientEnd, THEME_DEFAULTS.topbarGradientEnd),
    footerGradientStart: hex(v.footerGradientStart, THEME_DEFAULTS.footerGradientStart),
    footerGradientEnd: hex(v.footerGradientEnd, THEME_DEFAULTS.footerGradientEnd),
    goldGradientStart: hex(v.goldGradientStart, THEME_DEFAULTS.goldGradientStart),
    goldGradientEnd: hex(v.goldGradientEnd, THEME_DEFAULTS.goldGradientEnd),
    bodyFont: font(v.bodyFont, BODY_FONTS, THEME_DEFAULTS.bodyFont),
    headingFont: font(v.headingFont, HEADING_FONTS, THEME_DEFAULTS.headingFont),
    bodyFontSize: num(v.bodyFontSize, THEME_DEFAULTS.bodyFontSize, 12, 20),
    headingScale: num(v.headingScale, THEME_DEFAULTS.headingScale, 0.8, 1.3),
    cardRadius: num(v.cardRadius, THEME_DEFAULTS.cardRadius, 0, 32),
    buttonRadius: num(v.buttonRadius, THEME_DEFAULTS.buttonRadius, 0, 9999),
    sectionSpacing: num(v.sectionSpacing, THEME_DEFAULTS.sectionSpacing, 32, 160),
    productCardRadius: num(v.productCardRadius, THEME_DEFAULTS.productCardRadius, 0, 32),
    serviceCardRadius: num(v.serviceCardRadius, THEME_DEFAULTS.serviceCardRadius, 0, 32),
    legalTitleColor: TEXT(legalCardBackground, "legalTitleColor", THEME_DEFAULTS.legalTitleColor),
    legalBreadcrumbColor: hex(v.legalBreadcrumbColor, THEME_DEFAULTS.legalBreadcrumbColor),
    legalCardBackground,
    legalCardBorder: hex(v.legalCardBorder, THEME_DEFAULTS.legalCardBorder),
    legalTextColor: TEXT(legalCardBackground, "legalTextColor", THEME_DEFAULTS.legalTextColor),
    legalHeadingColor: TEXT(legalCardBackground, "legalHeadingColor", THEME_DEFAULTS.legalHeadingColor),
    contactFormSurface,
    contactFormLabelColor: TEXT(contactFormSurface, "contactFormLabelColor", THEME_DEFAULTS.contactFormLabelColor),
    experienceBannerBackground,
    experienceBannerTextColor: TEXT(experienceBannerBackground, "experienceBannerTextColor", THEME_DEFAULTS.experienceBannerTextColor),
    experienceBannerBorder: hex(v.experienceBannerBorder, THEME_DEFAULTS.experienceBannerBorder),
    topbarBackground,
    topbarTextColor: TEXT(topbarBackground, "topbarTextColor", THEME_DEFAULTS.topbarTextColor),
    announcementBar1Background,
    announcementBar1TextColor: TEXT(announcementBar1Background, "announcementBar1TextColor", THEME_DEFAULTS.announcementBar1TextColor),
    announcementBar2Background,
    announcementBar2TextColor: TEXT(announcementBar2Background, "announcementBar2TextColor", THEME_DEFAULTS.announcementBar2TextColor),
    footerBackground,
    footerHeadingColor: TEXT(footerBackground, "footerHeadingColor", THEME_DEFAULTS.footerHeadingColor),
  };
}
