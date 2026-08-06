import type { Metadata } from "next";
import { SectionHeading } from "@/components/sections/section-heading";
import { YoutubeGalleryClient } from "@/components/gallery/youtube-gallery-client";
import { getYoutubeVideos } from "@/lib/gallery-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "YouTube Gallery | JAIGURU ASTROREMEDY",
  description:
    "Astrology, vastu, gemstone and remedy videos by Vedic Astrologer Arup Shastri (Jai Guru), Kolkata.",
};

export default async function YoutubeGalleryPage() {
  const videos = await getYoutubeVideos();

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
          <div className="mt-10 rounded-3xl border border-dashed border-[#D4AF37]/30 bg-[#0F172A]/40 p-16 text-center text-slate-400">
            Videos will be uploaded soon. Please check back.
          </div>
        ) : (
          <YoutubeGalleryClient videos={videos} />
        )}
      </div>
    </section>
  );
}