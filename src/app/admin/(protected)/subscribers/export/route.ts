import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export const dynamic = "force-dynamic";

function csvCell(v: string | null | undefined): string {
  const s = (v ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET() {
  await requireAdmin();
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "asc" },
  });

  const header = ["email", "name", "source", "status", "subscribed_at"];
  const rows = subscribers.map((s) => [
    csvCell(s.email),
    csvCell(s.name),
    csvCell(s.source),
    s.isActive ? "active" : "unsubscribed",
    csvCell(s.createdAt.toISOString()),
  ]);
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}