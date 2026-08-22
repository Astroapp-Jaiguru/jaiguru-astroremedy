"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createGalleryImageAction,
  updateGalleryImageAction,
} from "@/lib/admin/gallery/actions";

export interface PhotoFormValues {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
}

export function PhotoForm({ photo }: { photo?: PhotoFormValues }) {
  const action = photo?.id ? updateGalleryImageAction : createGalleryImageAction;
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(photo?.id);

  return (
    <form action={formAction} className="space-y-6">
      {photo?.id ? <input type="hidden" name="id" value={photo.id} /> : null}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="imageUrl">Image URL *</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            defaultValue={photo?.imageUrl ?? ""}
            required
            placeholder="https://placehold.co/600x400/... or your CDN"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={photo?.title ?? ""} placeholder="e.g. Rudraksha Pooja 2025" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={photo?.description ?? ""} placeholder="Short caption for this photo" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="altText">Alt Text (accessibility)</Label>
          <Input id="altText" name="altText" defaultValue={photo?.altText ?? ""} placeholder="Describe the image for screen readers" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={photo?.category ?? ""} placeholder="e.g. Pooja, Course, Chamber" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={photo?.sortOrder ?? "0"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={photo?.isFeatured ?? false} className="size-4 accent-[#4C1D95]" />
          Featured
        </label>
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={photo?.isActive ?? true} className="size-4 accent-[#4C1D95]" />
          Active
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update Photo" : "Add Photo"}
      </Button>
    </form>
  );
}