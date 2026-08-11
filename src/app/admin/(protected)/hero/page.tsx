import { getSiteData } from "@/lib/site-data";
import { requireAdmin } from "@/lib/dal";
import { HeroSettingsForm } from "@/components/admin/content/hero-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  await requireAdmin();
  const data = await getSiteData();
  const hero = data.hero;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Hero Section</h1>
        <p className="text-sm text-muted-foreground">
          Headline, subheading, trust badge, images and CTA labels. Changes
          appear on the homepage immediately after saving.
        </p>
      </div>
      <HeroSettingsForm
        initial={{
          badge: hero.badge,
          headlineLine1: hero.headlineLine1,
          headlineLine2: hero.headlineLine2,
          headlineLine3: hero.headlineLine3,
          subtext: hero.subtext,
          feeText: hero.feeText,
          astrologerImage: hero.astrologerImage ?? "",
          masterImage: hero.masterImage ?? "",
          active: Boolean(hero.active),
          whatsappLabel: hero.buttons.whatsapp.label,
          callLabel: hero.buttons.call.label,
          productsLabel: hero.buttons.products.label,
        }}
      />
    </div>
  );
}