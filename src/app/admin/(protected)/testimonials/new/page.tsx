import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestimonialForm } from "@/components/admin/testimonials/testimonial-form";

export const dynamic = "force-dynamic";

export default function AdminNewTestimonialPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to testimonials
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">New Testimonial</h1>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <TestimonialForm />
      </div>
    </div>
  );
}