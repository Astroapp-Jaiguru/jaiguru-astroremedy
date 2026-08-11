import { getSiteData } from "@/lib/site-data";
import { requireAdmin } from "@/lib/dal";
import { BrandingSettingsForm } from "@/components/admin/content/branding-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminBrandingPage() {
  await requireAdmin();
  const data = await getSiteData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Logo & Branding</h1>
        <p className="text-sm text-muted-foreground">
          Site title, tagline, logos and favicon. Footer copyright lines are
          managed under Footer Settings.
        </p>
      </div>
      <BrandingSettingsForm
        initial={{
          siteName: data.branding.siteName,
          tagline: data.branding.tagline,
          logo: data.branding.logo ?? "",
          logoAlt: data.branding.logoAlt,
          footerLogo: data.branding.footerLogo ?? "",
          favicon: data.branding.favicon ?? "",
        }}
      />
    </div>
  );
}