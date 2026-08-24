"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin Categories (scope: Catalog module) - CRUD for ProductCategory and
 * ServiceCategory with optional parent category and active toggle.
 */

export type CategoryModel = "product" | "service";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export interface CategoryInput {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  isActive: boolean;
  sortOrder: number;
}

export async function upsertCategoryAction(
  model: CategoryModel,
  input: CategoryInput
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const name = input.name.trim().slice(0, 120);
  if (!name) return { ok: false, error: "Category name is required." };
  const slug = (input.slug.trim() || slugify(name)).slice(0, 80);
  const parentId = input.parentId || null;

  try {
    if (model === "product") {
      if (parentId) {
        const parent = await prisma.productCategory.findUnique({
          where: { id: parentId },
        });
        if (!parent) return { ok: false, error: "Parent category does not exist." };
      }
      await prisma.productCategory.upsert({
        where: { slug },
        update: {
          name,
          slug,
          description: input.description.trim().slice(0, 500) || null,
          parentId,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
        },
        create: {
          name,
          slug,
          description: input.description.trim().slice(0, 500) || null,
          parentId,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
        },
      });
    } else {
      if (parentId) {
        const parent = await prisma.serviceCategory.findUnique({
          where: { id: parentId },
        });
        if (!parent) return { ok: false, error: "Parent category does not exist." };
      }
      await prisma.serviceCategory.upsert({
        where: { slug },
        update: {
          name,
          slug,
          description: input.description.trim().slice(0, 500) || null,
          parentId,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
        },
        create: {
          name,
          slug,
          description: input.description.trim().slice(0, 500) || null,
          parentId,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
        },
      });
    }
  } catch (e) {
    console.error("[admin] upsertCategoryAction failed:", e);
    return { ok: false, error: "Could not save category (slug conflict?)." };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategoryAction(
  model: CategoryModel,
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    if (model === "product") {
      const cat = await prisma.productCategory.findUnique({ where: { id } });
      if (!cat) return { ok: false, error: "Category not found." };
      const count = await prisma.product.count({ where: { categoryId: id } });
      if (count > 0) {
        return {
          ok: false,
          error: `Cannot delete - ${count} product(s) still use this category.`,
        };
      }
      await prisma.productCategory.delete({ where: { id } });
    } else {
      const cat = await prisma.serviceCategory.findUnique({ where: { id } });
      if (!cat) return { ok: false, error: "Category not found." };
      const count = await prisma.service.count({ where: { categoryId: id } });
      if (count > 0) {
        return {
          ok: false,
          error: `Cannot delete - ${count} service(s) still use this category.`,
        };
      }
      await prisma.serviceCategory.delete({ where: { id } });
    }
  } catch (e) {
    console.error("[admin] deleteCategoryAction failed:", e);
    return { ok: false, error: "Could not delete category." };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}