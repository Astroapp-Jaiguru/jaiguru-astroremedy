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
 * Injects the admin-configured theme (Phase 8) onto the public frontend as
 * CSS custom properties. Colors, fonts, radii and section spacing are read
 * from the ThemeSetting model and applied instantly on every request.
 */
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

  const css = `
:root {
  --jaiguru-primary: ${theme.primary};
  --jaiguru-secondary: ${theme.secondary};
  --jaiguru-accent: ${theme.accent};
  --jaiguru-accent-2: ${theme.accent};
  --jaiguru-accent-3: ${theme.accent};
  --jaiguru-deep-navy: ${theme.secondary};
  --jaiguru-hero-1: var(--jaiguru-deep-navy);
  --jaiguru-hero-2: var(--jaiguru-secondary);
  --jaiguru-hero-3: var(--jaiguru-primary);
  --jaiguru-dark-1: #111827;
  --jaiguru-dark-2: #1e1b4b;
  --jaiguru-dark-3: var(--jaiguru-secondary);
  --jaiguru-topbar-1: var(--jaiguru-deep-navy);
  --jaiguru-topbar-2: var(--jaiguru-secondary);
  --jaiguru-topbar-3: var(--jaiguru-primary);
  --jaiguru-btn-radius: ${buttonRadius};
  --jaiguru-card-radius: ${theme.cardRadius}px;
  --jaiguru-product-card-radius: ${theme.productCardRadius}px;
  --jaiguru-service-card-radius: ${theme.serviceCardRadius}px;
  --jaiguru-section-spacing: ${theme.sectionSpacing}px;
  --jaiguru-body-font: ${bodyFamily};
  --jaiguru-heading-font: ${headingFamily};
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
}
body,
.font-sans {
  font-family: var(--jaiguru-body-font, var(--font-inter)) !important;
}
h1, h2, h3, h4, h5, h6,
.font-heading,
.font-display {
  font-family: var(--jaiguru-heading-font, var(--font-playfair)) !important;
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
