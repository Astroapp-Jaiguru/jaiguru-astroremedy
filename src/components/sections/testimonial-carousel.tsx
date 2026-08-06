"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestimonialData } from "@/lib/shop-data";

/**
 * Homepage testimonial carousel (Phase 6, scope §7.8).
 * Auto-advancing slideshow with prev/next arrows and dots. Pauses on hover.
 */
export function TestimonialCarousel({
  testimonials,
}: {
  testimonials: TestimonialData[];
}) {
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(3);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const measure = () => {
      if (window.innerWidth < 768) setPerView(1);
      else if (window.innerWidth < 1024) setPerView(2);
      else setPerView(3);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const pages = Math.max(1, Math.ceil(testimonials.length / perView));
  const current = Math.min(page, pages - 1);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const tick = useCallback(() => {
    setPage((p) => {
      const pages = Math.max(1, Math.ceil(testimonials.length / perView));
      return p >= pages - 1 ? 0 : p + 1;
    });
  }, [testimonials.length, perView]);

  useEffect(() => {
    stop();
    timer.current = setInterval(tick, 6000);
    return stop;
  }, [perView, testimonials.length, tick, stop]);

  if (testimonials.length === 0) return null;

  const width = 100 / perView;

  return (
    <div
      className="relative"
      onMouseEnter={stop}
      onMouseLeave={() => {
        timer.current = setInterval(tick, 6000);
      }}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * width}%)` }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="shrink-0 px-2.5 py-1"
              style={{ width: `${width}%` }}
            >
              <figure className="flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#1E1B4B]/80 to-[#0F172A]/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:-translate-y-1 hover:border-[#D4AF37]/60">
                <Quote className="h-8 w-8 text-[#FACC15]/15" />
                <div
                  className="flex items-center gap-1"
                  aria-label={`${t.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < t.rating
                          ? "fill-[#FACC15] text-[#FACC15]"
                          : "fill-slate-700 text-slate-700"
                      )}
                    />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-300">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-white/10 pt-4">
                  {t.photoUrl ? (
                    <Image
                      src={t.photoUrl}
                      alt={t.customerName}
                      width={40}
                      height={40}
                      unoptimized={t.photoUrl.startsWith("http")}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FACC15] to-[#F97316] font-display text-base font-bold text-slate-900">
                      {t.customerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                      {t.customerName}
                    </div>
                    <div className="truncate text-xs text-slate-400">
                      {t.location ?? "Verified Client"}{" "}
                      {t.serviceRef ? `· ${t.serviceRef}` : ""}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>

      {pages > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setPage((p) => (p <= 0 ? pages - 1 : p - 1))}
            aria-label="Previous testimonials"
            className="absolute -left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#0F172A]/90 text-white transition hover:bg-[#FACC15] hover:text-slate-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => (p >= pages - 1 ? 0 : p + 1))}
            aria-label="Next testimonials"
            className="absolute -right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#0F172A]/90 text-white transition hover:bg-[#FACC15] hover:text-slate-900"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to testimonial page ${i + 1}`}
                onClick={() => setPage(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === current ? "w-7 bg-[#FACC15]" : "w-2.5 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}