"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin video gallery CRUD actions (Phase 6, scope §7.8).
 */

export interface VideoFormState {
  error?: string;
  success?: boolean;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function toInt(s: string, fallback: number): number {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : fallback;
}

function checked(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}

function parseVideoForm(fd: FormData) {
  return {
    title: str(fd, "title"),
    description: str(fd, "description") || null,
    videoUrl: str(fd, "videoUrl"),
    thumbnailUrl: str(fd, "thumbnailUrl") || null,
    category: str(fd, "category") || null,
    isFeatured: checked(fd, "isFeatured"),
    isActive: checked(fd, "isActive"),
    sortOrder: toInt(str(fd, "sortOrder"), 0),
  };
}

export async function createVideoAction(
  _state: VideoFormState | undefined,
  fd: FormData
): Promise<VideoFormState> {
  await requireAdmin();
  const data = parseVideoForm(fd);
  if (!data.title) return { error: "Video title is required." };
  if (!data.videoUrl) return { error: "Video URL is required." };

  try {
    await prisma.video.create({ data });
  } catch (e) {
    console.error("[admin] createVideo failed:", e);
    return { error: "Could not save the video. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/video-gallery");
  redirect("/admin/gallery/videos");
}

export async function updateVideoAction(
  _state: VideoFormState | undefined,
  fd: FormData
): Promise<VideoFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Missing video id." };
  const data = parseVideoForm(fd);
  if (!data.title) return { error: "Video title is required." };
  if (!data.videoUrl) return { error: "Video URL is required." };

  try {
    await prisma.video.update({ where: { id }, data });
  } catch (e) {
    console.error("[admin] updateVideo failed:", e);
    return { error: "Could not update the video. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/video-gallery");
  redirect("/admin/gallery/videos");
}

export async function deleteVideoAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.video.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/video-gallery");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteVideo failed:", e);
    return { ok: false };
  }
}
