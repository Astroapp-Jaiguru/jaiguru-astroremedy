"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin content actions (scope: Hero, Branding, Astrologer Profile).
 * Values are stored under SiteSetting keys read by getSiteData() and
 * applied instantly on the public site (every public page is dynamic).
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
// Hero section (SiteSetting "hero")
// -------------------------------------------------------------------------

export interface HeroSettings {
  badge: string;
  headlineBefore: string;
  headlineHighlight: string;
  headlineAfter: string;
  subtext: string;
  feeText: string;
  astrologerImage: string;
  masterImage: string;
  active: boolean;
  whatsappLabel: string;
  callLabel: string;
  productsLabel: string;
}

export async function saveHeroAction(
  _state: SettingsFormState | undefined,
  fd: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const value: HeroSettings = {
    badge: str(fd, "badge"),
    headlineBefore: str(fd, "headlineBefore"),
    headlineHighlight: str(fd, "headlineHighlight"),
    headlineAfter: str(fd, "headlineAfter"),
    subtext: str(fd, "subtext"),
    feeText: str(fd, "feeText"),
    astrologerImage: str(fd, "astrologerImage"),
    masterImage: str(fd, "masterImage"),
    active: isOn(fd, "active"),
    whatsappLabel: str(fd, "whatsappLabel"),
    callLabel: str(fd, "callLabel"),
    productsLabel: str(fd, "productsLabel"),
  };
  if (!value.headlineHighlight) {
    return { error: "Main headline highlight text is required." };
  }
  return (await upsertSetting("hero", value))
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
  return (await upsertSetting("branding", value))
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
  return (await upsertSetting("astrologer", value))
    ? { success: true }
    : { error: "Could not save astrologer profile. Please try again." };
}