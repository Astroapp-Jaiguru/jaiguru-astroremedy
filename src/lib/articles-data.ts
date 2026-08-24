import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  featuredImage: string | null;
  category: string;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  authorName: string;
  publishDate: Date;
  isFeatured: boolean;
}

export type ArticleDetail = ArticleSummary & { content: string };

const summarySelect = {
  id: true,
  slug: true,
  title: true,
  featuredImage: true,
  category: true,
  tags: true,
  metaTitle: true,
  metaDescription: true,
  authorName: true,
  publishDate: true,
  isFeatured: true,
} as const;

/**
 * Published articles (newest first). Drafts (isActive=false) are never
 * exposed on the public site, but stay visible in the admin list.
 */
export const getArticles = cache(async (): Promise<ArticleSummary[]> => {
  try {
    const rows = await prisma.article.findMany({
      where: { isActive: true },
      select: summarySelect,
      orderBy: [{ isFeatured: "desc" }, { publishDate: "desc" }],
    });
    return rows.map((r) => ({
      ...r,
      publishDate: new Date(r.publishDate),
    }));
  } catch (e) {
    console.error("[articles-data] getArticles failed:", e);
    return [];
  }
});

export const getArticleBySlug = cache(
  async (slug: string): Promise<ArticleDetail | null> => {
    try {
      const row = await prisma.article.findFirst({
        where: { slug, isActive: true },
      });
      if (!row) return null;
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        featuredImage: row.featuredImage,
        content: row.content,
        category: row.category,
        tags: row.tags,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        authorName: row.authorName,
        publishDate: new Date(row.publishDate),
        isFeatured: row.isFeatured,
      };
    } catch (e) {
      console.error("[articles-data] getArticleBySlug failed:", e);
      return null;
    }
  }
);

export const getArticleCategories = cache(async (): Promise<string[]> => {
  const articles = await getArticles();
  return [...new Set(articles.map((a) => a.category).filter(Boolean))].sort();
});

export const ARTICLES_ENABLED_STORAGE_KEY = "articlesEnabled";

/**
 * Admin-controlled master toggle for the whole Article system
 * ("Show Articles on Website", Homepage > Articles Settings, default ON).
 * When OFF the public listing/detail pages 404, the OG endpoint refuses,
 * and the Articles links disappear from the header, mobile menu and footer.
 */
export const getArticlesEnabled = cache(async (): Promise<boolean> => {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: ARTICLES_ENABLED_STORAGE_KEY },
    });
    const v =
      row?.value && typeof row.value === "object"
        ? (row.value as Record<string, unknown>)
        : {};
    return typeof v.enabled === "boolean" ? v.enabled : true;
  } catch (e) {
    console.error("[articles-data] getArticlesEnabled failed:", e);
    return true;
  }
});
