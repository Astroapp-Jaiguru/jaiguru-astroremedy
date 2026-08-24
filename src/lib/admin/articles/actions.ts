"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin article CRUD actions. Rows drive the public /articles listing and
 * the /articles/[slug] detail pages (scope: Article Posting System).
 */

export interface ArticleFormState {
  error?: string;
  success?: boolean;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function checked(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}

function toLines(s: string): string[] {
  return s
    .split(/[\n,]/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function parseArticleForm(fd: FormData) {
  const publishDate = str(fd, "publishDate");
  return {
    title: str(fd, "title"),
    slug: slugify(str(fd, "slug")),
    featuredImage: str(fd, "featuredImage") || null,
    content: str(fd, "content"),
    category: str(fd, "category"),
    tags: toLines(str(fd, "tags")),
    metaTitle: str(fd, "metaTitle") || null,
    metaDescription: str(fd, "metaDescription") || null,
    authorName: str(fd, "authorName"),
    publishDate: publishDate ? new Date(publishDate) : new Date(),
    isActive: checked(fd, "isActive"),
    isFeatured: checked(fd, "isFeatured"),
  };
}

function validate(
  data: ReturnType<typeof parseArticleForm>
): string | undefined {
  if (!data.title) return "Title is required.";
  if (!data.slug) return "Slug is required (e.g. vastu-tips-for-home).";
  if (!data.content || data.content.replace(/<[^>]*>/g, "").trim().length === 0)
    return "Article content is required.";
  if (!data.category) return "Category is required.";
  if (!data.authorName) return "Author name is required.";
  return undefined;
}

export async function createArticleAction(
  _state: ArticleFormState | undefined,
  fd: FormData
): Promise<ArticleFormState> {
  await requireAdmin();
  const data = parseArticleForm(fd);
  const err = validate(data);
  if (err) return { error: err };

  try {
    await prisma.article.create({ data });
  } catch (e) {
    console.error("[admin] createArticle failed:", e);
    return { error: "Could not save the article. Check the slug is unique." };
  }

  revalidatePublicPaths();
  redirect("/admin/articles");
}

export async function updateArticleAction(
  _state: ArticleFormState | undefined,
  fd: FormData
): Promise<ArticleFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Missing article id." };
  const data = parseArticleForm(fd);
  const err = validate(data);
  if (err) return { error: err };

  try {
    await prisma.article.update({ where: { id }, data });
  } catch (e) {
    console.error("[admin] updateArticle failed:", e);
    return { error: "Could not update the article. Check the slug is unique." };
  }

  revalidatePublicPaths();
  redirect("/admin/articles");
}

export async function deleteArticleAction(
  id: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.article.delete({ where: { id } });
    revalidatePublicPaths();
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteArticle failed:", e);
    return { ok: false };
  }
}

function revalidatePublicPaths() {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/articles/[slug]", "page");
}
