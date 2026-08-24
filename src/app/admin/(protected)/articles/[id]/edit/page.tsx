import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/articles/article-form";

export const dynamic = "force-dynamic";

export default async function AdminEditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to articles
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">Edit Article</h1>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <ArticleForm
          article={{
            id: article.id,
            title: article.title,
            slug: article.slug,
            featuredImage: article.featuredImage ?? "",
            content: article.content,
            category: article.category,
            tags: article.tags.join(", "),
            metaTitle: article.metaTitle ?? "",
            metaDescription: article.metaDescription ?? "",
            authorName: article.authorName,
            publishDate: new Date(article.publishDate)
              .toISOString()
              .slice(0, 10),
            isActive: article.isActive,
            isFeatured: article.isFeatured,
          }}
        />
      </div>
    </div>
  );
}