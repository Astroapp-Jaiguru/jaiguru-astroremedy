"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin consultation topic CRUD actions.
 * Rows drive the homepage consultation cards, the /consultations pages and
 * the header "Consultations" dropdown (scope §7.5).
 */

export interface ConsultationTopicFormState {
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

function toLines(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTopicForm(fd: FormData) {
  return {
    slug: slugify(str(fd, "slug")),
    title: str(fd, "title"),
    description: str(fd, "description"),
    longDescription: str(fd, "longDescription"),
    iconKey: str(fd, "iconKey") || "star",
    fee: str(fd, "fee") || "₹700",
    homeFee: str(fd, "homeFee") || "₹1,500",
    durationMinutes: toInt(str(fd, "durationMinutes"), 30),
    keywords: toLines(str(fd, "keywords")),
    benefits: toLines(str(fd, "benefits")),
    isActive: checked(fd, "isActive"),
    sortOrder: toInt(str(fd, "sortOrder"), 0),
  };
}

function validate(
  data: ReturnType<typeof parseTopicForm>
): string | undefined {
  if (!data.slug) return "Slug is required (e.g. astrology).";
  if (!data.title) return "Title is required.";
  if (!data.description) return "Short description is required.";
  if (!data.longDescription) return "Long description is required.";
  if (data.durationMinutes < 5 || data.durationMinutes > 180)
    return "Duration must be between 5 and 180 minutes.";
  return undefined;
}

export async function createConsultationTopicAction(
  _state: ConsultationTopicFormState | undefined,
  fd: FormData
): Promise<ConsultationTopicFormState> {
  await requireAdmin();
  const data = parseTopicForm(fd);
  const err = validate(data);
  if (err) return { error: err };

  try {
    await prisma.consultationTopic.create({ data });
  } catch (e) {
    console.error("[admin] createConsultationTopic failed:", e);
    return { error: "Could not save the topic. Check the slug is unique." };
  }

  revalidatePublicPaths();
  redirect("/admin/consultation-topics");
}

export async function updateConsultationTopicAction(
  _state: ConsultationTopicFormState | undefined,
  fd: FormData
): Promise<ConsultationTopicFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Missing topic id." };
  const data = parseTopicForm(fd);
  const err = validate(data);
  if (err) return { error: err };

  try {
    await prisma.consultationTopic.update({ where: { id }, data });
  } catch (e) {
    console.error("[admin] updateConsultationTopic failed:", e);
    return { error: "Could not update the topic. Check the slug is unique." };
  }

  revalidatePublicPaths();
  redirect("/admin/consultation-topics");
}

export async function deleteConsultationTopicAction(
  id: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.consultationTopic.delete({ where: { id } });
    revalidatePublicPaths();
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteConsultationTopic failed:", e);
    return { ok: false };
  }
}

function revalidatePublicPaths() {
  revalidatePath("/");
  revalidatePath("/consultations");
  revalidatePath("/consultations/[slug]", "page");
}