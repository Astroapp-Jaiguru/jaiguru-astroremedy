import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Public legal pages data layer (Phase 6).
 * Reads active legal pages for footer links and /legal/[slug] pages.
 */

export interface LegalPageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
}

export const getLegalPages = cache(async (): Promise<LegalPageData[]> => {
  try {
    const rows = await prisma.legalPage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      content: r.content,
      seoTitle: r.seoTitle,
      seoDescription: r.seoDescription,
      sortOrder: r.sortOrder,
    }));
  } catch (e) {
    console.error("[legal-data] getLegalPages failed:", e);
    return [];
  }
});

export const getLegalPageBySlug = cache(
  async (slug: string): Promise<LegalPageData | null> => {
    try {
      const row = await prisma.legalPage.findFirst({
        where: { slug, isActive: true },
      });
      if (!row) return null;
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        content: row.content,
        seoTitle: row.seoTitle,
        seoDescription: row.seoDescription,
        sortOrder: row.sortOrder,
      };
    } catch (e) {
      console.error("[legal-data] getLegalPageBySlug failed:", e);
      return null;
    }
  }
);