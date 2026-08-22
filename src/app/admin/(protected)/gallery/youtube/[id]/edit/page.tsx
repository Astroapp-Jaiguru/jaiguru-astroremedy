import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { YoutubeForm } from "@/components/admin/gallery/youtube-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditYoutubePage({ params }: Props) {
  const { id } = await params;
  const video = await prisma.youtubeVideo.findUnique({ where: { id } });
  if (!video) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/gallery/youtube"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to gallery
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">Edit YouTube Video</h1>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <YoutubeForm
          video={{
            id: video.id,
            title: video.title,
            description: video.description ?? "",
            youtubeId: video.youtubeId,
            youtubeUrl: video.youtubeUrl,
            thumbnailUrl: video.thumbnailUrl ?? "",
            category: video.category ?? "",
            isFeatured: video.isFeatured,
            isActive: video.isActive,
            sortOrder: video.sortOrder.toString(),
          }}
        />
      </div>
    </div>
  );
}