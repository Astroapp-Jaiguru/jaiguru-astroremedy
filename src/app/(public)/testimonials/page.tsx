import type { Metadata } from "next";
import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
 title: "Testimonials | JAIGURU ASTROREMEDY",
 description:
 "Real experiences from clients of Vedic Astrologer Arup Shastri (Jai Guru) — astrology, numerology, vastu, yoga and spiritual remedy guidance in Kolkata.",
};

export default async function TestimonialsPage() {
 const testimonials = await prisma.testimonial.findMany({
 where: { isApproved: true },
 orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
 });

 return (
 <section className="scroll-mt-24 py-16 sm:py-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <SectionHeading
 eyebrow="Client Love"
 title="What Our"
 highlight="Clients Say"
 subtitle="Real experiences from people whose lives changed with Jai Guru's guidance."
 />

 {testimonials.length === 0 ? (
 <div className="mt-10 rounded-3xl border border-dashed border-[#D4AF37]/30 bg-[#0F172A]/40 p-16 text-center text-slate-400">
 Testimonials will appear here soon.
 </div>
 ) : (
 <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
 {testimonials.map((t) => (
 <figure
 key={t.id}
 className="relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6 glass-card transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60"
 >
 <Quote className="absolute right-5 top-5 h-10 w-10 text-[#FACC15]/10" />
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
 width={44}
 height={44}
 unoptimized={t.photoUrl.startsWith("http")}
 className="h-11 w-11 rounded-full object-cover"
 />
 ) : (
 <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FACC15] to-[#F97316] font-display text-base font-bold text-slate-900">
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
 ))}
 </div>
 )}
 </div>
 </section>
 );
}