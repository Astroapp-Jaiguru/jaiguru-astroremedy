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
import { deleteVideoAction } from "@/lib/admin/videos/actions";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Video Gallery</h1>
          <p className="text-sm text-muted-foreground">
            {videos.length} video{videos.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/videos/new">
            <Plus /> Add Video
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Video</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No videos yet. Add your first video.
                </TableCell>
              </TableRow>
            ) : (
              videos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{v.title}</p>
                    <p className="max-w-md truncate text-xs text-muted-foreground">
                      {v.videoUrl}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{v.category ?? "-"}</TableCell>
                  <TableCell>
                    {v.isFeatured ? (
                      <Badge variant="secondary">Featured</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={v.isActive ? "default" : "destructive"}>
                      {v.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/gallery/videos/${v.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteButton id={v.id} action={deleteVideoAction} label="Delete" />
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