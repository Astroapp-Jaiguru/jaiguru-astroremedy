import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { VideoForm } from "@/components/admin/gallery/video-form";

export const dynamic = "force-dynamic";

export default function AdminNewVideoPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/gallery/videos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to gallery
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">Add Video</h1>
        <p className="text-sm text-muted-foreground">
          <Plus className="mr-1 inline h-3 w-3" />
          New video gallery entry.
        </p>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <VideoForm />
      </div>
    </div>
  );
}