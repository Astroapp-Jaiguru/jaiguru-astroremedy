"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin FAQ (homepage section) - full CRUD: question, answer, optional
 * category, sort order and active toggle.
 */

export interface FaqInput {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export async function upsertFaqAction(
  id: string | null,
  input: FaqInput
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const question = input.question.trim().slice(0, 300);
  if (!question) return { ok: false, error: "Question is required." };
  const answer = input.answer.trim().slice(0, 8000);
  if (!answer) return { ok: false, error: "Answer is required." };
  const category = input.category.trim().slice(0, 100) || null;

  try {
    const data = {
      question,
      answer,
      category,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
      isActive: input.isActive,
    };
    if (id) {
      await prisma.faq.update({ where: { id }, data });
    } else {
      await prisma.faq.create({ data });
    }
  } catch (e) {
    console.error("[admin] upsertFaqAction failed:", e);
    return { ok: false, error: "Could not save the FAQ." };
  }
  revalidatePath("/admin/faq");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteFaqAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const row = await prisma.faq.findUnique({ where: { id } });
    if (!row) return { ok: false, error: "FAQ not found." };
    await prisma.faq.delete({ where: { id } });
  } catch (e) {
    console.error("[admin] deleteFaqAction failed:", e);
    return { ok: false, error: "Could not delete the FAQ." };
  }
  revalidatePath("/admin/faq");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleFaqAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const row = await prisma.faq.findUnique({ where: { id } });
    if (!row) return { ok: false, error: "FAQ not found." };
    await prisma.faq.update({
      where: { id },
      data: { isActive: !row.isActive },
    });
  } catch (e) {
    console.error("[admin] toggleFaqAction failed:", e);
    return { ok: false, error: "Could not update the FAQ." };
  }
  revalidatePath("/admin/faq");
  revalidatePath("/");
  return { ok: true };
}