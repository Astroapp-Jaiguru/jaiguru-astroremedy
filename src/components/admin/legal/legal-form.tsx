"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createLegalPageAction,
  updateLegalPageAction,
} from "@/lib/admin/legal/actions";

export interface LegalFormValues {
  id?: string;
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
  sortOrder: string;
}

export function LegalForm({ page }: { page?: LegalFormValues }) {
  const action = page?.id ? updateLegalPageAction : createLegalPageAction;
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(page?.id);

  return (
    <form action={formAction} className="space-y-6">
      {page?.id ? <input type="hidden" name="id" value={page.id} /> : null}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Page Title *</Label>
          <Input id="title" name="title" defaultValue={page?.title ?? ""} required placeholder="e.g. Privacy Policy" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={page?.slug ?? ""} placeholder="Leave empty to auto-generate" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="content">Page Content *</Label>
          <Textarea id="content" name="content" rows={16} defaultValue={page?.content ?? ""} required placeholder={"# Heading\n\nParagraph text.\n\n## Sub heading\n- bullet one\n- bullet two"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoTitle">SEO Title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={page?.seoTitle ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoDescription">SEO Description</Label>
          <Input id="seoDescription" name="seoDescription" defaultValue={page?.seoDescription ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={page?.sortOrder ?? "0"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={page?.isActive ?? true} className="size-4 accent-[#4C1D95]" />
          Active (visible on site)
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update Page" : "Create Page"}
      </Button>
    </form>
  );
}