import type { Metadata } from "next";
import { MapPin, Award, ShieldCheck, Building2, Gem, IndianRupee } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { CallButton } from "@/components/layout/cta-buttons";
import { WhatsappNavTrigger } from "@/components/layout/whatsapp-nav-trigger";
import { siteConfig, telLink } from "@/config/site";
import { getSiteData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
 title: "About Us | JAIGURU ASTROREMEDY",
 description:
 "Astrologer Arup Shastri (Jai Guru) is the founder of ASTRO GEMS, a registered enterprise located in Kolkata under the Kolkata Municipal Corporation. Vedic astrology, vastu, numerology, yoga and spiritual remedy guidance.",
};

export default async function AboutPage() {
  const data = await getSiteData();
  const contact = data.contact;
  const business = siteConfig.business;
  const astrologer = data.astrologer;

 return (
 <>
 {/* Hero / intro */}
 <section className="scroll-mt-24 py-16 sm:py-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <SectionHeading
 eyebrow="About Us"
 title="Meet Our"
 highlight="Founder"
 subtitle="The story behind ASTRO GEMS and the guidance of Vedic Astrologer Arup Shastri (Jai Guru)."
 />

 {/* Founder statement */}
 <div className="mx-auto mt-10 max-w-4xl rounded-[var(--jaiguru-card-radius)] p-8 text-center glass-card sm:p-12">
 <div className="flex flex-wrap items-center justify-center gap-3">
 <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#FACC15]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#FACC15]">
 <Gem className="h-3.5 w-3.5" /> ASTRO GEMS — Founder & Registered Enterprise
 </span>
<span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#FACC15]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#FACC15]">
  <Award className="h-3.5 w-3.5" /> {data.astrologer.yearsExperience} Years of Vedic Experience
  </span>
 </div>
 <p className="mt-6 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
 {business.foundedLine}
 </p>
 <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-300">
 <span className="inline-flex items-center gap-2">
 <Building2 className="h-4 w-4 text-[#FACC15]" />
 Business Owner: <strong className="text-white">{business.legalOwnerName}</strong>
 </span>
 <span className="inline-flex items-center gap-2">
 <ShieldCheck className="h-4 w-4 text-[#FACC15]" />
 {business.registeredLine}
 </span>
 </div>
 </div>

 {/* Story */}
 <div className="mx-auto mt-12 max-w-4xl">
 <div className="rounded-[var(--jaiguru-card-radius)] p-8 glass-card">
  <h2 data-typo="astrologer-name" className="font-display text-2xl font-bold text-white">
  {astrologer.name}
  </h2>
  <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-[#FACC15]">
  <span data-typo="astrologer-title">{astrologer.title}</span> · <span data-typo="astrologer-subtitle">{astrologer.subtitle}</span>
  </p>
<div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-300">
  {astrologer.bio ? (
  <p data-typo="astrologer-bio" className="rounded-xl border border-[#D4AF37]/25 bg-white/5 p-4 font-normal text-slate-200">
  {astrologer.bio}
  </p>
  ) : null}
  <p>
 Vedic Astrologer Arup Shastri (Jai Guru) is a spiritual master and true
 healer based in Kolkata, West Bengal. With deep knowledge of the ancient
 Vedic sciences, he has been guiding seekers on matters of astrology,
 numerology, vastu, yoga and spiritual remedies for many years.
 </p>
 <p>
 As the founder of {business.businessName}, he offers personalized
 consultations at his chamber at {contact.landmark} ({contact.address})
 as well as online consultations for clients worldwide. Every remedy,
 gemstone and ritual is suggested only after careful study of the
 individual&apos;s horoscope and personal situation.
 </p>
 <p>
 {business.businessName} is a registered enterprise under the{" "}
 {business.registrationBody}, and all products and services are provided
 under the ownership of {business.legalOwnerName}.
 </p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Areas of expertise */}
 <section className="py-10 sm:py-14">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <SectionHeading
 eyebrow="Expertise"
 title="Areas of"
 highlight="Expertise"
 />
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {astrologer.expertise.map((item) => (
 <div
 key={item}
 className="rounded-[var(--jaiguru-card-radius)] p-6 text-center glass-card"
 >
 <Award className="mx-auto h-8 w-8 text-[#FACC15]" />
 <p className="mt-3 font-display text-lg font-bold text-white">{item}</p>
 </div>
 ))}
 </div>
 <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
 {astrologer.specialties.map((item) => (
 <span
 key={item}
 className="rounded-full border border-[#D4AF37]/30 bg-[#FACC15]/10 px-4 py-1.5 text-xs font-medium text-[#FACC15]"
 >
 {item}
 </span>
 ))}
 </div>
 </div>
 </section>

 {/* Business registration & visit us */}
 <section className="py-10 sm:py-14">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="grid gap-6 md:grid-cols-2">
 <div className="rounded-[var(--jaiguru-card-radius)] p-8 glass-card">
 <h3 className="font-display text-xl font-bold text-white">
 Registered Business
 </h3>
 <dl className="mt-5 space-y-3 text-sm">
 <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
 <dt className="text-slate-400">Business Name</dt>
 <dd className="font-semibold text-white">{business.businessName}</dd>
 </div>
 <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
 <dt className="text-slate-400">Legal Owner</dt>
 <dd className="font-semibold text-white">{business.legalOwnerName}</dd>
 </div>
 <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
 <dt className="text-slate-400">Registered Under</dt>
 <dd className="text-right font-semibold text-white">
 {business.registrationBody}
 </dd>
 </div>
 <div className="flex items-start justify-between gap-4">
 <dt className="text-slate-400">Website</dt>
 <dd className="font-semibold text-[#FACC15]">
 {business.websiteName}
 </dd>
 </div>
 </dl>
 </div>

 <div className="rounded-[var(--jaiguru-card-radius)] p-8 glass-card">
 <h3 className="font-display text-xl font-bold text-white">Visit Our Chamber</h3>
 <div className="mt-5 space-y-4 text-sm text-slate-300">
 <p className="flex items-start gap-3">
 <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
 <span>
 {contact.address}
 <br />
 <span className="font-semibold text-white">{contact.landmark}</span>
 </span>
 </p>
 <p className="flex items-start gap-3">
 <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
 <span>
 Consultation Fee: <span className="font-semibold text-white">₹{contact.consultationFee}</span>
 </span>
 </p>
 </div>
 <div className="mt-6 flex flex-wrap gap-3">
<WhatsappNavTrigger
  whatsappNumber={contact.whatsappNumber}
  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-whatsapp px-6 py-3 text-sm font-bold text-white shadow-lg shadow-whatsapp/25 transition hover:bg-[var(--jaiguru-whatsapp-hover)]"
  >
  Book Consultation
  </WhatsappNavTrigger>
  <CallButton href={telLink(contact.callNumber)} label="Call Now" />
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Corporate / legal information */}
 <section className="py-10 sm:py-14">
 <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
 <SectionHeading
 eyebrow="Transparency"
 title="Corporate / Legal"
 highlight="Information"
 subtitle="Official registration details of ASTRO GEMS as a registered enterprise."
 />
 <div className="mx-auto mt-10 max-w-3xl rounded-[var(--jaiguru-card-radius)] p-8 glass-card">
 <dl className="divide-y divide-white/10">
 <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
 <dt className="text-sm text-slate-400">Registered Trade Name</dt>
 <dd className="font-semibold text-white">ASTRO GEMS</dd>
 </div>
 <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
 <dt className="text-sm text-slate-400">Legal Proprietor</dt>
 <dd className="font-semibold text-white">
 Arup Kar (Astrologer Arup Shastri)
 </dd>
 </div>
 <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
 <dt className="text-sm text-slate-400">Registered Office</dt>
 <dd className="font-semibold text-white">
 11/1 B, Amar Bose Sarani, Kolkata - 700007
 </dd>
 </div>
 <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
 <dt className="text-sm text-slate-400">MSME / Udyam Registration No.</dt>
 <dd className="font-semibold text-[#FACC15]">
 UDYAM-WB-10-0215773
 </dd>
 </div>
 <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
 <dt className="text-sm text-slate-400">KMC Trade License</dt>
 <dd className="inline-flex items-center gap-1.5 font-semibold text-[#25D366]">
 <ShieldCheck className="h-4 w-4" /> Active
 </dd>
 </div>
 </dl>
 <p className="mt-5 border-t border-[#D4AF37]/30 pt-4 text-xs leading-relaxed text-slate-400">
 ASTRO GEMS is a registered MSME enterprise under the Government of
 India. All products and services are provided under the legal
 ownership of Arup Kar.
 </p>
 </div>
 </div>
 </section>
 </>
 );
}
