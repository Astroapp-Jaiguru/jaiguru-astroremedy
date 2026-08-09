import Link from "next/link";
import { SectionHeading } from "@/components/sections/section-heading";
import { TestimonialCarousel } from "@/components/sections/testimonial-carousel";
import { getTestimonials } from "@/lib/shop-data";
import { Reveal } from "@/components/motion/reveal";
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
        <Reveal>
          <SectionHeading
            eyebrow="Client Love"
            title="What Our"
            highlight="Clients Say"
            subtitle="Real experiences from people whose lives changed with Jai Guru's guidance."
          />
        </Reveal>
        <Reveal className="mt-10">
          <TestimonialCarousel testimonials={testimonials} />
        </Reveal>
        <Reveal className="mt-10 flex justify-center">
          <Link
            href="/testimonials"
            className="btn-glow-gold inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/10 px-8 py-3 text-sm font-semibold text-[#FACC15] shadow-[0_8px_25px_rgba(212,175,55,0.25)] backdrop-blur transition hover:bg-[#FACC15] hover:text-slate-900"
          >
            Read All Reviews
          </Link>
        </Reveal>
      </div>
    </section>
  );
}