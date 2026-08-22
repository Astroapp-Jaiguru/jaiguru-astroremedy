import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  CalendarClock,
  MessageSquareText,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/delete-button";
import { MessageStatusForm } from "@/components/admin/contact/status-form";
import { prisma } from "@/lib/prisma";
import { deleteContactMessageAction } from "@/lib/admin/contact/actions";
import { WA_BASE } from "@/config/site";
import {
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  type RequestStatus,
} from "@/lib/admin/contact/status";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminContactMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) notFound();

  const status = message.status as RequestStatus;
  const whatsappDigits = (message.whatsappNumber ?? message.phone).replace(
    /\D/g,
    ""
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/admin/contact">
              <ArrowLeft className="h-4 w-4" /> Back to Messages
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold">{message.name}</h1>
          <p className="text-sm text-muted-foreground">
            Received {formatDate(message.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${REQUEST_STATUS_COLORS[status]}`}
          >
            {REQUEST_STATUS_LABELS[status]}
          </span>
          <DeleteButton id={message.id} action={deleteContactMessageAction} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Message Details</CardTitle>
            <CardDescription>
              Information submitted through the public contact form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 border-b pb-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <UserRound className="h-4 w-4" /> Name
                </dt>
                <dd className="font-semibold">{message.name}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b pb-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> Phone
                </dt>
                <dd className="font-semibold">{message.phone}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b pb-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> WhatsApp
                </dt>
                <dd className="font-semibold">{message.whatsappNumber ?? "-"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b pb-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquareText className="h-4 w-4" /> Interested In
                </dt>
                <dd className="font-semibold">
                  {message.serviceInterest ?? "General Enquiry"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b pb-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="h-4 w-4" /> Preferred Date & Time
                </dt>
                <dd className="font-semibold">
                  {message.preferredDate ?? "-"} · {message.preferredTime ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="mb-1.5 flex items-center gap-2 text-muted-foreground">
                  <MessageSquareText className="h-4 w-4" /> Message
                </dt>
                <dd className="whitespace-pre-wrap rounded-lg bg-muted p-4 leading-relaxed">
                  {message.message ?? "No message provided."}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
              <CardDescription>
                Track how this enquiry is being handled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageStatusForm id={message.id} status={message.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Respond</CardTitle>
              <CardDescription>
                Reply directly to this customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a
                  href={`tel:${message.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
              </Button>
              <Button asChild>
                <a
                  href={`${WA_BASE(whatsappDigits)}?text=${encodeURIComponent(
                    `Hello ${message.name}, this is JAIGURU ASTROREMEDY. We received your enquiry on our website and would like to help you.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowUpRight className="h-4 w-4" /> WhatsApp Reply
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
