import type { Metadata } from "next";
import { SectionHeading } from "@/components/sections/section-heading";
import { PhotoGalleryClient } from "@/components/gallery/photo-gallery-client";
import { getGalleryPhotos } from "@/lib/gallery-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photo Gallery | JAIGURU ASTROREMEDY",
  description:
    "Moments from poojas, courses, remedies and the chamber of Vedic Astrologer Arup Shastri (Jai Guru), Kolkata.",
};

export default async function PhotoGalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <section className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Moments & Memories"
          title="Photo"
          highlight="Gallery"
          subtitle="Poojas, courses, remedies and special moments from the chamber."
        />

        {photos.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-[#D4AF37]/30 bg-[#0F172A]/40 p-16 text-center text-slate-400">
            Photos will be uploaded soon. Please check back.
          </div>
        ) : (
          <PhotoGalleryClient photos={photos} />
        )}
      </div>
    </section>
  );
}