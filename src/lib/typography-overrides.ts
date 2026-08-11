import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { BODY_FONTS, HEADING_FONTS, FONT_WEIGHTS } from "@/config/theme";
import { ALL_FONT_INSTANCES } from "@/lib/fonts";

/**
 * Local typography overrides - per-field styling that wins over the global
 * Typography system ("master default"). Each editable text field can carry a
 * small override object. Overrides are persisted inside the section's
 * SiteSetting JSON under the `typography` key (FAQ overrides live in the
 * dedicated "faq-typography" row, keyed by FAQ id).
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
].filter(
  (f, i, arr) => arr.findIndex((g) => g.id === f.id) === i
);

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

export interface TypographyOverridesData {
  hero: TypographyOverrideMap;
  branding: TypographyOverrideMap;
  astrologer: TypographyOverrideMap;
  faq: FaqTypographyMap;
}

const EMPTY: TypographyOverrideMap = {};

function parseMap(raw: unknown): TypographyOverrideMap {
  if (!raw || typeof raw !== "object") return EMPTY;
  const out: TypographyOverrideMap = {};
  for (const [field, o] of Object.entries(raw as Record<string, unknown>)) {
    if (!o || typeof o !== "object") continue;
    const t: TypographyOverride = {};
    const rec = o as Record<string, unknown>;
    if (typeof rec.fontFamily === "string") t.fontFamily = rec.fontFamily;
    if (typeof rec.fontSize === "number") t.fontSize = rec.fontSize;
    if (typeof rec.fontWeight === "string") t.fontWeight = rec.fontWeight;
    if (typeof rec.textColor === "string") t.textColor = rec.textColor;
    if (typeof rec.gradientStart === "string") t.gradientStart = rec.gradientStart;
    if (typeof rec.gradientEnd === "string") t.gradientEnd = rec.gradientEnd;
    if (typeof rec.letterSpacing === "number") t.letterSpacing = rec.letterSpacing;
    if (typeof rec.lineHeight === "number") t.lineHeight = rec.lineHeight;
    if (overrideActive(t)) out[field] = t;
  }
  return out;
}

function parseFaqMap(raw: unknown): FaqTypographyMap {
  if (!raw || typeof raw !== "object") return {};
  const out: FaqTypographyMap = {};
  for (const [id, o] of Object.entries(raw as Record<string, unknown>)) {
    if (!o || typeof o !== "object") continue;
    const rec = o as Record<string, unknown>;
    const entry: FaqTypographyOverride = {};
    const q = parseMap({ q: rec.question }).q;
    const a = parseMap({ a: rec.answer }).a;
    if (q) entry.question = q;
    if (a) entry.answer = a;
    if (entry.question || entry.answer) out[id] = entry;
  }
  return out;
}

/** Reads every local typography override, memoized per request. */
export const getTypographyOverrides = cache(
  async (): Promise<TypographyOverridesData> => {
    try {
      const rows = await prisma.siteSetting.findMany({
        where: {
          key: { in: ["hero", "branding", "astrologer", "faq-typography"] },
        },
      });
      const map = new Map(rows.map((r) => [r.key, r.value]));
      return {
        hero: parseMap((map.get("hero") as Record<string, unknown> | undefined)?.typography),
        branding: parseMap((map.get("branding") as Record<string, unknown> | undefined)?.typography),
        astrologer: parseMap((map.get("astrologer") as Record<string, unknown> | undefined)?.typography),
        faq: parseFaqMap(map.get("faq-typography")),
      };
    } catch {
      return { hero: EMPTY, branding: EMPTY, astrologer: EMPTY, faq: {} };
    }
  }
);
