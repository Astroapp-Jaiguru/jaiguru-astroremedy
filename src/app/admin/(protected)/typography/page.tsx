import { prisma } from "@/lib/prisma";
import { normalizeTheme, THEME_STORAGE_KEY } from "@/config/theme";
import { TypographyForm } from "@/components/admin/settings/typography-form";

export const dynamic = "force-dynamic";

export default async function TypographyPage() {
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
        <h1 className="font-heading text-2xl font-bold">Typography</h1>
        <p className="text-sm text-muted-foreground">
          Global font family, size, weight, color and gradient controls for all
          text across the website — applied instantly after saving.
        </p>
      </div>
      <TypographyForm initial={theme} />
    </div>
  );
}