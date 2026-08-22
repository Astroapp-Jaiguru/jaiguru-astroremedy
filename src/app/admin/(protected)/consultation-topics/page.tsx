import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteConsultationTopicAction } from "@/lib/admin/consultation-topics/actions";
import { TOPIC_ICONS } from "@/lib/consultation-topics-data";

export const dynamic = "force-dynamic";

export default async function AdminConsultationTopicsPage() {
  const topics = await prisma.consultationTopic.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Consultation Topics</h1>
          <p className="text-sm text-muted-foreground">
            {topics.length} topic{topics.length === 1 ? "" : "s"} · drives the
            homepage cards, /consultations pages and the header dropdown
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/consultation-topics/new">
            <Plus /> New Topic
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Home Fee</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No topics yet — the site falls back to the default 9 topics.
                </TableCell>
              </TableRow>
            ) : (
              topics.map((t) => {
                const Icon = TOPIC_ICONS[t.iconKey] ?? Star;
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">{t.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {t.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">{t.fee}</TableCell>
                    <TableCell className="text-sm">{t.homeFee}</TableCell>
                    <TableCell className="text-sm">
                      {t.durationMinutes} min
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.isActive ? "default" : "outline"}>
                        {t.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/consultation-topics/${t.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <DeleteButton
                          id={t.id}
                          action={deleteConsultationTopicAction}
                          label="Delete"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}