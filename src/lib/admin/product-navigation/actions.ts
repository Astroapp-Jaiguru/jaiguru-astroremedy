"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin Product Navigation CRUD (unlimited-level hierarchy).
 * Nodes form the multi-level "Product List" menu: Categories -> Groups ->
 * Types -> Origins -> Sizes. `kind = "size"` marks leaf size nodes used to
 * filter products by a sizeOptions label.
 */

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export interface NavigationInput {
  id?: string;
  name: string;
  slug: string;
  kind: string; // "" | "size"
  parentId: string; // "" = top level
  isActive: boolean;
  sortOrder: number;
}

export async function upsertNavigationAction(
  input: NavigationInput
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const name = input.name.trim().slice(0, 120);
  if (!name) return { ok: false, error: "Name is required." };
  const slug = (input.slug.trim() || slugify(name)).slice(0, 90);
  const parentId = input.parentId || null;
  const kind = input.kind === "size" ? "size" : null;
  if (input.id && parentId === input.id) {
    return { ok: false, error: "A node cannot be its own parent." };
  }

  try {
    if (input.id) {
      await prisma.productNavigation.update({
        where: { id: input.id },
        data: { name, slug, kind, parentId, isActive: input.isActive, sortOrder: input.sortOrder },
      });
    } else {
      await prisma.productNavigation.create({
        data: { name, slug, kind, parentId, isActive: input.isActive, sortOrder: input.sortOrder },
      });
    }
  } catch (e) {
    console.error("[admin] upsertNavigation failed:", e);
    return { ok: false, error: "Could not save node (slug conflict?)." };
  }
  revalidatePath("/admin/product-navigation");
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteNavigationAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const node = await prisma.productNavigation.findUnique({ where: { id } });
    if (!node) return { ok: false, error: "Node not found." };
    // Children are unparented and products unlinked via onDelete: SetNull.
    await prisma.productNavigation.delete({ where: { id } });
  } catch (e) {
    console.error("[admin] deleteNavigation failed:", e);
    return { ok: false, error: "Could not delete node." };
  }
  revalidatePath("/admin/product-navigation");
  revalidatePath("/products");
  return { ok: true };
}