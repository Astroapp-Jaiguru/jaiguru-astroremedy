import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { getLegalPageBySlug } from "@/lib/legal-data";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.seoTitle ?? `${page.title} | JAIGURU ASTROREMEDY`,
    description:
      page.seoDescription ?? `${page.title} of JAIGURU ASTROREMEDY.`,
  };
}

export default async function LegalPageDetail({ params }: Props) {
  const { slug } = await params;
  const page = await getLegalPageBySlug(slug);
  if (!page) notFound();

  return (
    <section className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="transition hover:text-[#FACC15]">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-200">{page.title}</span>
        </nav>

        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          {page.title}
        </h1>
        <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316]" />

        <div className="mt-6 rounded-3xl border border-[#D4AF37]/20 bg-[#0F172A]/50 p-6 sm:p-10">
          <Markdown content={page.content} />
        </div>

        <Link
          href="/contact"
          className="mt-10 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#FACC15]"
        >
          <ArrowLeft className="h-4 w-4" /> Questions? Contact us on WhatsApp
        </Link>
      </div>
    </section>
  );
}