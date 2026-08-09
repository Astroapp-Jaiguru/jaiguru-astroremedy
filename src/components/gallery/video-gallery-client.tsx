"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { MediaModal } from "@/components/gallery/media-modal";
import type { VideoData } from "@/lib/gallery-data";

/**
 * Video gallery (Phase 6, scope §7.8).
 * Card grid with poster + play overlay; clicking opens an inline modal with
 * the <video> player.
 */
export function VideoGalleryClient({ videos }: { videos: VideoData[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = videos.find((v) => v.id === activeId) ?? null;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <article
            key={v.id}
            className="group relative flex flex-col overflow-hidden rounded-3xl glass-card transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60"
          >
            <button
              type="button"
              onClick={() => setActiveId(v.id)}
              aria-label={`Play ${v.title}`}
              className="relative aspect-video w-full overflow-hidden"
            >
              {v.thumbnailUrl ? (
                <Image
                  src={v.thumbnailUrl}
                  alt={v.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  unoptimized={v.thumbnailUrl.startsWith("http")}
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#312E81] via-[#4C1D95] to-[#0F172A]" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/10">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/40 transition group-hover:scale-110">
                  <Play className="ml-1 h-6 w-6 fill-white text-white" />
                </span>
              </span>
            </button>
            <div className="flex flex-1 flex-col gap-1.5 p-5">
              <h3 className="font-display text-lg font-bold text-white">
                {v.title}
              </h3>
              {v.description ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
                  {v.description}
                </p>
              ) : null}
              {v.category ? (
                <p className="mt-auto pt-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  {v.category}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <MediaModal
        open={active !== null}
        onClose={() => setActiveId(null)}
      >
        {active ? (
          <div>
            <video
              key={active.id}
              src={active.videoUrl}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full rounded-2xl bg-black"
            />
            <p className="mt-3 text-center font-display text-lg font-bold text-white">
              {active.title}
            </p>
          </div>
        ) : null}
      </MediaModal>
    </>
  );
}