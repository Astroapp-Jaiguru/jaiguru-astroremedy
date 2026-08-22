import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSettlementsPage() {
  await requireAdmin();
  const batches = await prisma.settlementBatch.findMany({ include: { vendor: { select: { businessName: true } }, payout: true, items: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return <section className="flex flex-col gap-6"><div><p className="text-sm text-muted-foreground">Finance operations</p><h1 className="text-3xl font-semibold tracking-tight">Settlements & payouts</h1><p className="mt-2 text-muted-foreground">Review vendor earnings, commission snapshots, and payout readiness.</p></div><Card><CardHeader><CardTitle>Settlement batches ({batches.length})</CardTitle></CardHeader><CardContent><div className="flex flex-col gap-3">{batches.length ? batches.map((batch) => <div key={batch.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{batch.vendor.businessName}</p><p className="text-sm text-muted-foreground">{batch.periodStart.toLocaleDateString()} – {batch.periodEnd.toLocaleDateString()} · {batch.items.length} orders</p></div><Badge variant="secondary">{batch.status}</Badge></div><div className="mt-3 flex flex-wrap gap-6 text-sm"><span>Gross ₹{(batch.grossPaise / 100).toFixed(2)}</span><span>Commission ₹{(batch.commissionPaise / 100).toFixed(2)}</span><span className="font-semibold">Payable ₹{(batch.payablePaise / 100).toFixed(2)}</span><span>Payout {batch.payout?.status ?? "Not created"}</span></div></div>) : <p className="py-10 text-center text-sm text-muted-foreground">No settlement batches yet.</p>}</div></CardContent></Card></section>;
}
