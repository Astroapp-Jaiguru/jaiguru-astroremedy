import { requireAdmin } from "@/lib/dal";
import { getGallerySections } from "@/lib/gallery-data";
import { getArticlesEnabled } from "@/lib/articles-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GallerySectionsForm } from "@/components/admin/settings/gallery-sections-form";
import { ArticlesSettingsForm } from "@/components/admin/settings/articles-settings-form";

export const metadata = { title: "Homepage | Admin" };

export default async function AdminHomepagePage() {
  await requireAdmin();
  const [sections, articlesEnabled] = await Promise.all([
    getGallerySections(),
    getArticlesEnabled(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Homepage</h1>
        <p className="text-sm text-muted-foreground">
          Homepage section visibility settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gallery Sections</CardTitle>
          <CardDescription>
            Control which gallery tiles appear in the &quot;Explore Our Gallery&quot;
            band on the homepage. The layout adjusts automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GallerySectionsForm initial={sections} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Articles Settings</CardTitle>
          <CardDescription>
            Master control for the Article Posting System (knowledge base at
            /articles).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticlesSettingsForm enabled={articlesEnabled} />
        </CardContent>
      </Card>
    </div>
  );
}