import { BODY_FONTS, HEADING_FONTS, FONT_WEIGHTS } from "@/config/theme";
import { ALL_FONT_INSTANCES } from "@/lib/fonts";

/**
 * Local typography overrides - per-field styling that wins over the global
 * Typography system ("master default"). This module is CLIENT-SAFE (pure
 * types + helpers, no server imports) so admin panels can import it.
 * Server-only loading lives in src/lib/typography-overrides.ts.
 */

export interface TypographyOverride {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  letterSpacing?: number;
  lineHeight?: number;
}

export type TypographyOverrideMap = Record<string, TypographyOverride>;

export interface FaqTypographyOverride {
  question?: TypographyOverride;
  answer?: TypographyOverride;
}

export type FaqTypographyMap = Record<string, FaqTypographyOverride>;

export const OVERRIDE_FONT_OPTIONS = [
  ...BODY_FONTS,
  ...HEADING_FONTS,
].filter((f, i, arr) => arr.findIndex((g) => g.id === f.id) === i);

export const OVERRIDE_FONT_WEIGHTS = FONT_WEIGHTS;

/** True when at least one override property is set. */
export function overrideActive(o?: TypographyOverride): boolean {
  if (!o) return false;
  return Object.values(o).some(
    (v) => v !== undefined && v !== null && v !== ""
  );
}

export function weightCss(id?: string): string | null {
  const w = OVERRIDE_FONT_WEIGHTS.find((x) => x.id === id);
  return w?.css ?? null;
}

export function fontCss(id?: string): string | null {
  if (!id) return null;
  return ALL_FONT_INSTANCES[id]?.style.fontFamily ?? null;
}

/**
 * Builds the CSS declaration block for one overridden element. Every rule is
 * `!important` so it beats the global theme rules in theme-styles.tsx.
 */
export function buildOverrideCss(o: TypographyOverride): string {
  const lines: string[] = [];

  const fam = fontCss(o.fontFamily);
  if (fam) lines.push(`font-family: ${fam} !important;`);

  if (typeof o.fontSize === "number" && Number.isFinite(o.fontSize)) {
    lines.push(`font-size: ${o.fontSize}px !important;`);
  }

  const weight = weightCss(o.fontWeight);
  if (weight) lines.push(`font-weight: ${weight} !important;`);

  if (o.gradientStart && o.gradientEnd) {
    lines.push(
      `background: linear-gradient(90deg, ${o.gradientStart} 0%, color-mix(in srgb, ${o.gradientStart} 50%, ${o.gradientEnd}) 50%, ${o.gradientEnd} 100%) !important;`
    );
    lines.push(
      "-webkit-background-clip: text !important; background-clip: text !important; color: transparent !important;"
    );
  } else if (o.textColor) {
    lines.push(
      "background: none !important; -webkit-background-clip: initial !important; background-clip: initial !important;"
    );
    lines.push(`color: ${o.textColor} !important;`);
  }

  if (typeof o.letterSpacing === "number" && Number.isFinite(o.letterSpacing)) {
    lines.push(`letter-spacing: ${o.letterSpacing}em !important;`);
  }

  if (typeof o.lineHeight === "number" && Number.isFinite(o.lineHeight)) {
    lines.push(`line-height: ${o.lineHeight} !important;`);
  }

  return lines.join("\n");
}
