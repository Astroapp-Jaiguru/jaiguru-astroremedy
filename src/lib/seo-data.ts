import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

/**
 * Global SEO defaults (Phase 8) - editable from /admin/seo and stored in
 * the SeoSetting model under the "default" key. Used by the root layout's
 * generateMetadata so every public page receives the configured title,
 * description and keywords in <head>.
 */

export interface SeoDefaults {
  title: string;
  description: string;
  keywords: string;
  ogImage: string | null;
}

export const getSeoDefaults = cache(async (): Promise<SeoDefaults> => {
  try {
    const row = await prisma.seoSetting.findUnique({
      where: { key: "default" },
    });
    const v =
      row?.value && typeof row.value === "object"
        ? (row.value as Record<string, unknown>)
        : {};
    return {
      title:
        typeof v.title === "string" && v.title
          ? v.title
          : siteConfig.defaultSeo.title,
      description:
        typeof v.description === "string" && v.description
          ? v.description
          : siteConfig.defaultSeo.description,
      keywords:
        typeof v.keywords === "string" && v.keywords
          ? v.keywords
          : siteConfig.defaultSeo.keywords,
      ogImage:
        typeof v.ogImage === "string" && v.ogImage ? v.ogImage : null,
    };
  } catch {
    return {
      title: siteConfig.defaultSeo.title,
      description: siteConfig.defaultSeo.description,
      keywords: siteConfig.defaultSeo.keywords,
      ogImage: null,
    };
  }
});
