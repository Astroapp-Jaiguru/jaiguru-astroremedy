"use client";

import { useState } from "react";
import Image from "next/image";
import { MediaModal } from "@/components/gallery/media-modal";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { YoutubeData } from "@/lib/gallery-data";

/**
 * YouTube gallery (Phase 6, scope §7.8).
 * Card grid with thumbnail + red play button; clicking opens an inline modal
 * with the YouTube embed player.
 */
export function YoutubeGalleryClient({
  videos,
}: {
  videos: YoutubeData[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = videos.find((v) => v.id === activeId) ?? null;

  const thumbFor = (v: YoutubeData) =>
    v.thumbnailUrl ?? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;

  return (
    <>
      <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <RevealItem key={v.id}>
          <article
            className="group relative flex h-full flex-col overflow-hidden rounded-[var(--jaiguru-card-radius)] glass-frost-dark transition-all duration-300 hover:-translate-y-1.5 hover:border-golden/80 hover:shadow-[0_18px_50px_rgba(250,204,21,0.25)]"
          >
            <button
              type="button"
              onClick={() => setActiveId(v.id)}
              aria-label={`Play ${v.title}`}
              className="relative aspect-video w-full overflow-hidden"
            >
              <Image
                src={thumbFor(v)}
                alt={v.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized={thumbFor(v).startsWith("http")}
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/10">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF0000] shadow-lg shadow-[#FF0000]/50 transition group-hover:scale-110 group-hover:shadow-[#FF0000]/70">
                  <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>
            <div className="flex flex-1 flex-col gap-1.5 p-5">
              <h3 className="font-display text-lg font-bold text-white">
                {v.title}
              </h3>
              {v.description ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-300">
                  {v.description}
                </p>
              ) : null}
              {v.category ? (
                <p className="mt-auto pt-2 text-xs font-semibold uppercase tracking-wider text-golden">
                  {v.category}
                </p>
              ) : null}
            </div>
          </article>
          </RevealItem>
        ))}
      </RevealGroup>

      <MediaModal open={active !== null} onClose={() => setActiveId(null)}>
        {active ? (
          <div>
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                key={active.id}
                src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <p className="mt-3 text-center font-display text-lg font-bold text-white">
              {active.title}
            </p>
          </div>
        ) : null}
      </MediaModal>
    </>
  );
}