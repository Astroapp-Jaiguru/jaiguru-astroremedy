import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { FONT_VARIABLE_CLASSES } from "@/lib/fonts";
import { getSeoDefaults } from "@/lib/seo-data";
import { getSiteData } from "@/lib/site-data";
import { InstallBanner } from "@/components/layout/install-banner";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoDefaults();
  const siteData = await getSiteData();
  const favicon = siteData.branding.favicon || "/favicon.png";
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    title: {
      default: seo.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: seo.description,
    keywords: seo.keywords,
    icons: {
      icon: favicon,
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      title: "Jaiguru Astroremedy",
      statusBarStyle: "black-translucent",
    },
    themeColor: "#0B1120",
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: seo.title,
      description: seo.description,
      ...(seo.ogImage ? { images: [{ url: seo.ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${FONT_VARIABLE_CLASSES} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
        <InstallBanner />
      </body>
    </html>
  );
}