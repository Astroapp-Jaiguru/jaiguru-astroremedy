"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import type {
  FaqTypographyMap,
  TypographyOverride,
} from "@/lib/typography-overrides";

const FAQ_TYPOGRAPHY_KEY = "faq-typography";

/**
 * Admin FAQ (homepage section) - full CRUD: question, answer, optional
 * category, sort order and active toggle. Question/answer also support
 * per-field local typography overrides stored in the "faq-typography"
 * SiteSetting row, keyed by FAQ id.
 */

export interface FaqInput {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  typography?: { question?: TypographyOverride; answer?: TypographyOverride };
}

async function getFaqTypography(): Promise<FaqTypographyMap> {
  const row = await prisma.siteSetting.findUnique({
    where: { key: FAQ_TYPOGRAPHY_KEY },
  });
  return ((row?.value ?? {}) as FaqTypographyMap);
}

async function saveFaqTypography(map: FaqTypographyMap): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: FAQ_TYPOGRAPHY_KEY },
    update: { value: map as never },
    create: { key: FAQ_TYPOGRAPHY_KEY, value: map as never },
  });
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

  try {
    const map = await getFaqTypography();
    const targetId = id ?? (await prisma.faq.findFirst({
      where: { question, answer },
      orderBy: { createdAt: "desc" },
    }))?.id;
    if (targetId) {
      if (input.typography?.question || input.typography?.answer) {
        map[targetId] = {
          question: input.typography?.question,
          answer: input.typography?.answer,
        };
      } else {
        delete map[targetId];
      }
      await saveFaqTypography(map);
    }
  } catch (e) {
    console.error("[admin] upsertFaqAction typography failed:", e);
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
    const map = await getFaqTypography();
    if (map[id]) {
      delete map[id];
      await saveFaqTypography(map);
    }
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