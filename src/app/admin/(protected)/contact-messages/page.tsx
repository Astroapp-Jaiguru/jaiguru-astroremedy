import Link from "next/link";
import { Eye } from "lucide-react";
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
import { DeleteButton } from "@/components/admin/delete-button";
import { ReadToggleButton } from "@/components/admin/contact/read-toggle-button";
import { deleteContactMessageAction } from "@/lib/admin/contact/actions";
import {
  REQUEST_STATUS_LABELS,
  type RequestStatus,
} from "@/lib/admin/contact/status";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminContactMessagesInboxPage() {
  await requireAdmin();
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = messages.filter((m) => m.status === "NEW").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length === 1 ? "" : "s"} · {unreadCount} unread ·
          submitted from the public contact page
        </p>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone / WhatsApp</TableHead>
              <TableHead>Service Interest</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Read</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No messages yet. Messages submitted from the contact page
                  will appear here.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((m) => {
                const status = m.status as RequestStatus;
                const read = status !== "NEW";
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p
                        className={`text-sm ${
                          read ? "font-medium" : "font-semibold"
                        }`}
                      >
                        {m.name}
                      </p>
                      {!read ? (
                        <span className="inline-flex rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
                          New
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{m.phone}</p>
                      {m.whatsappNumber && m.whatsappNumber !== m.phone ? (
                        <p className="text-xs text-muted-foreground">
                          WA: {m.whatsappNumber}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {m.serviceInterest ? (
                        <span className="text-sm">{m.serviceInterest}</span>
                      ) : (
                        <span className="text-muted-foreground">General</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
                        {m.message ?? "-"}
                      </p>
                      {m.preferredDate || m.preferredTime ? (
                        <p className="text-xs text-muted-foreground">
                          {m.preferredDate ?? "-"} · {m.preferredTime ?? "-"}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          read
                            ? "border-slate-500/30 bg-slate-500/10 text-slate-500 dark:text-slate-300"
                            : "border-sky-500/30 bg-sky-500/15 text-sky-600 dark:text-sky-300"
                        }`}
                      >
                        {read ? "Read" : "Unread"}
                      </span>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {REQUEST_STATUS_LABELS[status]}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ReadToggleButton id={m.id} read={read} />
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/contact/${m.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                        <DeleteButton
                          id={m.id}
                          action={deleteContactMessageAction}
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