"use server";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MODE_VISIBILITY,
  MODE_IDS,
  type ModeId,
  type ModeVisibility,
} from "@/lib/mode-visibility";

/**
 * Server-side helpers for the "Service Mode Settings" SiteSetting row.
 * Stored as a JSON value keyed by "modeVisibility".
 */

/** Mode ids currently visible to users (defaults to all on). */
export async function getVisibleModes(): Promise<ModeId[]> {
  const v = await getModeVisibility();
  return MODE_IDS.filter((m) => v[m]);
}

export async function getModeVisibility(): Promise<ModeVisibility> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "modeVisibility" },
    });
    if (!row?.value || typeof row.value !== "object") {
      return { ...DEFAULT_MODE_VISIBILITY };
    }
    const v = row.value as Record<string, unknown>;
    return {
      online: typeof v.online === "boolean" ? v.online : true,
      offline: typeof v.offline === "boolean" ? v.offline : true,
      homeService: typeof v.homeService === "boolean" ? v.homeService : true,
    };
  } catch (e) {
    console.error("[mode-visibility] getModeVisibility failed:", e);
    return { ...DEFAULT_MODE_VISIBILITY };
  }
}

export interface ModeVisibilityFormState {
  ok?: boolean;
  error?: string;
}

export async function saveModeVisibilityAction(
  _state: ModeVisibilityFormState | undefined,
  formData: FormData
): Promise<ModeVisibilityFormState> {
  const on = (key: string) => formData.get(key) === "on";
  const value: Record<string, boolean> = {
    online: on("online"),
    offline: on("offline"),
    homeService: on("homeService"),
  };
  try {
    await prisma.siteSetting.upsert({
      where: { key: "modeVisibility" },
      create: { key: "modeVisibility", value },
      update: { value },
    });
    return { ok: true };
  } catch (e) {
    console.error("[admin] saveModeVisibilityAction failed:", e);
    return { error: "Could not save mode visibility settings." };
  }
}