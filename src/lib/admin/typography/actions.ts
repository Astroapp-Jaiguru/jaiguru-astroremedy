"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import {
  normalizeTheme,
  THEME_STORAGE_KEY,
} from "@/config/theme";

export interface TypographyFormState {
  success?: boolean;
  error?: string;
}

const TYPOGRAPHY_KEYS = [
  "bodyFont",
  "headingFont",
  "bodyFontSize",
  "headingScale",
  "h1FontSize",
  "h2FontSize",
  "h3FontSize",
  "h4FontSize",
  "smallFontSize",
  "bodyFontWeight",
  "headingFontWeight",
  "letterSpacing",
  "lineHeight",
  "headingTextColor",
  "gradientTextStart",
  "gradientTextEnd",
] as const;

/**
 * Saves only the typography controls, preserving every other theme value
 * (colors, radii, gradients). Applies instantly - public pages re-render
 * per request and read the theme row on every load.
 */
export async function saveTypographyAction(
  _state: TypographyFormState | undefined,
  fd: FormData
): Promise<TypographyFormState> {
  await requireAdmin();

  try {
    let current: Record<string, unknown> = {};
    const row = await prisma.themeSetting.findUnique({
      where: { key: THEME_STORAGE_KEY },
    });
    if (row?.value && typeof row.value === "object") {
      current = row.value as Record<string, unknown>;
    }

    const patch: Record<string, unknown> = {};
    for (const key of TYPOGRAPHY_KEYS) {
      const raw = fd.get(key);
      if (raw !== null) {
        patch[key] = typeof raw === "string" ? raw : String(raw);
      }
    }

    const merged = normalizeTheme({ ...current, ...patch });

    await prisma.themeSetting.upsert({
      where: { key: THEME_STORAGE_KEY },
      update: { value: merged as never },
      create: { key: THEME_STORAGE_KEY, value: merged as never },
    });
  } catch (e) {
    console.error("[admin] saveTypographyAction failed:", e);
    return { error: "Could not save typography settings. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/admin/typography");
  return { success: true };
}

/** Restores the design defaults for every typography control. */
export async function resetTypographyAction(): Promise<TypographyFormState> {
  await requireAdmin();

  try {
    let current: Record<string, unknown> = {};
    const row = await prisma.themeSetting.findUnique({
      where: { key: THEME_STORAGE_KEY },
    });
    if (row?.value && typeof row.value === "object") {
      current = row.value as Record<string, unknown>;
    }

    for (const key of TYPOGRAPHY_KEYS) {
      delete current[key];
    }
    const merged = normalizeTheme(current);

    await prisma.themeSetting.upsert({
      where: { key: THEME_STORAGE_KEY },
      update: { value: merged as never },
      create: { key: THEME_STORAGE_KEY, value: merged as never },
    });
  } catch (e) {
    console.error("[admin] resetTypographyAction failed:", e);
    return { error: "Could not reset typography settings." };
  }

  revalidatePath("/");
  revalidatePath("/admin/typography");
  return { success: true };
}