"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { PhotoLightbox } from "@/components/gallery/photo-lightbox";
import type { PhotoData } from "@/lib/gallery-data";

/**
 * Photo gallery grid (Phase 6, scope §7.8).
 * Responsive masonry-style grid; clicking a photo opens the lightbox.
 */
export function PhotoGalleryClient({ photos }: { photos: PhotoData[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`View ${p.title ?? "photo"}`}
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl glass-card p-0 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60"
          >
            <Image
              src={p.imageUrl}
              alt={p.altText ?? p.title ?? "Gallery photo"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized={p.imageUrl.startsWith("http")}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
              <span className="w-full p-4 text-left">
                {p.title ? (
                  <span className="block truncate font-display text-sm font-bold text-white">
                    {p.title}
                  </span>
                ) : null}
                {p.category ? (
                  <span className="text-[11px] uppercase tracking-wider text-[#FACC15]">
                    {p.category}
                  </span>
                ) : null}
              </span>
            </span>
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}