import { prisma } from "@/lib/prisma";
import { SocialLinksForm } from "@/components/admin/settings/social-links-form";

export const dynamic = "force-dynamic";

const PLATFORMS = [
  "facebook",
  "youtube",
  "instagram",
  "twitter",
  "whatsapp",
  "googlebusiness",
];

export default async function SocialLinksPage() {
  let rows: { platform: string; url: string; isActive: boolean }[] = [];
  try {
    const existing = await prisma.socialLink.findMany({
      orderBy: { sortOrder: "asc" },
    });
    rows = PLATFORMS.map((platform) => {
      const row = existing.find((r) => r.platform === platform);
      return {
        platform,
        url: row?.url ?? "",
        isActive: row?.isActive ?? false,
      };
    });
  } catch {
    rows = PLATFORMS.map((platform) => ({
      platform,
      url: "",
      isActive: false,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Social Media Links</h1>
        <p className="text-sm text-muted-foreground">
          Facebook, YouTube, Instagram, X/Twitter, WhatsApp and Google Business
          — shown in the top header and footer.
        </p>
      </div>
      <SocialLinksForm rows={rows} />
    </div>
  );
}
