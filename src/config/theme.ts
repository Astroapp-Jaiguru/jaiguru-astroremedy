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
  };
}
