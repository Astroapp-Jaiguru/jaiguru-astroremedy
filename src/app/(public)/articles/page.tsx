import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, UserRound, BookOpenText } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import {
  getArticles,
  getArticleCategories,
  getArticlesEnabled,
  type ArticleSummary,
} from "@/lib/articles-data";
import { getSiteData } from "@/lib/site-data";
import { absoluteUrl } from "@/lib/share";
import { IMAGE_FALLBACK_STYLES } from "@/components/sections/shop-helpers";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Articles & Astrology Insights | JAIGURU ASTROREMEDY",
    description:
      "Vedic astrology, vastu, numerology, yoga and spiritual remedy articles by Vedic Astrologer Arup Shastri (Jai Guru), Kolkata.",
    alternates: { canonical: absoluteUrl("/articles") },
  };
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <RevealItem>
      <Link
        href={`/articles/${article.slug}`}
        className="glass-card group flex h-full flex-col overflow-hidden rounded-[var(--jaiguru-card-radius)] transition-all duration-300 hover:-translate-y-1.5 hover:border-golden/70 hover:shadow-[0_18px_50px_rgba(250,204,21,0.22)]"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-deep-navy">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage}
              alt={article.title}
              width={640}
              height={360}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`flex h-full items-center justify-center ${IMAGE_FALLBACK_STYLES}`}>
              <BookOpenText className="h-12 w-12 text-golden/60" />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full border border-premium-gold/60 bg-deep-navy/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-golden backdrop-blur">
            {article.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h2 className="font-display text-lg font-bold leading-snug text-white transition group-hover:text-golden">
            {article.title}
          </h2>
          <p className="line-clamp-2 text-sm leading-relaxed text-[#E2E8F0]">
            {article.metaDescription ?? article.title}
          </p>
          <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-[#94A3B8]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(article.publishDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {article.authorName}
            </span>
          </div>
        </div>
      </Link>
    </RevealItem>
  );
}

export default async function ArticlesPage() {
  const enabled = await getArticlesEnabled();
  if (!enabled) notFound();
  const [articles, data] = await Promise.all([
    getArticles(),
    getSiteData(),
  ]);
  const categories = await getArticleCategories();

  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-20">
      <div className="hero-glow-gold absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Knowledge Base"
          title="Astrology"
          highlight="Insights"
          subtitle="Articles on Vedic astrology, vastu, numerology, yoga and remedies by Arup Shastri (Jai Guru)."
        />

        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="rounded-full border border-premium-gold/40 bg-deep-navy/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-golden"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {articles.length === 0 ? (
          <div className="glass-card mx-auto max-w-xl rounded-[var(--jaiguru-card-radius)] p-10 text-center">
            <BookOpenText className="mx-auto h-12 w-12 text-golden/60" />
            <h2 className="mt-4 font-display text-xl font-bold text-white">
              Articles Coming Soon
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              New articles are being prepared. Please check back shortly.
            </p>
          </div>
        ) : (
          <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </RevealGroup>
        )}

        <p className="mt-12 text-center text-xs text-slate-500">
          © {data.branding.siteName} — {articles.length} published article
          {articles.length === 1 ? "" : "s"} · Knowledge shared with love
        </p>
      </div>
    </section>
  );
}