"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin testimonial CRUD actions (Phase 6, scope §7.8).
 */

export interface TestimonialFormState {
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

function parseTestimonialForm(fd: FormData) {
  return {
    customerName: str(fd, "customerName"),
    photoUrl: str(fd, "photoUrl") || null,
    rating: toInt(str(fd, "rating"), 5),
    text: str(fd, "text"),
    serviceRef: str(fd, "serviceRef") || null,
    location: str(fd, "location") || null,
    isApproved: checked(fd, "isApproved"),
    isFeatured: checked(fd, "isFeatured"),
    sortOrder: toInt(str(fd, "sortOrder"), 0),
  };
}

export async function createTestimonialAction(
  _state: TestimonialFormState | undefined,
  fd: FormData
): Promise<TestimonialFormState> {
  await requireAdmin();
  const data = parseTestimonialForm(fd);
  if (!data.customerName) return { error: "Customer name is required." };
  if (!data.text) return { error: "Testimonial text is required." };
  if (data.rating < 1 || data.rating > 5)
    return { error: "Rating must be between 1 and 5." };

  try {
    await prisma.testimonial.create({ data });
  } catch (e) {
    console.error("[admin] createTestimonial failed:", e);
    return { error: "Could not save the testimonial. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/testimonials");
  redirect("/admin/testimonials");
}

export async function updateTestimonialAction(
  _state: TestimonialFormState | undefined,
  fd: FormData
): Promise<TestimonialFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Missing testimonial id." };
  const data = parseTestimonialForm(fd);
  if (!data.customerName) return { error: "Customer name is required." };
  if (!data.text) return { error: "Testimonial text is required." };
  if (data.rating < 1 || data.rating > 5)
    return { error: "Rating must be between 1 and 5." };

  try {
    await prisma.testimonial.update({ where: { id }, data });
  } catch (e) {
    console.error("[admin] updateTestimonial failed:", e);
    return { error: "Could not update the testimonial. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonialAction(
  id: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.testimonial.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/testimonials");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteTestimonial failed:", e);
    return { ok: false };
  }
}
