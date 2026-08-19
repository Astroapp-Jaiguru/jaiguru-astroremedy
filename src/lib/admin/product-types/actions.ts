"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin Product Types + Subtypes CRUD (CMS taxonomy).
 * Types are the top-level shop filter (e.g. "Yellow Sapphire");
 * subtypes group by origin / mine / variety (e.g. "Ceylon").
 */

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export interface ProductTypeInput {
  id?: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export async function upsertProductTypeAction(
  input: ProductTypeInput
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const name = input.name.trim().slice(0, 120);
  if (!name) return { ok: false, error: "Product type name is required." };
  const slug = (input.slug.trim() || slugify(name)).slice(0, 90);
  const icon = input.icon.trim().slice(0, 80) || null;

  try {
    if (input.id) {
      await prisma.productType.update({
        where: { id: input.id },
        data: { name, slug, icon, isActive: input.isActive, sortOrder: input.sortOrder },
      });
    } else {
      await prisma.productType.create({
        data: { name, slug, icon, isActive: input.isActive, sortOrder: input.sortOrder },
      });
    }
  } catch (e) {
    console.error("[admin] upsertProductType failed:", e);
    return { ok: false, error: "Could not save product type (slug conflict?)." };
  }
  revalidatePath("/admin/product-types");
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteProductTypeAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const type = await prisma.productType.findUnique({ where: { id } });
    if (!type) return { ok: false, error: "Product type not found." };
    await prisma.productType.delete({ where: { id } });
  } catch (e) {
    console.error("[admin] deleteProductType failed:", e);
    return { ok: false, error: "Could not delete product type." };
  }
  revalidatePath("/admin/product-types");
  revalidatePath("/products");
  return { ok: true };
}

export interface SubtypeInput {
  id?: string;
  productTypeId: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

export async function upsertSubtypeAction(
  input: SubtypeInput
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const name = input.name.trim().slice(0, 120);
  if (!name) return { ok: false, error: "Subtype name is required." };
  if (!input.productTypeId) return { ok: false, error: "Missing product type." };
  const slug = (input.slug.trim() || slugify(name)).slice(0, 90);

  try {
    if (input.id) {
      await prisma.subtype.update({
        where: { id: input.id },
        data: {
          name,
          slug,
          productTypeId: input.productTypeId,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
        },
      });
    } else {
      await prisma.subtype.create({
        data: {
          name,
          slug,
          productTypeId: input.productTypeId,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
        },
      });
    }
  } catch (e) {
    console.error("[admin] upsertSubtype failed:", e);
    return { ok: false, error: "Could not save subtype (slug conflict?)." };
  }
  revalidatePath("/admin/product-types");
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteSubtypeAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const sub = await prisma.subtype.findUnique({ where: { id } });
    if (!sub) return { ok: false, error: "Subtype not found." };
    await prisma.subtype.delete({ where: { id } });
  } catch (e) {
    console.error("[admin] deleteSubtype failed:", e);
    return { ok: false, error: "Could not delete subtype." };
  }
  revalidatePath("/admin/product-types");
  revalidatePath("/products");
  return { ok: true };
}