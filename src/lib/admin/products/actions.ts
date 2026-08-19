"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin product CRUD actions (scope §16).
 * All actions require an authenticated admin/editor session.
 */

export interface ProductFormState {
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
  return Number.isFinite(n) ? n : null;
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
  const slug = base || "product";
  let candidate = slug;
  let n = 2;
  while (
    await prisma.product.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}

function parseProductForm(fd: FormData) {
  const name = str(fd, "name");
  const price = toNumber(str(fd, "price"));
  const discountPrice = toNumber(str(fd, "discountPrice"));
  const quantity = toNumber(str(fd, "quantity")) ?? 0;
  const sortOrder = toNumber(str(fd, "sortOrder")) ?? 0;
  const categoryId = str(fd, "categoryId");
  const stockStatus = str(fd, "stockStatus") || "IN_STOCK";

  const estimatedDeliveryTime = str(fd, "estimatedDeliveryTime");
  const customDelivery = str(fd, "customDelivery");
  const finalDeliveryTime =
    estimatedDeliveryTime === "Custom (Enter manually)"
      ? customDelivery
      : estimatedDeliveryTime;

  const finalDiscount =
    discountPrice !== null &&
    price !== null &&
    discountPrice > 0 &&
    discountPrice < price
      ? discountPrice
      : null;

  const costPrice = toNumber(str(fd, "costPrice"));
  const competitorPrice = toNumber(str(fd, "competitorPrice"));
  const priceFloor = toNumber(str(fd, "priceFloor"));
  const priceSource = str(fd, "priceSource") || "manual";

  const sizeOptionsRaw = str(fd, "sizeOptions");
  let sizeOptions: {
    label: string;
    price: number;
    certificateLabel?: string;
    isActive?: boolean;
  }[] | null = null;
  if (sizeOptionsRaw && sizeOptionsRaw.trim()) {
    try {
      const parsed = JSON.parse(sizeOptionsRaw);
      if (Array.isArray(parsed)) {
        sizeOptions = parsed
          .map((o) => ({
            label: String(o?.label ?? "").trim(),
            price: toNumber(String(o?.price ?? "")) ?? 0,
            certificateLabel: o?.certificateLabel
              ? String(o.certificateLabel).trim()
              : undefined,
            isActive: o?.isActive === undefined ? true : Boolean(o.isActive),
          }))
          .filter((o) => o.label && o.price > 0);
      }
    } catch {
      sizeOptions = null;
    }
  }
  if (sizeOptions && sizeOptions.length === 0) sizeOptions = null;

  return {
    name,
    categoryId,
    price,
    finalDiscount,
    costPrice,
    competitorPrice,
    priceFloor,
    priceSource,
    quantity,
    sortOrder,
    stockStatus,
    subcategory: str(fd, "subcategory") || null,
    sku: str(fd, "sku") || null,
    mainImage: str(fd, "mainImage") || null,
    shortDescription: str(fd, "shortDescription") || null,
    longDescription: str(fd, "longDescription") || null,
    returnPolicy: str(fd, "returnPolicy") || null,
    benefits: toList(str(fd, "benefits")),
    tags: toList(str(fd, "tags")),
    material: str(fd, "material") || null,
    size: str(fd, "size") || null,
    sizeOptions,
    weight: str(fd, "weight") || null,
    color: str(fd, "color") || null,
    estimatedDeliveryTime: finalDeliveryTime || null,
    isFeatured: checked(fd, "isFeatured"),
    isPopular: checked(fd, "isPopular"),
    isNewArrival: checked(fd, "isNewArrival"),
    hasCertificate: checked(fd, "hasCertificate"),
    isActive: checked(fd, "isActive"),
  };
}

export async function createProductAction(
  _state: ProductFormState | undefined,
  fd: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const data = parseProductForm(fd);

  if (!data.name) return { error: "Product name is required." };
  if (!data.categoryId) return { error: "Please choose a category." };
  if (data.price === null || data.price < 0)
    return { error: "A valid price is required." };

  const slug =
    str(fd, "slug") ||
    (await uniqueSlug(slugify(data.name), undefined));

  try {
    await prisma.product.create({
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        subcategory: data.subcategory,
        sku: data.sku,
        mainImage: data.mainImage,
        price: data.price,
        discountPrice: data.finalDiscount,
        stockStatus: data.stockStatus as never,
        quantity: data.quantity,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        returnPolicy: data.returnPolicy,
        benefits: data.benefits,
        tags: data.tags,
        material: data.material,
        size: data.size,
        ...(data.sizeOptions ? { sizeOptions: data.sizeOptions } : {}),
        weight: data.weight,
        color: data.color,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        isFeatured: data.isFeatured,
        isPopular: data.isPopular,
        isNewArrival: data.isNewArrival,
        hasCertificate: data.hasCertificate,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
  } catch (e) {
    console.error("[admin] createProduct failed:", e);
    return { error: "Could not save the product. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProductAction(
  _state: ProductFormState | undefined,
  fd: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Missing product id." };
  const data = parseProductForm(fd);

  if (!data.name) return { error: "Product name is required." };
  if (!data.categoryId) return { error: "Please choose a category." };
  if (data.price === null || data.price < 0)
    return { error: "A valid price is required." };

  const slug =
    str(fd, "slug") ||
    (await uniqueSlug(slugify(data.name), id));

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        subcategory: data.subcategory,
        sku: data.sku,
        mainImage: data.mainImage,
        price: data.price,
        discountPrice: data.finalDiscount,
        costPrice: data.costPrice,
        competitorPrice: data.competitorPrice,
        priceFloor: data.priceFloor,
        priceSource: data.priceSource,
        stockStatus: data.stockStatus as never,
        quantity: data.quantity,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        returnPolicy: data.returnPolicy,
        benefits: data.benefits,
        tags: data.tags,
        material: data.material,
        size: data.size,
        ...(data.sizeOptions ? { sizeOptions: data.sizeOptions } : {}),
        weight: data.weight,
        color: data.color,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        isFeatured: data.isFeatured,
        isPopular: data.isPopular,
        isNewArrival: data.isNewArrival,
        hasCertificate: data.hasCertificate,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
  } catch (e) {
    console.error("[admin] updateProduct failed:", e);
    return { error: "Could not update the product. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  redirect("/admin/products");
}

export async function deleteProductAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/products");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteProduct failed:", e);
    return { ok: false };
  }
}