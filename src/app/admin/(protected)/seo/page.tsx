import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { SeoSettingsForm } from "@/components/admin/settings/seo-settings-form";
import type { SeoFormValues } from "@/components/admin/settings/seo-settings-form";

export const dynamic = "force-dynamic";

export default async function SeoSettingsPage() {
  let values: SeoFormValues = {
    title: siteConfig.defaultSeo.title,
    description: siteConfig.defaultSeo.description,
    keywords: siteConfig.defaultSeo.keywords,
  };
  try {
    const row = await prisma.seoSetting.findUnique({
      where: { key: "default" },
    });
    const v =
      row?.value && typeof row.value === "object"
        ? (row.value as Record<string, unknown>)
        : {};
    values = {
      title:
        typeof v.title === "string" && v.title ? v.title : values.title,
      description:
        typeof v.description === "string" && v.description
          ? v.description
          : values.description,
      keywords:
        typeof v.keywords === "string" && v.keywords
          ? v.keywords
          : values.keywords,
    };
  } catch {
    // DB unreachable - use design defaults.
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">SEO Settings</h1>
        <p className="text-sm text-muted-foreground">
          Global search engine title, description and keywords for all public
          pages.
        </p>
      </div>
      <SeoSettingsForm initial={values} />
    </div>
  );
}
