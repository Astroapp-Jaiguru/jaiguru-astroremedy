import { prisma } from "@/lib/prisma";
import { normalizeTheme, THEME_STORAGE_KEY } from "@/config/theme";
import { ThemeSettingsForm } from "@/components/admin/settings/theme-settings-form";

export const dynamic = "force-dynamic";

export default async function ThemeSettingsPage() {
  let theme = normalizeTheme(undefined);
  try {
    const row = await prisma.themeSetting.findUnique({
      where: { key: THEME_STORAGE_KEY },
    });
    theme = normalizeTheme(row?.value);
  } catch {
    // DB unreachable - use design defaults.
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Theme Settings</h1>
        <p className="text-sm text-muted-foreground">
          Colors, fonts, radii and section spacing — applied instantly on the
          public website after saving.
        </p>
      </div>
      <ThemeSettingsForm initial={theme} />
    </div>
  );
}
