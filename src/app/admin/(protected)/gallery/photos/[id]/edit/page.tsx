import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PhotoForm } from "@/components/admin/gallery/photo-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPhotoPage({ params }: Props) {
  const { id } = await params;
  const photo = await prisma.galleryImage.findUnique({ where: { id } });
  if (!photo) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/gallery/photos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to gallery
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">Edit Photo</h1>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <PhotoForm
          photo={{
            id: photo.id,
            title: photo.title ?? "",
            description: photo.description ?? "",
            imageUrl: photo.imageUrl,
            altText: photo.altText ?? "",
            category: photo.category ?? "",
            isFeatured: photo.isFeatured,
            isActive: photo.isActive,
            sortOrder: photo.sortOrder.toString(),
          }}
        />
      </div>
    </div>
  );
}
