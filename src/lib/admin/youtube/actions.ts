"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin YouTube gallery CRUD actions (Phase 6, scope §7.8).
 */

export interface YoutubeFormState {
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

/** Extract the YouTube video id from any watch / youtu.be / embed URL. */
function extractYoutubeId(value: string): string | null {
  const m =
    value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/) ??
    value.match(/^([\w-]{6,})$/);
  return m ? m[1] : null;
}

function parseYoutubeForm(fd: FormData) {
  return {
    title: str(fd, "title"),
    description: str(fd, "description") || null,
    youtubeId: str(fd, "youtubeId"),
    youtubeUrl: str(fd, "youtubeUrl"),
    thumbnailUrl: str(fd, "thumbnailUrl") || null,
    category: str(fd, "category") || null,
    isFeatured: checked(fd, "isFeatured"),
    isActive: checked(fd, "isActive"),
    sortOrder: toInt(str(fd, "sortOrder"), 0),
  };
}

export async function createYoutubeVideoAction(
  _state: YoutubeFormState | undefined,
  fd: FormData
): Promise<YoutubeFormState> {
  await requireAdmin();
  const data = parseYoutubeForm(fd);
  if (!data.title) return { error: "Video title is required." };

  const idFromUrl = data.youtubeUrl ? extractYoutubeId(data.youtubeUrl) : null;
  const id = data.youtubeId || idFromUrl;
  if (!id) return { error: "YouTube URL or Video ID is required." };

  try {
    await prisma.youtubeVideo.create({
      data: {
        ...data,
        youtubeId: id,
        youtubeUrl:
          data.youtubeUrl ||
          `https://www.youtube.com/watch?v=${id}`,
      },
    });
  } catch (e) {
    console.error("[admin] createYoutubeVideo failed:", e);
    return { error: "Could not save the video. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/youtube-gallery");
  redirect("/admin/gallery/youtube");
}

export async function updateYoutubeVideoAction(
  _state: YoutubeFormState | undefined,
  fd: FormData
): Promise<YoutubeFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Missing video id." };
  const data = parseYoutubeForm(fd);
  if (!data.title) return { error: "Video title is required." };

  const idFromUrl = data.youtubeUrl ? extractYoutubeId(data.youtubeUrl) : null;
  const ytId = data.youtubeId || idFromUrl;
  if (!ytId) return { error: "YouTube URL or Video ID is required." };

  try {
    await prisma.youtubeVideo.update({
      where: { id },
      data: {
        ...data,
        youtubeId: ytId,
        youtubeUrl:
          data.youtubeUrl ||
          `https://www.youtube.com/watch?v=${ytId}`,
      },
    });
  } catch (e) {
    console.error("[admin] updateYoutubeVideo failed:", e);
    return { error: "Could not update the video. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/youtube-gallery");
  redirect("/admin/gallery/youtube");
}

export async function deleteYoutubeVideoAction(
  id: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.youtubeVideo.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/youtube-gallery");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteYoutubeVideo failed:", e);
    return { ok: false };
  }
}
