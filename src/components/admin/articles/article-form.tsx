"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createArticleAction,
  updateArticleAction,
} from "@/lib/admin/articles/actions";
import { ArticleEditor } from "@/components/admin/articles/article-editor";

export interface ArticleFormValues {
  id?: string;
  title: string;
  slug: string;
  featuredImage: string;
  content: string;
  category: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  authorName: string;
  publishDate: string;
  isActive: boolean;
  isFeatured: boolean;
}

export function ArticleForm({ article }: { article?: ArticleFormValues }) {
  const action = article?.id
    ? updateArticleAction
    : createArticleAction;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      {article?.id ? (
        <input type="hidden" name="id" value={article.id} />
      ) : null}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" defaultValue={article?.title ?? ""} required placeholder="e.g. Vastu Tips for Your Home" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" defaultValue={article?.slug ?? ""} required placeholder="e.g. vastu-tips-for-home" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorName">Author Name *</Label>
          <Input id="authorName" name="authorName" defaultValue={article?.authorName ?? "Arup Shastri (Jai Guru)"} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input id="category" name="category" defaultValue={article?.category ?? ""} required placeholder="e.g. Vastu" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishDate">Publish Date</Label>
          <Input
            id="publishDate"
            name="publishDate"
            type="date"
            defaultValue={article?.publishDate ?? new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="featuredImage">Featured Image URL</Label>
          <Input
            id="featuredImage"
            name="featuredImage"
            type="url"
            defaultValue={article?.featuredImage ?? ""}
            placeholder="https://…/image.jpg"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" name="tags" defaultValue={article?.tags ?? ""} placeholder="vastu, home, tips" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Content *</Label>
        <ArticleEditor name="content" defaultValue={article?.content ?? ""} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
          <Input id="metaTitle" name="metaTitle" defaultValue={article?.metaTitle ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
          <Textarea id="metaDescription" name="metaDescription" defaultValue={article?.metaDescription ?? ""} rows={2} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={article?.isActive ?? true}
            className="h-4 w-4 rounded border-input"
          />
          Active (visible on the public site)
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={article?.isFeatured ?? false}
            className="h-4 w-4 rounded border-input"
          />
          Featured (shown first in the listing)
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {article?.id ? "Save Changes" : "Publish Article"}
        </Button>
      </div>
    </form>
  );
}