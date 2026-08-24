"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import type {
  TypographyOverride,
  TypographyOverrideMap,
} from "@/lib/typography-overrides";

/**
 * Admin content actions (scope: Hero, Branding, Astrologer Profile).
 * Values are stored under SiteSetting keys read by getSiteData() and
 * applied instantly on the public site (every public page is dynamic).
 * Each section JSON also carries a `typography` map of per-field local
 * overrides (see src/lib/typography-overrides.ts).
 */

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function isOn(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}

function splitList(fd: FormData, key: string): string[] {
  return str(fd, key)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

async function upsertSetting(key: string, value: unknown): Promise<boolean> {
  try {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as never },
      create: { key, value: value as never },
    });
    revalidatePath("/");
    return true;
  } catch (e) {
    console.error(`[admin] saveSetting "${key}" failed:`, e);
    return false;
  }
}

// -------------------------------------------------------------------------
// Local typography overrides (per-field, see typography-overrides.ts)
// -------------------------------------------------------------------------

const num = (v: FormDataEntryValue | null): number | undefined => {
  if (typeof v !== "string" || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const txt = (v: FormDataEntryValue | null): string | undefined => {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
};

/**
 * Reads the per-field override inputs for a section from the submitted form
 * (`typography[<field>][<prop>]`). Returns a map of active overrides only.
 */
function parseTypographyOverrides(
  fd: FormData,
  fields: string[]
): TypographyOverrideMap {
  const out: TypographyOverrideMap = {};
  for (const field of fields) {
    const o: TypographyOverride = {
      fontFamily: txt(fd.get(`typography[${field}][fontFamily]`)),
      fontWeight: txt(fd.get(`typography[${field}][fontWeight]`)),
      textColor: txt(fd.get(`typography[${field}][textColor]`)),
      gradientStart: txt(fd.get(`typography[${field}][gradientStart]`)),
      gradientEnd: txt(fd.get(`typography[${field}][gradientEnd]`)),
      fontSize: num(fd.get(`typography[${field}][fontSize]`)),
      letterSpacing: num(fd.get(`typography[${field}][letterSpacing]`)),
      lineHeight: num(fd.get(`typography[${field}][lineHeight]`)),
    };
    const active = Object.values(o).some((v) => v !== undefined);
    if (active) out[field] = o;
  }
  return out;
}

/**
 * Merges the parsed overrides into the persisted section JSON, dropping any
 * field the form submitted without values (i.e. reset to global default).
 */
async function mergeTypography(
  key: string,
  fd: FormData,
  fields: string[]
): Promise<TypographyOverrideMap> {
  const parsed = parseTypographyOverrides(fd, fields);
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  const current = (row?.value ?? {}) as Record<string, unknown>;
  const existing = (
    (current.typography ?? {}) as Record<string, unknown>
  );
  const merged: Record<string, unknown> = { ...existing };
  for (const field of fields) {
    if (parsed[field]) merged[field] = parsed[field];
    else delete merged[field];
  }
  return merged as TypographyOverrideMap;
}

// -------------------------------------------------------------------------
// Hero section (SiteSetting "hero")
// -------------------------------------------------------------------------

export interface HeroSettings {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  subtext: string;
  feeText: string;
  astrologerImage: string;
  masterImage: string;
  active: boolean;
  whatsappLabel: string;
  callLabel: string;
  productsLabel: string;
  typography?: TypographyOverrideMap;
}

export async function saveHeroAction(
  _state: SettingsFormState | undefined,
  fd: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const value: HeroSettings = {
    badge: str(fd, "badge"),
    headlineLine1: str(fd, "headlineLine1"),
    headlineLine2: str(fd, "headlineLine2"),
    headlineLine3: str(fd, "headlineLine3"),
    subtext: str(fd, "subtext"),
    feeText: str(fd, "feeText"),
    astrologerImage: str(fd, "astrologerImage"),
    masterImage: str(fd, "masterImage"),
    active: isOn(fd, "active"),
    whatsappLabel: str(fd, "whatsappLabel"),
    callLabel: str(fd, "callLabel"),
    productsLabel: str(fd, "productsLabel"),
  };
  if (!value.headlineLine2) {
    return { error: "Headline line 2 (gold highlight) is required." };
  }
  const typography = await mergeTypography("hero", fd, ["badge", "headlineLine1", "headlineLine2", "headlineLine3", "subtext"]);
  return (await upsertSetting("hero", { ...value, typography }))
    ? { success: true }
    : { error: "Could not save hero settings. Please try again." };
}

// -------------------------------------------------------------------------
// Branding (SiteSetting "branding")
// -------------------------------------------------------------------------

export interface BrandingSettings {
  siteName: string;
  tagline: string;
  logo: string;
  logoAlt: string;
  footerLogo: string;
  favicon: string;
  typography?: TypographyOverrideMap;
}

export async function saveBrandingAction(
  _state: SettingsFormState | undefined,
  fd: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const value: BrandingSettings = {
    siteName: str(fd, "siteName"),
    tagline: str(fd, "tagline"),
    logo: str(fd, "logo"),
    logoAlt: str(fd, "logoAlt"),
    footerLogo: str(fd, "footerLogo"),
    favicon: str(fd, "favicon"),
  };
  if (!value.siteName) return { error: "Site title is required." };
  const typography = await mergeTypography("branding", fd, ["siteName", "tagline", "footerBrand"]);
  return (await upsertSetting("branding", { ...value, typography }))
    ? { success: true }
    : { error: "Could not save branding settings. Please try again." };
}

// -------------------------------------------------------------------------
// Astrologer profile (SiteSetting "astrologer")
// -------------------------------------------------------------------------

export interface AstrologerSettings {
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  yearsExperience: string;
  photoUrl: string;
  expertise: string[];
  specialties: string[];
  typography?: TypographyOverrideMap;
}

export async function saveAstrologerAction(
  _state: SettingsFormState | undefined,
  fd: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const value: AstrologerSettings = {
    name: str(fd, "name"),
    title: str(fd, "title"),
    subtitle: str(fd, "subtitle"),
    bio: str(fd, "bio"),
    yearsExperience: str(fd, "yearsExperience"),
    photoUrl: str(fd, "photoUrl"),
    expertise: splitList(fd, "expertise"),
    specialties: splitList(fd, "specialties"),
  };
  if (!value.name) return { error: "Full name is required." };
  const typography = await mergeTypography("astrologer", fd, ["name", "title", "subtitle", "bio"]);
  return (await upsertSetting("astrologer", { ...value, typography }))
    ? { success: true }
    : { error: "Could not save astrologer profile. Please try again." };
}