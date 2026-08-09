import type { Metadata } from "next";
import {
 MapPin,
 Phone,
 Clock,
 Mail,
 IndianRupee,
 Navigation,
 Star,
} from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { ContactForm } from "@/components/contact/contact-form";
import {
 WhatsAppButton,
 CallButton,
} from "@/components/layout/cta-buttons";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { getSiteData } from "@/lib/site-data";
import { getServices } from "@/lib/services-data";
import { whatsappLink, telLink, siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
 title: "Contact Us | JAIGURU ASTROREMEDY",
 description:
 "Contact Vedic Astrologer Arup Shastri (Jai Guru) in Kolkata. Book a consultation on WhatsApp or call. Chamber at Sovabazar Metro Crossing, 51/A Jatindra Mohan Avenue, Kolkata - 700005.",
};

export default async function ContactPage() {
 const [data, services] = await Promise.all([getSiteData(), getServices()]);
 const contact = data.contact;

 const mapsQuery = encodeURIComponent(
 `${contact.address}, ${contact.landmark}`.trim()
 );
 const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
 const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

 const enquiryMessage = whatsappLink(
 [
 "Hello JAIGURU ASTROREMEDY,",
 "",
 "I want to book a consultation.",
 "",
 "My Name:",
 "My Date of Birth:",
 "My Place of Birth:",
 "Preferred Date & Time:",
 ].join("\n"),
 contact.whatsappNumber
 );

 const contactCards = [
 {
 icon: <WhatsappIcon className="h-5 w-5 shrink-0" />,
 label: "WhatsApp",
 value: contact.whatsappDisplay,
 href: whatsappLink("Hello JAIGURU ASTROREMEDY,", contact.whatsappNumber),
 external: true,
 },
 {
 icon: <Phone className="h-5 w-5 shrink-0" />,
 label: "Call",
 value: contact.callDisplay,
 href: telLink(contact.callNumber),
 external: false,
 },
 ...(contact.email
 ? [
 {
 icon: <Mail className="h-5 w-5 shrink-0" />,
 label: "Email",
 value: contact.email,
 href: `mailto:${contact.email}`,
 external: false,
 },
 ]
 : []),
 {
 icon: <Clock className="h-5 w-5 shrink-0" />,
 label: "Business Hours",
 value: contact.businessHours,
 href: null as string | null,
 external: false,
 },
 ];

 return (
 <>
 {/* Page banner */}
 <section className="relative overflow-hidden bg-hero-gradient py-16 sm:py-20">
 <div className="hero-stars absolute inset-0 opacity-50" aria-hidden="true" />
 <div className="hero-glow-gold absolute inset-0" aria-hidden="true" />
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <SectionHeading
 eyebrow="Contact Us"
 title="Get in"
 highlight="Touch"
 subtitle="Reach us for consultations, queries or guidance. We respond quickly on WhatsApp and phone."
 />
 </div>
 </section>

 {/* Quick contact cards */}
 <section className="py-12 sm:py-14">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {contactCards.map((card) => {
 const inner = (
 <>
 <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FACC15]/10 text-[#FACC15]">
 {card.icon}
 </span>
 <span>
 <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
 {card.label}
 </span>
 <span className="mt-1 block text-sm font-semibold text-white">
 {card.value}
 </span>
 </span>
 </>
 );
 return card.href ? (
 <a
 key={card.label}
 href={card.href}
 {...(card.external
 ? { target: "_blank", rel: "noopener noreferrer" }
 : {})}
 className="flex items-center gap-3 rounded-2xl p-5 glass-card transition-colors hover:border-[#FACC15]/60"
 >
 {inner}
 </a>
 ) : (
 <div
 key={card.label}
 className="flex items-center gap-3 rounded-2xl p-5 glass-card"
 >
 {inner}
 </div>
 );
 })}
 </div>
 </div>
 </section>

 {/* Form + chamber / map */}
 <section className="pb-16 sm:pb-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
 {/* Contact form */}
 <div className="rounded-3xl border border-[#D4AF37]/30 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--jaiguru-contact-surface)_80%,transparent),color-mix(in_srgb,#0F172A_80%,transparent))] p-6 glass-card sm:p-8">
 <h2 className="font-display text-2xl font-bold text-white">
 Send a Message
 </h2>
 <p className="mt-1.5 text-sm text-slate-400">
 Fill in the form and our team will get back to you shortly.
 </p>
 <div className="mt-6">
 <ContactForm
 serviceOptions={services.map((s) => s.name)}
 whatsappNumber={contact.whatsappNumber}
 />
 </div>
 </div>

 {/* Chamber + map */}
 <div className="space-y-6">
 <div className="rounded-3xl p-6 glass-card sm:p-8">
 <h3 className="font-display text-xl font-bold text-white">
 Visit Our Chamber
 </h3>
 <div className="mt-5 space-y-4 text-sm text-slate-300">
 <p className="flex items-start gap-3">
 <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
 <span>
 {contact.address}
 <br />
 <span className="font-semibold text-white">
 {contact.landmark}
 </span>
 </span>
 </p>
 <p className="text-xs text-slate-400">
 ASTRO GEMS is a registered MSME enterprise under the
 Government of India.
 </p>
 <p className="flex items-start gap-3">
 <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
 <span>{contact.businessHours}</span>
 </p>
 <p className="flex items-start gap-3">
 <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
 <span>
 Consultation Fee:{" "}
 <span className="font-semibold text-white">
 ₹{contact.consultationFee}
 </span>
 </span>
 </p>
 </div>
 <div className="mt-6 flex flex-wrap gap-3">
 <WhatsAppButton
 href={enquiryMessage}
 label="Book Consultation"
 />
 <CallButton
 href={telLink(contact.callNumber)}
 label="Call Now"
 />
 </div>
 </div>

 {/* Google map */}
 <div className="overflow-hidden rounded-3xl border border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
 <iframe
 src={mapsEmbedUrl}
 title={`Google Map - ${siteConfig.astrologer.name} Chamber, ${contact.address}`}
 className="h-[300px] w-full border-0 sm:h-[340px]"
 loading="lazy"
 allowFullScreen
 referrerPolicy="no-referrer-when-downgrade"
 />
 <a
 href={mapsDirectionsUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2 bg-gradient-to-b from-[#1E1B4B] to-[#0F172A] px-4 py-3 text-sm font-semibold text-[#FACC15] transition-colors hover:bg-[#1E1B4B]"
 >
 <Navigation className="h-4 w-4" />
 Get Directions
 </a>
 </div>

 <div
 className="flex items-center gap-3 rounded-2xl border-2 border-[var(--jaiguru-experience-border)] px-5 py-4 shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
 style={{ background: "var(--jaiguru-experience-bg)" }}
 >
 <Star className="h-5 w-5 shrink-0 text-[var(--jaiguru-experience-text)]" />
 <p className="text-sm font-bold text-[var(--jaiguru-experience-text)]">
 20+ Years of Vedic Experience — trusted guidance for your
 life&apos;s journey.
 </p>
 </div>
 </div>
 </div>
 </div>
 </section>
 </>
 );
}
