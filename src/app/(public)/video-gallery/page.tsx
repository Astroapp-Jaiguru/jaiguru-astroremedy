import type { Metadata } from "next";
import { SectionHeading } from "@/components/sections/section-heading";
import { VideoGalleryClient } from "@/components/gallery/video-gallery-client";
import { getGalleryVideos } from "@/lib/gallery-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Gallery | JAIGURU ASTROREMEDY",
  description:
    "Live sessions, poojas, testimonials and special moments from the chamber of Vedic Astrologer Arup Shastri (Jai Guru), Kolkata.",
};

export default async function VideoGalleryPage() {
  const videos = await getGalleryVideos();

  return (
    <section className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Live & Recorded"
          title="Video"
          highlight="Gallery"
          subtitle="Live sessions, poojas, testimonials and special moments."
        />

        {videos.length === 0 ? (
          <div className="mt-10 rounded-[var(--jaiguru-card-radius)] border border-dashed border-premium-gold/30 bg-deep-navy/40 p-16 text-center text-slate-400">
            Videos will be uploaded soon. Please check back.
          </div>
        ) : (
          <VideoGalleryClient videos={videos} />
        )}
      </div>
    </section>
  );
}