"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createYoutubeVideoAction,
  updateYoutubeVideoAction,
} from "@/lib/admin/youtube/actions";

export interface YoutubeFormValues {
  id?: string;
  title: string;
  description: string;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
}

export function YoutubeForm({ video }: { video?: YoutubeFormValues }) {
  const action = video?.id ? updateYoutubeVideoAction : createYoutubeVideoAction;
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
          <Input id="title" name="title" defaultValue={video?.title ?? ""} required placeholder="e.g. Jupiter Transit Remedies 2025" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="youtubeUrl">YouTube URL *</Label>
          <Input id="youtubeUrl" name="youtubeUrl" defaultValue={video?.youtubeUrl ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtubeId">Video ID (auto-detected from URL)</Label>
          <Input id="youtubeId" name="youtubeId" defaultValue={video?.youtubeId ?? ""} placeholder="dQw4w9WgXcQ" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={video?.sortOrder ?? "0"} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
          <Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={video?.thumbnailUrl ?? ""} placeholder="https://img.youtube.com/vi/{id}/hqdefault.jpg auto-used if empty" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={video?.description ?? ""} placeholder="Short caption for this video" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={video?.category ?? ""} placeholder="e.g. Astrology, Vastu, Remedies" />
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