import Link from "next/link";
import { Phone, CalendarClock, MessageSquareText } from "lucide-react";
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
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteContactMessageAction } from "@/lib/admin/contact/actions";
import {
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
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

export default async function AdminContactMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const openCount = messages.filter(
    (m) => m.status === "NEW" || m.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length === 1 ? "" : "s"} ·{" "}
          {openCount} open (new / in progress) · submitted from the public
          contact page
        </p>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone / WhatsApp</TableHead>
              <TableHead>Interested In</TableHead>
              <TableHead>Preferred Date & Time</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No messages yet. Messages submitted from the contact page
                  will appear here.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((m) => {                const status = m.status as RequestStatus;
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{m.name}</p>
                      {m.whatsappNumber && m.whatsappNumber !== m.phone ? (
                        <p className="text-xs text-muted-foreground">
                          WhatsApp: {m.whatsappNumber}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {m.phone}
                      </span>
                    </TableCell>
                    <TableCell>
                      {m.serviceInterest ? (
                        <span className="text-sm">{m.serviceInterest}</span>
                      ) : (
                        <span className="text-muted-foreground">General</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {m.preferredDate || m.preferredTime ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {m.preferredDate ?? "-"} · {m.preferredTime ?? "-"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
                        {m.message ?? "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${REQUEST_STATUS_COLORS[status]}`}
                      >
                        {REQUEST_STATUS_LABELS[status]}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/contact/${m.id}`}>
                            <MessageSquareText className="h-3.5 w-3.5" />
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
