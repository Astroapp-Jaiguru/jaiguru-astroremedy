import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "@/components/admin/articles/article-form";

export const dynamic = "force-dynamic";

export default function AdminNewArticlePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to articles
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">New Article</h1>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <ArticleForm />
      </div>
    </div>
  );
}