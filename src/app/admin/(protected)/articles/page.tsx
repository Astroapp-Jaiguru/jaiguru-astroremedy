import Link from "next/link";
import { Plus, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteArticleAction } from "@/lib/admin/articles/actions";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ publishDate: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Articles</h1>
          <p className="text-sm text-muted-foreground">
            {articles.length} article{articles.length === 1 ? "" : "s"} ·
            published posts appear on /articles and /articles/[slug]
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus /> New Article
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Publish Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No articles yet — publish your first post.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Newspaper className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {a.isFeatured ? (
                            <Badge variant="default" className="mr-2">Featured</Badge>
                          ) : null}
                          {a.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          /articles/{a.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{a.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{a.authorName}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(a.publishDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.isActive ? "default" : "outline"}>
                      {a.isActive ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/articles/${a.slug}`} target="_blank">
                          View
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/articles/${a.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <DeleteButton
                        id={a.id}
                        action={deleteArticleAction}
                        label="Delete"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}