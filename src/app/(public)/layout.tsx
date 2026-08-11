import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getSeoDefaults } from "@/lib/seo-data";
import { SiteHeaderShell } from "@/components/layout/site-header-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingCta } from "@/components/layout/floating-cta";
import { FacebookCommentButton } from "@/components/layout/facebook-comment-button";
import { ThemeStyles } from "@/components/layout/theme-styles";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoDefaults();
  return {
    title: {
      default: seo.title,
      template: `%s | ${siteConfig.name}`,
    },
  };
}

/**
 * Public pages read editable content (header, footer, announcements, hero)
 * from the database, so they must be server-rendered per request.
 */
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ThemeStyles />
      <SiteHeaderShell />
      <main className="relative flex-1 overflow-hidden bg-celestial">
        <div
          className="bg-celestial-stars pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div className="relative">{children}</div>
      </main>
      <SiteFooter />
      <FloatingCta />
      <FacebookCommentButton />
    </>
  );
}