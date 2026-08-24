"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PhotoData } from "@/lib/gallery-data";

/**
 * Photo lightbox (Phase 6, scope §7.8).
 * Full-screen modal with prev/next navigation, keyboard support and the
 * photo title / description as caption.
 */
export function PhotoLightbox({
  photos,
  index,
  onClose,
}: {
  photos: PhotoData[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const photo = photos[current];

  const go = useCallback(
    (dir: 1 | -1) => {
      setCurrent((c) => (c + dir + photos.length) % photos.length);
    },
    [photos.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, go]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          go(-1);
        }}
        aria-label="Previous photo"
        className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#FACC15] hover:text-slate-900 sm:left-6"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
        aria-label="Next photo"
        className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#FACC15] hover:text-slate-900 sm:right-6"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <figure
        className="max-h-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[80vh] w-auto">
          <Image
            src={photo.imageUrl}
            alt={photo.altText ?? photo.title ?? "Gallery photo"}
            width={1200}
            height={800}
            unoptimized={photo.imageUrl.startsWith("http")}
            className="mx-auto max-h-[80vh] w-auto rounded-2xl object-contain"
          />
        </div>
        {(photo.title || photo.description) && (
          <figcaption className="mt-4 text-center">
            {photo.title ? (
              <p className="font-display text-lg font-bold text-white">
                {photo.title}
              </p>
            ) : null}
            {photo.description ? (
              <p className="mt-1 text-sm text-slate-400">{photo.description}</p>
            ) : null}
          </figcaption>
        )}
      </figure>
    </div>
  );
}