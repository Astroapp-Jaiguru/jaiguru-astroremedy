import Link from "next/link";
import { Plus, Star } from "lucide-react";
import Image from "next/image";
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
import { deleteTestimonialAction } from "@/lib/admin/testimonials/actions";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ isApproved: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Testimonials</h1>
          <p className="text-sm text-muted-foreground">
            {testimonials.length} testimonial
            {testimonials.length === 1 ? "" : "s"} · unapproved ones are hidden
            from the public site
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonials/new">
            <Plus /> New Testimonial
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No testimonials yet.
                </TableCell>
              </TableRow>
            ) : (
              testimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {t.photoUrl ? (
                        <Image
                          src={t.photoUrl}
                          alt={t.customerName}
                          width={36}
                          height={36}
                          unoptimized={t.photoUrl.startsWith("http")}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {t.customerName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-medium">{t.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.location ?? "No location"}
                          {t.serviceRef ? ` · ${t.serviceRef}` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />
                      <span className="text-sm font-medium">{t.rating}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">
                      {t.text}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.isApproved ? "default" : "outline"}>
                      {t.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {t.isFeatured ? (
                      <Badge variant="secondary">Featured</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/testimonials/${t.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteButton
                        id={t.id}
                        action={deleteTestimonialAction}
                        label="Delete"
                      />
                    </div>
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