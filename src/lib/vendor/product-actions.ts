"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireVendor } from "@/lib/dal";
import { Prisma } from "@/generated/prisma/client";

function text(fd: FormData, key: string) { return String(fd.get(key) ?? "").trim(); }
function list(value: string) { return value.split(",").map((item) => item.trim()).filter(Boolean); }
function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90); }

async function uniqueSlug(value: string) {
  const base = slugify(value) || "vendor-product";
  let slug = base;
  let count = 2;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${count++}`;
  return slug;
}

export async function createVendorProduct(formData: FormData) {
  const user = await requireVendor();
  const vendor = await prisma.vendor.findFirst({ where: { organization: { ownerId: user.id } }, select: { id: true, status: true } });
  if (!vendor || vendor.status !== "APPROVED") throw new Error("Approved vendor access required.");

  const name = text(formData, "name");
  const categoryId = text(formData, "categoryId");
  const price = Number(text(formData, "price"));
  const mrp = text(formData, "mrp") ? Number(text(formData, "mrp")) : null;
  const quantity = Number(text(formData, "quantity"));
  if (!name || !categoryId || !Number.isFinite(price) || price < 0) throw new Error("Name, category and a valid price are required.");
  if (mrp !== null && (!Number.isFinite(mrp) || mrp < price)) throw new Error("MRP must be greater than or equal to price.");
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error("Stock quantity must be a non-negative integer.");

  let sizeOptions: Prisma.InputJsonValue | undefined = undefined;
  const rawOptions = text(formData, "sizeOptions");
  if (rawOptions) {
    try { const parsed = JSON.parse(rawOptions); if (!Array.isArray(parsed)) throw new Error(); sizeOptions = parsed; } catch { throw new Error("Size options must be a valid JSON array."); }
  }

  await prisma.product.create({ data: {
    name, slug: await uniqueSlug(text(formData, "slug") || name), categoryId, vendorId: vendor.id,
    approvalStatus: "PENDING", isActive: false, price, discountPrice: mrp,
    quantity, stockStatus: quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
    shortDescription: text(formData, "shortDescription"), longDescription: text(formData, "longDescription"),
    subcategory: text(formData, "subcategory") || null, sku: text(formData, "brand") || null,
    tags: list(text(formData, "tags")), size: text(formData, "size") || null,
    sizeOptions, weight: text(formData, "weight") || null, color: text(formData, "color") || null,
    material: text(formData, "material") || null, estimatedDeliveryTime: text(formData, "estimatedDeliveryTime") || null,
    hasCertificate: formData.get("hasCertificate") === "on", certificateLabel: text(formData, "certificateLabel") || null,
  } });
  revalidatePath("/vendor/dashboard");
  revalidatePath("/admin/product-moderation");
  redirect("/vendor/products/create/success");
}

export async function approveVendorProduct(productId: string) { await requireAdmin(); await prisma.product.update({ where: { id: productId }, data: { approvalStatus: "APPROVED", isActive: true } }); revalidatePath("/admin/product-moderation"); revalidatePath("/products"); }
export async function rejectVendorProduct(productId: string) { await requireAdmin(); await prisma.product.update({ where: { id: productId }, data: { approvalStatus: "REJECTED", isActive: false } }); revalidatePath("/admin/product-moderation"); revalidatePath("/vendor/dashboard"); }
export async function getPendingVendorProducts() { await requireAdmin(); return prisma.product.findMany({ where: { vendorId: { not: null }, approvalStatus: "PENDING" }, include: { vendor: true, category: true, gallery: true }, orderBy: { createdAt: "desc" } }); }
export async function getApprovedVendorProducts(vendorId: string) { await requireVendor(); return prisma.product.findMany({ where: { vendorId, approvalStatus: "APPROVED" }, include: { category: true }, orderBy: { createdAt: "desc" } }); }
export async function getAllVendorProducts(vendorId: string) { await requireVendor(); return prisma.product.findMany({ where: { vendorId }, include: { category: true }, orderBy: { createdAt: "desc" } }); }
