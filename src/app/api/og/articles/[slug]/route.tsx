import { ImageResponse } from "next/og";
import { getArticleBySlug, getArticlesEnabled } from "@/lib/articles-data";
import { OgCard, ogFonts } from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "Article — JAIGURU ASTROREMEDY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const enabled = await getArticlesEnabled();
  if (!enabled) return new Response("Not found", { status: 404 });
  const article = await getArticleBySlug(slug);
  if (!article) return new Response("Not found", { status: 404 });
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