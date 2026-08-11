import { getSiteData } from "@/lib/site-data";
import { requireAdmin } from "@/lib/dal";
import { getTypographyOverrides } from "@/lib/typography-overrides";
import { AstrologerForm } from "@/components/admin/content/astrologer-form";

export const dynamic = "force-dynamic";

export default async function AdminAstrologerPage() {
  await requireAdmin();
  const [data, overrides] = await Promise.all([
    getSiteData(),
    getTypographyOverrides(),
  ]);
  const a = data.astrologer;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Astrologer Profile</h1>
        <p className="text-sm text-muted-foreground">
          Public profile shown on the About page and used for hero metadata.
        </p>
      </div>
      <AstrologerForm
        initial={{
          name: a.name,
          title: a.title,
          subtitle: a.subtitle,
          bio: a.bio,
          yearsExperience: a.yearsExperience,
          photoUrl: a.photoUrl ?? "",
          expertise: [...a.expertise],
          specialties: [...a.specialties],
          typography: overrides.astrologer,
        }}
      />
    </div>
  );
}