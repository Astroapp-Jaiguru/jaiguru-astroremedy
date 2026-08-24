import Link from "next/link";
import { Plus } from "lucide-react";
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
import { formatPrice } from "@/lib/shop-data";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteServiceAction } from "@/lib/admin/services/actions";

export const dynamic = "force-dynamic";

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HOME_SERVICE: "Home Service",
};

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    include: { category: { select: { name: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">
            {services.length} services · courses & packages
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus /> New Service
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No services yet. Create your first service.
                </TableCell>
              </TableRow>
            ) : (
              services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.slug}</p>
                  </TableCell>
                  <TableCell className="text-sm">{s.category?.name ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{MODE_LABELS[s.mode] ?? s.mode}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{s.duration ?? "-"}</TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">
                      {s.priceLabel ?? (s.price ? formatPrice(s.price) : "-")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {s.isFeatured ? <Badge variant="secondary">Featured</Badge> : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ? "default" : "destructive"}>
                      {s.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/services/${s.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteButton id={s.id} action={deleteServiceAction} label="Delete" />
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