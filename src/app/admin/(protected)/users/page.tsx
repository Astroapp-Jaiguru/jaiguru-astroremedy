import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/dal";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteUserAction } from "@/lib/admin/users/actions";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminUsersPage() {
  await requireAdmin();
  const [currentUser, users] = await Promise.all([
    getCurrentUser(),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Admin Users</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} admin account{users.length === 1 ? "" : "s"} · you can
          delete another admin here; the account you are signed in with cannot
          be deleted from this screen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>
            Sign-ups are gated by the admin signup key (see Auth Settings).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                      {isSelf ? (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          You
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        <ShieldCheck className="h-3 w-3" />
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          u.isActive
                            ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                            : "border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-300"
                        }`}
                      >
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(u.lastLoginAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isSelf ? (
                        <DeleteButton
                          id={u.id}
                          action={deleteUserAction}
                          label="Delete"
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}