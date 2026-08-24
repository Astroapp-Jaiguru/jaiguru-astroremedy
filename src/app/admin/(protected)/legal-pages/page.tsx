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
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteLegalPageAction } from "@/lib/admin/legal/actions";

export const dynamic = "force-dynamic";

export default async function AdminLegalPagesPage() {
  const pages = await prisma.legalPage.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Legal Pages</h1>
          <p className="text-sm text-muted-foreground">
            {pages.length} page{pages.length === 1 ? "" : "s"} · footer links and
            /legal/[slug] pages
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/legal-pages/new">
            <Plus /> New Page
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No legal pages yet.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-medium">{p.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    /legal/{p.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "default" : "destructive"}>
                      {p.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/legal-pages/${p.id}/edit`}>Edit</Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/legal/${p.slug}`} target="_blank">
                          View
                        </Link>
                      </Button>
                      <DeleteButton id={p.id} action={deleteLegalPageAction} label="Delete" />
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