"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin photo gallery CRUD actions (Phase 6, scope §7.8).
 */

export interface GalleryFormState {
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

function parseGalleryForm(fd: FormData) {
  return {
    title: str(fd, "title") || null,
    description: str(fd, "description") || null,
    imageUrl: str(fd, "imageUrl"),
    altText: str(fd, "altText") || null,
    category: str(fd, "category") || null,
    isFeatured: checked(fd, "isFeatured"),
    isActive: checked(fd, "isActive"),
    sortOrder: toInt(str(fd, "sortOrder"), 0),
  };
}

export async function createGalleryImageAction(
  _state: GalleryFormState | undefined,
  fd: FormData
): Promise<GalleryFormState> {
  await requireAdmin();
  const data = parseGalleryForm(fd);
  if (!data.imageUrl) return { error: "Image URL is required." };

  try {
    await prisma.galleryImage.create({ data });
  } catch (e) {
    console.error("[admin] createGalleryImage failed:", e);
    return { error: "Could not save the image. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/photo-gallery");
  redirect("/admin/gallery/photos");
}

export async function updateGalleryImageAction(
  _state: GalleryFormState | undefined,
  fd: FormData
): Promise<GalleryFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Missing image id." };
  const data = parseGalleryForm(fd);
  if (!data.imageUrl) return { error: "Image URL is required." };

  try {
    await prisma.galleryImage.update({ where: { id }, data });
  } catch (e) {
    console.error("[admin] updateGalleryImage failed:", e);
    return { error: "Could not update the image. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/photo-gallery");
  redirect("/admin/gallery/photos");
}

export async function deleteGalleryImageAction(
  id: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.galleryImage.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/photo-gallery");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteGalleryImage failed:", e);
    return { ok: false };
  }
}
