import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminSubscribersPage() {
  await requireAdmin();
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Subscribers</h1>
          <p className="text-sm text-muted-foreground">
            {subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"} ·
            collected from the newsletter form in the footer
          </p>
        </div>
        <Button asChild variant="outline" disabled={subscribers.length === 0}>
          <Link href="/admin/subscribers/export">
            <Download className="mr-1 h-4 w-4" />
            Export CSV
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  <Mail className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No subscribers yet. The newsletter form in the footer is
                  active, so signups will appear here.
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm font-medium">{s.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.source}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        s.isActive
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                          : "border-slate-500/30 bg-slate-500/10 text-slate-500 dark:text-slate-300"
                      }`}
                    >
                      {s.isActive ? "Active" : "Unsubscribed"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(s.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}