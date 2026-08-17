import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, UserRound, Tag } from "lucide-react";
import { ArticleContent } from "@/components/articles/article-content";
import { ShareButtons } from "@/components/social/share-buttons";
import { getArticleBySlug } from "@/lib/articles-data";
import { absoluteUrl } from "@/lib/share";
import { IMAGE_FALLBACK_STYLES } from "@/components/sections/shop-helpers";
import { BookOpenText } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  const title = article.metaTitle || `${article.title} | JAIGURU ASTROREMEDY`;
  const description =
    article.metaDescription ||
    `Read "${article.title}" by ${article.authorName} — ${article.category} insights from JAIGURU ASTROREMEDY.`;
  const ogImage = absoluteUrl(`/api/og/articles/${article.slug}`);
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/articles/${article.slug}`) },
    openGraph: {
      type: "article",
      url: absoluteUrl(`/articles/${article.slug}`),
      siteName: "JAIGURU ASTROREMEDY",
      title: article.metaTitle || article.title,
      description,
      images: [ogImage],
      publishedTime: article.publishDate.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle || article.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <section className="relative overflow-hidden pb-20 pt-14 sm:pt-16">
      <div className="hero-glow-gold absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm font-medium text-golden transition hover:text-[#FACC15]"
        >
          <ArrowLeft className="h-4 w-4" /> All Articles
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="rounded-full border border-premium-gold/50 bg-deep-navy/70 px-3 py-1 font-semibold uppercase tracking-wide text-golden">
            {article.category}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(article.publishDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" />
            {article.authorName}
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
          {article.title}
        </h1>

        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            width={1200}
            height={675}
            className="mt-8 aspect-[16/9] w-full rounded-2xl border border-white/10 object-cover"
          />
        ) : (
          <div
            className={`mt-8 flex aspect-[16/9] w-full items-center justify-center rounded-2xl border border-white/10 ${IMAGE_FALLBACK_STYLES}`}
          >
            <BookOpenText className="h-14 w-14 text-golden/60" />
          </div>
        )}

        <div className="glass-card mt-8 rounded-[var(--jaiguru-card-radius)] p-6 sm:p-8">
          <ArticleContent html={article.content} />
        </div>

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-golden" />
            {article.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Share this article
          </p>
          <ShareButtons
            title={article.title}
            description={article.metaDescription ?? undefined}
            path={`/articles/${article.slug}`}
          />
        </div>
      </div>
    </section>
  );
}