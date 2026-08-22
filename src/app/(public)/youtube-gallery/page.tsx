import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/sections/section-heading";
import { YoutubeGalleryClient } from "@/components/gallery/youtube-gallery-client";
import { getYoutubeVideos, getGallerySections } from "@/lib/gallery-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "YouTube Gallery | JAIGURU ASTROREMEDY",
  description:
    "Astrology, vastu, gemstone and remedy videos by Vedic Astrologer Arup Shastri (Jai Guru), Kolkata.",
};

export default async function YoutubeGalleryPage() {
  const [videos, sections] = await Promise.all([
    getYoutubeVideos(),
    getGallerySections(),
  ]);
  if (!sections.youtube) notFound();

  return (
    <section className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Learn & Watch"
          title="YouTube"
          highlight="Gallery"
          subtitle="Astrology, vastu, gemstone and remedy videos by Jai Guru."
        />

        {videos.length === 0 ? (
          <div className="mt-10 rounded-[var(--jaiguru-card-radius)] border border-dashed border-premium-gold/30 bg-deep-navy/40 p-16 text-center text-slate-400">
            Videos will be uploaded soon. Please check back.
          </div>
        ) : (
          <YoutubeGalleryClient videos={videos} />
        )}
      </div>
    </section>
  );
}