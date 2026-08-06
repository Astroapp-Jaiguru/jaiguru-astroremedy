import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LegalForm } from "@/components/admin/legal/legal-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditLegalPage({ params }: Props) {
  const { id } = await params;
  const page = await prisma.legalPage.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/legal-pages"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to legal pages
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">Edit Legal Page</h1>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <LegalForm
          page={{
            id: page.id,
            title: page.title,
            slug: page.slug,
            content: page.content,
            seoTitle: page.seoTitle ?? "",
            seoDescription: page.seoDescription ?? "",
            isActive: page.isActive,
            sortOrder: page.sortOrder.toString(),
          }}
        />
      </div>
    </div>
  );
}