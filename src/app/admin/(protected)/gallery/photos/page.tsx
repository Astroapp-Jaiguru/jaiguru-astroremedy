import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteGalleryImageAction } from "@/lib/admin/gallery/actions";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const photos = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Photo Gallery</h1>
          <p className="text-sm text-muted-foreground">
            {photos.length} photo{photos.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/photos/new">
            <Plus /> Add Photo
          </Link>
        </Button>
      </div>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-12 text-center text-muted-foreground">
          No photos yet. Add your first photo.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl border bg-background"
            >
              <div className="relative aspect-[3/2] w-full bg-muted">
                <Image
                  src={p.imageUrl}
                  alt={p.altText ?? p.title ?? "Gallery photo"}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  unoptimized={p.imageUrl.startsWith("http")}
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium">
                    {p.title ?? "Untitled"}
                  </p>
                  <Badge variant={p.isActive ? "default" : "destructive"}>
                    {p.isActive ? "Live" : "Hidden"}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {p.description ?? p.altText ?? p.category ?? "No description"}
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/gallery/photos/${p.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton
                    id={p.id}
                    action={deleteGalleryImageAction}
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
