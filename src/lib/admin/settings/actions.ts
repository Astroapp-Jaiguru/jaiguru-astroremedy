"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import {
  normalizeTheme,
  THEME_STORAGE_KEY,
  type ThemeSettings,
} from "@/config/theme";
import { siteConfig } from "@/config/site";

/**
 * Admin CMS server actions (Phase 8): theme, SEO, social links and
 * contact settings. All values are persisted in the database and read
 * back by the public site dynamically.
 */

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function int(fd: FormData, key: string, fallback: number): number {
  const n = Number.parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? n : fallback;
}

function hex(fd: FormData, key: string, fallback: string): string {
  const v = str(fd, key);
  return /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : fallback;
}

// -------------------------------------------------------------------------
// Theme
// -------------------------------------------------------------------------

export async function saveThemeAction(
  _state: SettingsFormState | undefined,
  fd: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const pill = str(fd, "pill") === "on";
  const theme: ThemeSettings = {
    primary: hex(fd, "primary", "#4C1D95"),
    secondary: hex(fd, "secondary", "#312E81"),
    accent: hex(fd, "accent", "#FACC15"),
    bodyFont: str(fd, "bodyFont") || "inter",
    headingFont: str(fd, "headingFont") || "playfair-display",
    cardRadius: int(fd, "cardRadius", 12),
    buttonRadius: pill ? 9999 : int(fd, "buttonRadius", 12),
    sectionSpacing: int(fd, "sectionSpacing", 80),
    productCardRadius: int(fd, "productCardRadius", 16),
    serviceCardRadius: int(fd, "serviceCardRadius", 16),
  };
  try {
    await prisma.themeSetting.upsert({
      where: { key: THEME_STORAGE_KEY },
      update: { value: theme as never },
      create: { key: THEME_STORAGE_KEY, value: theme as never },
    });
  } catch (e) {
    console.error("[admin] saveThemeAction failed:", e);
    return { error: "Could not save theme settings. Please try again." };
  }
  revalidatePath("/");
  return { success: true };
}

export async function resetThemeAction(): Promise<SettingsFormState> {
  await requireAdmin();
  try {
    await prisma.themeSetting.upsert({
      where: { key: THEME_STORAGE_KEY },
      update: { value: normalizeTheme(undefined) as never },
      create: { key: THEME_STORAGE_KEY, value: normalizeTheme(undefined) as never },
    });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("[admin] resetThemeAction failed:", e);
    return { error: "Could not reset theme settings." };
  }
}

// -------------------------------------------------------------------------
// SEO
// -------------------------------------------------------------------------

const SEO_KEY = "default";

export async function saveSeoAction(
  _state: SettingsFormState | undefined,
  fd: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const title = str(fd, "title");
  const description = str(fd, "description");
  const keywords = str(fd, "keywords");
  if (!title) return { error: "SEO title is required." };
  const value = {
    title,
    description,
    keywords,
    ogImage:
      str(fd, "ogImage") ||
      `https://${process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") || "jaiguruastroremedy.com"}/og.jpg`,
  };
  try {
    await prisma.seoSetting.upsert({
      where: { key: SEO_KEY },
      update: { value: value as never },
      create: { key: SEO_KEY, value: value as never },
    });
  } catch (e) {
    console.error("[admin] saveSeoAction failed:", e);
    return { error: "Could not save SEO settings. Please try again." };
  }
  revalidatePath("/");
  return { success: true };
}

export async function resetSeoAction(): Promise<SettingsFormState> {
  await requireAdmin();
  try {
    await prisma.seoSetting.upsert({
      where: { key: SEO_KEY },
      update: {
        value: {
          title: siteConfig.defaultSeo.title,
          description: siteConfig.defaultSeo.description,
          keywords: siteConfig.defaultSeo.keywords,
          ogImage: null,
        } as never,
      },
      create: {
        key: SEO_KEY,
        value: {
          title: siteConfig.defaultSeo.title,
          description: siteConfig.defaultSeo.description,
          keywords: siteConfig.defaultSeo.keywords,
          ogImage: null,
        } as never,
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("[admin] resetSeoAction failed:", e);
    return { error: "Could not reset SEO settings." };
  }
}

// -------------------------------------------------------------------------
// Social links
// -------------------------------------------------------------------------

export interface SocialLinkRow {
  platform: string;
  url: string;
  isActive: boolean;
}

const SOCIAL_PLATFORMS = ["facebook", "youtube", "instagram", "twitter", "whatsapp", "googlebusiness"];

export async function saveSocialLinksAction(
  _state: SettingsFormState | undefined,
  fd: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  try {
    for (const platform of SOCIAL_PLATFORMS) {
      const url = str(fd, `url_${platform}`);
      const isActive = fd.get(`active_${platform}`) === "on";
      const sort = SOCIAL_PLATFORMS.indexOf(platform) + 1;
      await prisma.socialLink.upsert({
        where: { platform },
        update: { url, isActive: url ? isActive : false, sortOrder: sort },
        create: { platform, url, isActive: url ? isActive : false, sortOrder: sort, icon: platform },
      });
    }
  } catch (e) {
    console.error("[admin] saveSocialLinksAction failed:", e);
    return { error: "Could not save social links. Please try again." };
  }
  revalidatePath("/");
  return { success: true };
}

// -------------------------------------------------------------------------
// Contact settings (SiteSetting "contact")
// -------------------------------------------------------------------------

const CONTACT_KEY = "contact";

export async function saveContactAction(
  _state: SettingsFormState | undefined,
  fd: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const whatsappNumber = str(fd, "whatsappNumber");
  if (!whatsappNumber) return { error: "WhatsApp number is required." };
  const whatsappRaw = whatsappNumber.replace(/\D/g, "");
  const value = {
    whatsappNumber: whatsappNumber.startsWith("+")
      ? whatsappNumber
      : `+${whatsappNumber.replace(/\D/g, "")}`,
    whatsappNumberRaw: whatsappRaw,
    whatsappDisplay: str(fd, "whatsappDisplay") || whatsappNumber,
    callNumber: str(fd, "callNumber"),
    callDisplay: str(fd, "callDisplay"),
    bookingLabel: str(fd, "bookingLabel"),
    email: str(fd, "email"),
    address: str(fd, "address"),
    landmark: str(fd, "landmark"),
    businessHours: str(fd, "businessHours"),
    consultationFee: int(fd, "consultationFee", 700),
  };
  try {
    await prisma.siteSetting.upsert({
      where: { key: CONTACT_KEY },
      update: { value: value as never },
      create: { key: CONTACT_KEY, value: value as never },
    });
  } catch (e) {
    console.error("[admin] saveContactAction failed:", e);
    return { error: "Could not save contact settings. Please try again." };
  }
  revalidatePath("/");
  return { success: true };
}