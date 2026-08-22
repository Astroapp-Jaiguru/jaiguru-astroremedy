import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/articles-data";
import { OgCard, ogFonts } from "@/lib/og-image";

export const alt = "Article — JAIGURU ASTROREMEDY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return new ImageResponse(<div />, { ...size });
  return new ImageResponse(
    <OgCard
      eyebrow="Article"
      title={article.title}
      description={article.metaDescription ?? undefined}
      meta={article.category}
    />,
    { ...size, fonts: await ogFonts() }
  );
}