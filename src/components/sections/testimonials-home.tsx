import Link from "next/link";
import { SectionHeading } from "@/components/sections/section-heading";
import { TestimonialCarousel } from "@/components/sections/testimonial-carousel";
import { getTestimonials } from "@/lib/shop-data";
import type { ReactElement } from "react";

/**
 * Homepage testimonials (scope §7.8). Auto-rotating carousel of
 * approved/featured testimonials with gold rating stars.
 */
export async function TestimonialsHome(): Promise<ReactElement> {
  const testimonials = await getTestimonials(9);
  if (testimonials.length === 0) return <></>;

  return (
    <section
      id="testimonials"
      aria-label="Client testimonials"
      className="scroll-mt-24 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Client Love"
          title="What Our"
          highlight="Clients Say"
          subtitle="Real experiences from people whose lives changed with Jai Guru's guidance."
        />
        <div className="mt-10">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#D4AF37] px-8 py-3 text-sm font-semibold text-[#FACC15] transition hover:bg-[#FACC15] hover:text-slate-900"
          >
            Read All Reviews
          </Link>
        </div>
      </div>
    </section>
  );
}