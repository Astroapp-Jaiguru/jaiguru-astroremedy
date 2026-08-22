import { redirect } from "next/navigation";
import { requireVendor } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VendorSettlementsPage() {
  const user = await requireVendor();
  const vendor = await prisma.vendor.findFirst({ where: { organization: { ownerId: user.id } }, select: { id: true, businessName: true } });
  if (!vendor) redirect("/admin/unauthorized");
  const batches = await prisma.settlementBatch.findMany({ where: { vendorId: vendor.id }, include: { payout: true, items: true }, orderBy: { periodEnd: "desc" } });
  const reserved = await prisma.vendorOrder.aggregate({ where: { vendorId: vendor.id, status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] } }, _sum: { payoutPaise: true } });
  return <section className="mx-auto flex max-w-5xl flex-col gap-6"><div><p className="text-sm text-muted-foreground">Vendor finance</p><h1 className="text-3xl font-semibold tracking-tight">{vendor.businessName} settlements</h1><p className="mt-2 text-muted-foreground">Transparent statements for delivered and paid marketplace orders.</p></div><div className="grid gap-4 sm:grid-cols-3"><Card><CardHeader><CardTitle className="text-sm">Reserved balance</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">₹{((reserved._sum.payoutPaise ?? 0) / 100).toFixed(2)}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Batches</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{batches.length}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Paid out</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">₹{(batches.filter((b) => b.status === "PAID").reduce((sum, b) => sum + b.payablePaise, 0) / 100).toFixed(2)}</CardContent></Card></div><Card><CardHeader><CardTitle>Statements</CardTitle></CardHeader><CardContent><div className="flex flex-col gap-3">{batches.length ? batches.map((batch) => <div key={batch.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="font-medium">{batch.periodStart.toLocaleDateString()} – {batch.periodEnd.toLocaleDateString()}</p><p className="text-sm text-muted-foreground">{batch.items.length} eligible orders · Commission ₹{(batch.commissionPaise / 100).toFixed(2)}</p></div><div className="flex items-center gap-4"><span className="font-semibold">₹{(batch.payablePaise / 100).toFixed(2)}</span><Badge variant="secondary">{batch.status}</Badge></div></div>) : <p className="py-10 text-center text-sm text-muted-foreground">Statements will appear after eligible orders are settled.</p>}</div></CardContent></Card></section>;
}
