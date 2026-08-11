import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  overrideActive,
  type TypographyOverride,
  type TypographyOverrideMap,
  type FaqTypographyOverride,
  type FaqTypographyMap,
} from "@/config/typography-overrides";

/**
 * Server-only loading of local typography overrides. Client-safe types and
 * helpers live in src/config/typography-overrides.ts; this module adds the
 * Prisma read used by the public CSS injector and the admin pages.
 */

export type {
  TypographyOverride,
  TypographyOverrideMap,
  FaqTypographyOverride,
  FaqTypographyMap,
} from "@/config/typography-overrides";

export { buildOverrideCss, overrideActive } from "@/config/typography-overrides";

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
