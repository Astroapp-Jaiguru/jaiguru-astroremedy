import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConsultationTopicForm } from "@/components/admin/consultation-topics/consultation-topic-form";

export const dynamic = "force-dynamic";

export default function AdminNewConsultationTopicPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/consultation-topics"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to consultation topics
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">New Topic</h1>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <ConsultationTopicForm />
      </div>
    </div>
  );
}