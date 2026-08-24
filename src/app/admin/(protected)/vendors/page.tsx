import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export default async function AdminVendorsPage() {
  await requireAdmin();
  const vendors = await prisma.vendor.findMany({ where: { status: "PENDING" }, include: { organization: true, user: true }, orderBy: { createdAt: "asc" } });
  return <div className="space-y-6"><div><p className="font-mono text-xs uppercase tracking-widest text-primary">Marketplace operations</p><h1 className="mt-2 font-heading text-3xl font-semibold">Vendor review</h1><p className="mt-2 text-sm text-muted-foreground">Review pending applications and KYC status before activation.</p></div><div className="grid gap-4">{vendors.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No pending vendor applications.</CardContent></Card> : vendors.map((vendor) => <Card key={vendor.id}><CardHeader><CardTitle>{vendor.businessName}</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3"><span>Contact: {vendor.contactPerson}</span><span>Email: {vendor.user?.email ?? "—"}</span><span>Status: {vendor.status}</span></CardContent></Card>)}</div></div>;
}
