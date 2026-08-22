"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin legal page CRUD actions (Phase 6, scope §28).
 */

export interface LegalFormState {
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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const slug = base || "legal-page";
  let candidate = slug;
  let n = 2;
  while (
    await prisma.legalPage.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}

export async function createLegalPageAction(
  _state: LegalFormState | undefined,
  fd: FormData
): Promise<LegalFormState> {
  await requireAdmin();
  const title = str(fd, "title");
  const content = str(fd, "content");
  if (!title) return { error: "Page title is required." };
  if (!content) return { error: "Page content is required." };

  const slug = str(fd, "slug") || (await uniqueSlug(slugify(title)));

  try {
    await prisma.legalPage.create({
      data: {
        slug,
        title,
        content,
        seoTitle: str(fd, "seoTitle") || null,
        seoDescription: str(fd, "seoDescription") || null,
        isActive: checked(fd, "isActive"),
        sortOrder: toInt(str(fd, "sortOrder"), 0),
      },
    });
  } catch (e) {
    console.error("[admin] createLegalPage failed:", e);
    return { error: "Could not save the page. Please try again." };
  }

  revalidatePath("/");
  revalidatePath(`/legal/${slug}`);
  redirect("/admin/legal-pages");
}

export async function updateLegalPageAction(
  _state: LegalFormState | undefined,
  fd: FormData
): Promise<LegalFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Missing page id." };
  const title = str(fd, "title");
  const content = str(fd, "content");
  if (!title) return { error: "Page title is required." };
  if (!content) return { error: "Page content is required." };

  const slug = str(fd, "slug") || (await uniqueSlug(slugify(title), id));

  try {
    await prisma.legalPage.update({
      where: { id },
      data: {
        slug,
        title,
        content,
        seoTitle: str(fd, "seoTitle") || null,
        seoDescription: str(fd, "seoDescription") || null,
        isActive: checked(fd, "isActive"),
        sortOrder: toInt(str(fd, "sortOrder"), 0),
      },
    });
  } catch (e) {
    console.error("[admin] updateLegalPage failed:", e);
    return { error: "Could not update the page. Please try again." };
  }

  revalidatePath("/");
  revalidatePath(`/legal/${slug}`);
  redirect("/admin/legal-pages");
}

export async function deleteLegalPageAction(
  id: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.legalPage.delete({ where: { id } });
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteLegalPage failed:", e);
    return { ok: false };
  }
}
