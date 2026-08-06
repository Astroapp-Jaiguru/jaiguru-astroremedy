import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteYoutubeVideoAction } from "@/lib/admin/youtube/actions";

export const dynamic = "force-dynamic";

export default async function AdminYoutubePage() {
  const videos = await prisma.youtubeVideo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const thumbFor = (v: { thumbnailUrl: string | null; youtubeId: string }) =>
    v.thumbnailUrl ?? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">YouTube Gallery</h1>
          <p className="text-sm text-muted-foreground">
            {videos.length} video{videos.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/youtube/new">
            <Plus /> Add Video
          </Link>
        </Button>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-12 text-center text-muted-foreground">
          No videos yet. Add your first YouTube video.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-xl border bg-background">
              <div className="relative aspect-video w-full bg-muted">
                <Image
                  src={thumbFor(v)}
                  alt={v.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF0000]/90 shadow-lg">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium">{v.title}</p>
                  <Badge variant={v.isActive ? "default" : "destructive"}>
                    {v.isActive ? "Live" : "Hidden"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  youtube.com/watch?v={v.youtubeId}
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/gallery/youtube/${v.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton
                    id={v.id}
                    action={deleteYoutubeVideoAction}
                    label="Delete"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}