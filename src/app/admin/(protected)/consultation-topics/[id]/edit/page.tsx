import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ConsultationTopicForm } from "@/components/admin/consultation-topics/consultation-topic-form";

export const dynamic = "force-dynamic";

export default async function AdminEditConsultationTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topic = await prisma.consultationTopic.findUnique({ where: { id } });
  if (!topic) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/consultation-topics"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to consultation topics
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold">Edit Topic</h1>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <ConsultationTopicForm
          topic={{
            id: topic.id,
            slug: topic.slug,
            title: topic.title,
            description: topic.description,
            longDescription: topic.longDescription,
            iconKey: topic.iconKey,
            fee: topic.fee,
            homeFee: topic.homeFee,
            durationMinutes: String(topic.durationMinutes),
            keywords: topic.keywords.join("\n"),
            benefits: topic.benefits.join("\n"),
            isActive: topic.isActive,
            sortOrder: String(topic.sortOrder),
          }}
        />
      </div>
    </div>
  );
}