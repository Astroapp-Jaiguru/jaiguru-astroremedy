/**
 * Theme settings (Phase 8) - values stored in the ThemeSetting model under
 * the "theme" key as JSON and applied to the public frontend via CSS custom
 * properties injected by <ThemeStyles />.
 */

export interface ThemeSettings {
  primary: string;
  secondary: string;
  accent: string;
  bodyFont: string;
  headingFont: string;
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

export const THEME_DEFAULTS: ThemeSettings = {
  primary: "#4C1D95",
  secondary: "#312E81",
  accent: "#FACC15",
  bodyFont: "inter",
  headingFont: "playfair-display",
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
  experienceBannerBackground: "#FACC15",
  experienceBannerTextColor: "#111827",
  experienceBannerBorder: "#D4AF37",
};

export const THEME_STORAGE_KEY = "theme";

export const BODY_FONTS = [
  { id: "inter", label: "Inter" },
  { id: "poppins", label: "Poppins" },
  { id: "lato", label: "Lato" },
  { id: "roboto", label: "Roboto" },
  { id: "montserrat", label: "Montserrat" },
  { id: "open-sans", label: "Open Sans" },
] as const;

export const HEADING_FONTS = [
  { id: "playfair-display", label: "Playfair Display" },
  { id: "merriweather", label: "Merriweather" },
  { id: "lora", label: "Lora" },
  { id: "cormorant-garamond", label: "Cormorant Garamond" },
  { id: "dm-serif-display", label: "DM Serif Display" },
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
    bodyFont: font(v.bodyFont, BODY_FONTS, THEME_DEFAULTS.bodyFont),
    headingFont: font(
      v.headingFont,
      HEADING_FONTS,
      THEME_DEFAULTS.headingFont
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
