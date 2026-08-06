"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createVideoAction, updateVideoAction } from "@/lib/admin/videos/actions";

export interface VideoFormValues {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
}

export function VideoForm({ video }: { video?: VideoFormValues }) {
  const action = video?.id ? updateVideoAction : createVideoAction;
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(video?.id);

  return (
    <form action={formAction} className="space-y-6">
      {video?.id ? <input type="hidden" name="id" value={video.id} /> : null}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Video Title *</Label>
          <Input id="title" name="title" defaultValue={video?.title ?? ""} required placeholder="e.g. Live Maha Shivratri Pooja 2025" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="videoUrl">Video URL (mp4 / stream) *</Label>
          <Input id="videoUrl" name="videoUrl" defaultValue={video?.videoUrl ?? ""} required placeholder="https://cdn.example.com/videos/pooja.mp4" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
          <Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={video?.thumbnailUrl ?? ""} placeholder="Optional — a poster image" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={video?.description ?? ""} placeholder="Short caption for this video" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={video?.category ?? ""} placeholder="e.g. Pooja, Course, Testimonial" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={video?.sortOrder ?? "0"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={video?.isFeatured ?? false} className="size-4 accent-[#4C1D95]" />
          Featured
        </label>
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={video?.isActive ?? true} className="size-4 accent-[#4C1D95]" />
          Active
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update Video" : "Add Video"}
      </Button>
    </form>
  );
}