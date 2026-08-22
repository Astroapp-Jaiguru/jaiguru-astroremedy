import Link from "next/link";
import { CameraIcon, ClapperboardIcon } from "lucide-react";
import Image from "next/image";
import { YoutubeIcon } from "@/components/layout/social-icons";
import { SectionHeading } from "@/components/sections/section-heading";
import { getGalleryCounts } from "@/lib/shop-data";
import {
  getGallerySections,
  getHomeGalleryPreviews,
} from "@/lib/gallery-data";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

/**
 * Homepage gallery band (scope §7.8).
 * Shows YouTube / Photo / Video gallery tiles. Visibility of each tile is
 * controlled from Admin → Homepage (Show YouTube / Photo / Video Gallery).
 * Disabled tiles disappear and the remaining tiles automatically expand
 * (2 tiles fill two columns, 1 tile centers large) so the section always
 * stays balanced.
 */
export async function GalleryHome(): Promise<ReactElement> {
  const [counts, previews, sections] = await Promise.all([
    getGalleryCounts(),
    getHomeGalleryPreviews(),
    getGallerySections(),
  ]);

  const tiles = [
    {
      key: "youtube" as const,
      title: "YouTube Gallery",
      description:
        "Astrology, vastu, gemstone and remedy videos by Jai Guru.",
      href: "/youtube-gallery",
      icon: YoutubeIcon,
      count: counts.youtube,
      previews: previews.youtube.map((v) => ({
        id: v.id,
        src: v.thumbnailUrl ?? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
        alt: v.title,
      })),
      accent: "text-[#FF0000]",
      visible: sections.youtube,
    },
    {
      key: "photo" as const,
      title: "Photo Gallery",
      description: "Moments from poojas, courses, remedies and the chamber.",
      href: "/photo-gallery",
      icon: CameraIcon,
      count: counts.photo,
      previews: previews.photos.map((p) => ({
        id: p.id,
        src: p.imageUrl,
        alt: p.altText ?? p.title ?? "Gallery photo",
      })),
      accent: "text-golden",
      visible: sections.photo,
    },
    {
      key: "video" as const,
      title: "Video Gallery",
      description: "Live sessions, pujas, testimonials and special moments.",
      href: "/video-gallery",
      icon: ClapperboardIcon,
      count: counts.video,
      previews: [],
      accent: "text-royal-purple",
      visible: sections.video,
    },
  ].filter((t) => t.visible);

  if (tiles.length === 0) return <></>;

  const count = tiles.length;
  const gridCols =
    count === 3
      ? "md:grid-cols-3"
      : count === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-1";
  const bandWidth =
    count === 3 ? "max-w-7xl" : count === 2 ? "max-w-4xl" : "max-w-xl";

  return (
    <section
      id="gallery"
      aria-label="Media gallery"
      className="scroll-mt-24 py-20"
    >
      <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", bandWidth)}>
        <Reveal>
          <SectionHeading
            eyebrow="Media & Moments"
            title="Explore Our"
            highlight="Gallery"
            subtitle="Live streams, photos and videos from poojas, courses, sessions and remedies performed at the chamber."
          />
        </Reveal>
        <RevealGroup
          className={cn("grid grid-cols-1 gap-6", gridCols)}
        >
          {tiles.map((tile) => {
            const Icon = tile.icon;
            const filled = tile.count > 0;
            return (
              <RevealItem key={tile.title}>
              <Link
                key={tile.title}
                href={tile.href}
                className={`group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[var(--jaiguru-card-radius)] border-2 p-8 text-center transition duration-300 hover:-translate-y-1 ${
                  filled
                    ? "glass-card border-premium-gold/60"
                    : "border-dashed border-premium-gold/30 bg-white/5 backdrop-blur"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.15),transparent_60%)]" />

                {filled && tile.previews.length > 0 ? (
                  <div className="pointer-events-none grid w-full grid-cols-2 gap-2">
                    {tile.previews.map((p, i) => (
                      <div
                        key={p.id}
                        className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-premium-gold/30 ${
                          i === 0 ? "col-span-2 aspect-[2/1]" : ""
                        }`}
                      >
                        <Image
                          src={p.src}
                          alt={p.alt}
                          fill
                          sizes="(max-width: 768px) 50vw, 250px"
                          unoptimized={p.src.startsWith("http")}
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        {tile.title === "YouTube Gallery" && i === 0 ? (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000]/90 shadow-lg">
                              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-premium-gold/40 bg-white/5 ${tile.accent}`}
                  >
                    <Icon className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                )}

                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    {tile.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {filled
                      ? `${tile.count} media item${
                          tile.count === 1 ? "" : "s"
                        } available`
                      : tile.description}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                    filled ? "text-golden" : "text-slate-500"
                  }`}
                >
                  {filled ? "View Gallery" : "Coming Soon"}
                </span>
              </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}