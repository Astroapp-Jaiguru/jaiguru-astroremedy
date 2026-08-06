import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TestimonialForm } from "@/components/admin/testimonials/testimonial-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditTestimonialPage({ params }: Props) {
  const { id } = await params;
  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (!t) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to testimonials
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">Edit Testimonial</h1>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <TestimonialForm
          testimonial={{
            id: t.id,
            customerName: t.customerName,
            photoUrl: t.photoUrl ?? "",
            rating: t.rating.toString(),
            text: t.text,
            serviceRef: t.serviceRef ?? "",
            location: t.location ?? "",
            isApproved: t.isApproved,
            isFeatured: t.isFeatured,
            sortOrder: t.sortOrder.toString(),
          }}
        />
      </div>
    </div>
  );
}