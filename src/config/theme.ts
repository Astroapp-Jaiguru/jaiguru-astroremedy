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
};

export const THEME_STORAGE_KEY = "theme";

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
  return {
    primary: hex(v.primary, THEME_DEFAULTS.primary),
    secondary: hex(v.secondary, THEME_DEFAULTS.secondary),
    accent: hex(v.accent, THEME_DEFAULTS.accent),
    accent2: hex(v.accent2, THEME_DEFAULTS.accent2),
    accent3: hex(v.accent3, THEME_DEFAULTS.accent3),
    whatsapp: hex(v.whatsapp, THEME_DEFAULTS.whatsapp),
    emerald: hex(v.emerald, THEME_DEFAULTS.emerald),
    deepNavy: hex(v.deepNavy, THEME_DEFAULTS.deepNavy),
    pageBackground: hex(
      v.pageBackground,
      THEME_DEFAULTS.pageBackground
    ),
    primaryTextColor: hex(
      v.primaryTextColor,
      THEME_DEFAULTS.primaryTextColor
    ),
    secondaryTextColor: hex(
      v.secondaryTextColor,
      THEME_DEFAULTS.secondaryTextColor
    ),
    ctaPrimary: hex(v.ctaPrimary, THEME_DEFAULTS.ctaPrimary),
    cardBackground: hex(v.cardBackground, THEME_DEFAULTS.cardBackground),
    cardBorder: hex(v.cardBorder, THEME_DEFAULTS.cardBorder),
    heroGradientStart: hex(
      v.heroGradientStart,
      THEME_DEFAULTS.heroGradientStart
    ),
    heroGradientEnd: hex(
      v.heroGradientEnd,
      THEME_DEFAULTS.heroGradientEnd
    ),
    topbarGradientStart: hex(
      v.topbarGradientStart,
      THEME_DEFAULTS.topbarGradientStart
    ),
    topbarGradientEnd: hex(
      v.topbarGradientEnd,
      THEME_DEFAULTS.topbarGradientEnd
    ),
    footerGradientStart: hex(
      v.footerGradientStart,
      THEME_DEFAULTS.footerGradientStart
    ),
    footerGradientEnd: hex(
      v.footerGradientEnd,
      THEME_DEFAULTS.footerGradientEnd
    ),
    goldGradientStart: hex(
      v.goldGradientStart,
      THEME_DEFAULTS.goldGradientStart
    ),
    goldGradientEnd: hex(
      v.goldGradientEnd,
      THEME_DEFAULTS.goldGradientEnd
    ),
    bodyFont: font(v.bodyFont, BODY_FONTS, THEME_DEFAULTS.bodyFont),
    headingFont: font(
      v.headingFont,
      HEADING_FONTS,
      THEME_DEFAULTS.headingFont
    ),
    bodyFontSize: num(v.bodyFontSize, THEME_DEFAULTS.bodyFontSize, 12, 20),
    headingScale: num(
      v.headingScale,
      THEME_DEFAULTS.headingScale,
      0.8,
      1.3
    ),
    cardRadius: num(v.cardRadius, THEME_DEFAULTS.cardRadius, 0, 32),
    buttonRadius: num(
      v.buttonRadius,
      THEME_DEFAULTS.buttonRadius,
      0,
      9999
    ),
    sectionSpacing: num(
      v.sectionSpacing,
      THEME_DEFAULTS.sectionSpacing,
      32,
      160
    ),
    productCardRadius: num(
      v.productCardRadius,
      THEME_DEFAULTS.productCardRadius,
      0,
      32
    ),
    serviceCardRadius: num(
      v.serviceCardRadius,
      THEME_DEFAULTS.serviceCardRadius,
      0,
      32
    ),
    legalTitleColor: hex(v.legalTitleColor, THEME_DEFAULTS.legalTitleColor),
    legalBreadcrumbColor: hex(
      v.legalBreadcrumbColor,
      THEME_DEFAULTS.legalBreadcrumbColor
    ),
    legalCardBackground: hex(
      v.legalCardBackground,
      THEME_DEFAULTS.legalCardBackground
    ),
    legalCardBorder: hex(v.legalCardBorder, THEME_DEFAULTS.legalCardBorder),
    legalTextColor: hex(v.legalTextColor, THEME_DEFAULTS.legalTextColor),
    legalHeadingColor: hex(
      v.legalHeadingColor,
      THEME_DEFAULTS.legalHeadingColor
    ),
    contactFormSurface: hex(
      v.contactFormSurface,
      THEME_DEFAULTS.contactFormSurface
    ),
    contactFormLabelColor: hex(
      v.contactFormLabelColor,
      THEME_DEFAULTS.contactFormLabelColor
    ),
    experienceBannerBackground: hex(
      v.experienceBannerBackground,
      THEME_DEFAULTS.experienceBannerBackground
    ),
    experienceBannerTextColor: hex(
      v.experienceBannerTextColor,
      THEME_DEFAULTS.experienceBannerTextColor
    ),
    experienceBannerBorder: hex(
      v.experienceBannerBorder,
      THEME_DEFAULTS.experienceBannerBorder
    ),
  };
}
