import { prisma } from "@/lib/prisma";
import {
  normalizeTheme,
  THEME_STORAGE_KEY,
  type ThemeSettings,
} from "@/config/theme";
import {
  bodyFontFamily,
  headingFontFamily,
} from "@/lib/fonts";

/**
 * Injects the admin-configured theme (Phase 9) onto the public frontend as
 * CSS custom properties. Colors, fonts, radii and section spacing are read
 * from the ThemeSetting model and applied instantly on every request.
 */
function isLightColor(hex: string): boolean {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return false;
  const n = Number.parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 165;
}

export async function ThemeStyles() {
  let theme: ThemeSettings = normalizeTheme(undefined);
  try {
    const row = await prisma.themeSetting.findUnique({
      where: { key: THEME_STORAGE_KEY },
    });
    theme = normalizeTheme(row?.value);
  } catch {
    // DB unreachable - fall back to design defaults.
  }

  const bodyFamily = bodyFontFamily(theme.bodyFont);
  const headingFamily = headingFontFamily(theme.headingFont);
  const buttonRadius =
    theme.buttonRadius >= 9999 ? "9999px" : `${theme.buttonRadius}px`;
  const weightCss = (id: string) =>
    (
      [
        { id: "light", css: "300" },
        { id: "normal", css: "400" },
        { id: "medium", css: "500" },
        { id: "semibold", css: "600" },
        { id: "bold", css: "700" },
      ] as const
    ).find((w) => w.id === id)?.css ?? "400";

  /**
   * Contrasting text color for content that sits directly on the page
   * background (section headings etc.): white on dark pages, dark ink on
   * light pages (e.g. the Butter Gold theme).
   */
  const pageTextColor = isLightColor(theme.pageBackground)
    ? "#0F172A"
    : "#FFFFFF";
  const pageTextMuted = `color-mix(in srgb, ${pageTextColor} 78%, var(--jaiguru-page-bg))`;

  const css = `
:root {
  --jaiguru-primary: ${theme.primary};
  --jaiguru-secondary: ${theme.secondary};
  --jaiguru-accent: ${theme.accent};
  --jaiguru-accent-2: ${theme.accent2};
  --jaiguru-accent-3: ${theme.accent3};
  --jaiguru-deep-navy: ${theme.deepNavy};
  --jaiguru-whatsapp: ${theme.whatsapp};
  --jaiguru-emerald: ${theme.emerald};
  --jaiguru-page-bg: ${theme.pageBackground};
  --jaiguru-page-text: ${pageTextColor};
  --jaiguru-page-text-muted: ${pageTextMuted};
  --jaiguru-primary-text: ${theme.primaryTextColor};
  --jaiguru-secondary-text: ${theme.secondaryTextColor};
  --jaiguru-cta-primary: ${theme.ctaPrimary};
  --jaiguru-card-bg: ${theme.cardBackground};
  --jaiguru-card-border: ${theme.cardBorder};
  --jaiguru-hero-1: ${theme.heroGradientStart};
  --jaiguru-hero-3: ${theme.heroGradientEnd};
  --jaiguru-hero-2: color-mix(in srgb, ${theme.heroGradientStart} 50%, ${theme.heroGradientEnd});
  --jaiguru-dark-1: ${theme.footerGradientStart};
  --jaiguru-dark-3: ${theme.footerGradientEnd};
  --jaiguru-dark-2: color-mix(in srgb, ${theme.footerGradientStart} 50%, ${theme.footerGradientEnd});
  --jaiguru-topbar-1: ${theme.topbarGradientStart};
  --jaiguru-topbar-3: ${theme.topbarGradientEnd};
  --jaiguru-topbar-2: color-mix(in srgb, ${theme.topbarGradientStart} 50%, ${theme.topbarGradientEnd});
  --jaiguru-gold-1: ${theme.goldGradientStart};
  --jaiguru-gold-3: ${theme.goldGradientEnd};
  --jaiguru-gold-2: color-mix(in srgb, ${theme.goldGradientStart} 50%, ${theme.goldGradientEnd});
  --jaiguru-btn-radius: ${buttonRadius};
  --jaiguru-card-radius: ${theme.cardRadius}px;
  --jaiguru-product-card-radius: ${theme.productCardRadius}px;
  --jaiguru-service-card-radius: ${theme.serviceCardRadius}px;
  --jaiguru-section-spacing: ${theme.sectionSpacing}px;
  --jaiguru-body-font: ${bodyFamily};
  --jaiguru-heading-font: ${headingFamily};
  --jaiguru-body-font-size: ${theme.bodyFontSize}px;
  --jaiguru-heading-scale: ${theme.headingScale};
  --jaiguru-h1-scale: ${theme.h1FontSize};
  --jaiguru-h2-scale: ${theme.h2FontSize};
  --jaiguru-h3-scale: ${theme.h3FontSize};
  --jaiguru-h4-scale: ${theme.h4FontSize};
  --jaiguru-small-font-size: ${theme.smallFontSize}px;
  --jaiguru-body-weight: ${weightCss(theme.bodyFontWeight)};
  --jaiguru-heading-weight: ${weightCss(theme.headingFontWeight)};
  --jaiguru-letter-spacing: ${theme.letterSpacing}em;
  --jaiguru-line-height: ${theme.lineHeight};
  --jaiguru-heading-text: ${theme.headingTextColor};
  --jaiguru-gradient-text-1: ${theme.gradientTextStart};
  --jaiguru-gradient-text-3: ${theme.gradientTextEnd};
  --jaiguru-gradient-text-2: color-mix(in srgb, ${theme.gradientTextStart} 50%, ${theme.gradientTextEnd});
  --jaiguru-legal-title-color: ${theme.legalTitleColor};
  --jaiguru-legal-breadcrumb-color: ${theme.legalBreadcrumbColor};
  --jaiguru-legal-card-background: ${theme.legalCardBackground};
  --jaiguru-legal-card-border: ${theme.legalCardBorder};
  --jaiguru-legal-text-color: ${theme.legalTextColor};
  --jaiguru-legal-heading-color: ${theme.legalHeadingColor};
  --jaiguru-contact-surface: ${theme.contactFormSurface};
  --jaiguru-contact-label-color: ${theme.contactFormLabelColor};
  --jaiguru-experience-bg: ${theme.experienceBannerBackground};
  --jaiguru-experience-text: ${theme.experienceBannerTextColor};
  --jaiguru-experience-border: ${theme.experienceBannerBorder};
  --jaiguru-topbar-bg: ${theme.topbarBackground};
  --jaiguru-topbar-text: ${theme.topbarTextColor};
  --jaiguru-topbar-border: color-mix(in srgb, ${theme.topbarTextColor} 22%, transparent);
  --jaiguru-announcement-1-bg: ${theme.announcementBar1Background};
  --jaiguru-announcement-1-text: ${theme.announcementBar1TextColor};
  --jaiguru-announcement-1-border: color-mix(in srgb, ${theme.announcementBar1TextColor} 30%, transparent);
  --jaiguru-announcement-2-bg: ${theme.announcementBar2Background};
  --jaiguru-announcement-2-text: ${theme.announcementBar2TextColor};
  --jaiguru-announcement-2-border: color-mix(in srgb, ${theme.announcementBar2TextColor} 30%, transparent);
  --jaiguru-footer-bg: ${theme.footerBackground};
  --jaiguru-footer-heading: ${theme.footerHeadingColor};
  --jaiguru-footer-border: color-mix(in srgb, ${theme.footerHeadingColor} 18%, transparent);
}
body,
.font-sans {
  font-family: var(--jaiguru-body-font, var(--font-inter)) !important;
}
body {
  font-size: var(--jaiguru-body-font-size, 16px) !important;
  font-weight: var(--jaiguru-body-weight, 400) !important;
  letter-spacing: var(--jaiguru-letter-spacing, 0em) !important;
  line-height: var(--jaiguru-line-height, 1.7) !important;
  color: var(--jaiguru-primary-text, #0f172a);
}
h1, h2, h3, h4, h5, h6,
.font-heading,
.font-display {
  font-family: var(--jaiguru-heading-font, var(--font-playfair)) !important;
}
h1, h2, h3, h4, h5, h6 {
  font-weight: var(--jaiguru-heading-weight, 700) !important;
  color: var(--jaiguru-heading-text, #ffffff);
}
small {
  font-size: var(--jaiguru-small-font-size, 14px) !important;
}
h1 {
  font-size: calc(clamp(3rem, 1.6rem + 3.4vw, 3.75rem) * var(--jaiguru-h1-scale, 1)) !important;
}
h2 {
  font-size: calc(clamp(1.875rem, 1.2rem + 1.8vw, 2.75rem) * var(--jaiguru-h2-scale, 1)) !important;
}
h3 {
  font-size: calc(clamp(1.25rem, 1.05rem + 0.5vw, 1.5rem) * var(--jaiguru-h3-scale, 1)) !important;
}
h4 {
  font-size: calc(clamp(1rem, 0.95rem + 0.3vw, 1.125rem) * var(--jaiguru-h4-scale, 1)) !important;
}
h5 {
  font-size: calc(1rem * var(--jaiguru-h2-scale, 1)) !important;
}
h6 {
  font-size: calc(0.875rem * var(--jaiguru-h2-scale, 1)) !important;
}
main section:not(.bg-hero-gradient) {
  padding-top: var(--jaiguru-section-spacing) !important;
  padding-bottom: var(--jaiguru-section-spacing) !important;
}
main section:not(.bg-hero-gradient):first-child {
  padding-top: calc(var(--jaiguru-section-spacing) * 1.25) !important;
}
`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
