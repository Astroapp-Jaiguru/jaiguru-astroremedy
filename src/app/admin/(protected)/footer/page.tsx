import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { FooterSettingsForm } from "@/components/admin/settings/footer-settings-form";
import type { FooterFormValues } from "@/components/admin/settings/footer-settings-form";

export const dynamic = "force-dynamic";

export default async function FooterSettingsPage() {
  let values: FooterFormValues = {
    about:
      "Premium Vedic Astrology, Vastu, Numerology, Yoga and Spiritual Remedy guidance in Kolkata by Vedic Astrologer Arup Shastri (Jai Guru).",
    ownedBy: siteConfig.business.ownedByLine,
    registered: siteConfig.business.registeredLine,
    copyright: siteConfig.business.copyrightLine,
  };
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "footer" },
    });
    const v =
      row?.value && typeof row.value === "object"
        ? (row.value as Record<string, unknown>)
        : {};
    const s = (x: unknown, fb: string) =>
      typeof x === "string" && x ? x : fb;
    values = {
      about: s(v.about, values.about),
      ownedBy: s(v.ownedBy, values.ownedBy),
      registered: s(v.registered, values.registered),
      copyright: s(v.copyright, values.copyright),
    };
  } catch {
    // DB unreachable - use design defaults.
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Footer Settings</h1>
        <p className="text-sm text-muted-foreground">
          Footer about text and legal lines — stored in the database and shown
          on the public website.
        </p>
      </div>
      <FooterSettingsForm initial={values} />
    </div>
  );
}