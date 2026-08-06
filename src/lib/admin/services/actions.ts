"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin service CRUD actions (scope §16).
 */

export interface ServiceFormState {
  error?: string;
  success?: boolean;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function toNumber(s: string): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function toList(s: string): string[] {
  return s
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);
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
  const slug = base || "service";
  let candidate = slug;
  let n = 2;
  while (
    await prisma.service.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}

function parseServiceForm(fd: FormData) {
  const name = str(fd, "name");
  const categoryId = str(fd, "categoryId");
  const mode = str(fd, "mode") || "ONLINE";
  const price = toNumber(str(fd, "price"));
  const sortOrder = toNumber(str(fd, "sortOrder")) ?? 0;

  return {
    name,
    categoryId,
    mode,
    price,
    sortOrder,
    duration: str(fd, "duration") || null,
    priceLabel: str(fd, "priceLabel") || null,
    imageUrl: str(fd, "imageUrl") || null,
    shortDescription: str(fd, "shortDescription") || null,
    longDescription: str(fd, "longDescription") || null,
    benefits: toList(str(fd, "benefits")),
    syllabus: toList(str(fd, "syllabus")),
    serviceArea: str(fd, "serviceArea") || null,
    isFeatured: checked(fd, "isFeatured"),
    isActive: checked(fd, "isActive"),
  };
}

export async function createServiceAction(
  _state: ServiceFormState | undefined,
  fd: FormData
): Promise<ServiceFormState> {
  await requireAdmin();
  const data = parseServiceForm(fd);

  if (!data.name) return { error: "Service name is required." };
  if (!data.categoryId) return { error: "Please choose a category." };

  const slug = str(fd, "slug") || (await uniqueSlug(slugify(data.name)));

  try {
    await prisma.service.create({
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        mode: data.mode as never,
        duration: data.duration,
        price: data.price,
        priceLabel: data.priceLabel,
        imageUrl: data.imageUrl,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        benefits: data.benefits,
        syllabus: data.syllabus,
        serviceArea: data.serviceArea,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
  } catch (e) {
    console.error("[admin] createService failed:", e);
    return { error: "Could not save the service. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/services");
  redirect("/admin/services");
}

export async function updateServiceAction(
  _state: ServiceFormState | undefined,
  fd: FormData
): Promise<ServiceFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Missing service id." };
  const data = parseServiceForm(fd);

  if (!data.name) return { error: "Service name is required." };
  if (!data.categoryId) return { error: "Please choose a category." };

  const slug = str(fd, "slug") || (await uniqueSlug(slugify(data.name), id));

  try {
    await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        mode: data.mode as never,
        duration: data.duration,
        price: data.price,
        priceLabel: data.priceLabel,
        imageUrl: data.imageUrl,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        benefits: data.benefits,
        syllabus: data.syllabus,
        serviceArea: data.serviceArea,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
  } catch (e) {
    console.error("[admin] updateService failed:", e);
    return { error: "Could not update the service. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  redirect("/admin/services");
}

export async function deleteServiceAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/services");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteService failed:", e);
    return { ok: false };
  }
}