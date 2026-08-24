import { requireVendor } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const user = await requireVendor();
  const stats = [["Total products", "0"], ["Total orders", "0"], ["Pending orders", "0"], ["Total revenue", "₹0"]];
  return <main className="min-h-screen bg-background px-4 py-12"><div className="mx-auto max-w-6xl space-y-8"><div><p className="font-mono text-xs uppercase tracking-widest text-primary">Vendor workspace</p><h1 className="mt-2 font-heading text-4xl font-semibold">Welcome, {user.name}</h1><p className="mt-2 text-muted-foreground">Manage your catalogue, orders, and verification status.</p></div><div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5"><p className="font-medium text-amber-200">KYC verification pending</p><p className="mt-1 text-sm text-muted-foreground">Your account will become active after an admin reviews your submitted documents.</p><Link href="/vendor/kyc" className="mt-3 inline-block text-sm font-medium text-primary">Review verification status</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value]) => <Card key={label}><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle></CardHeader><CardContent><p className="font-heading text-3xl font-semibold">{value}</p></CardContent></Card>)}</div><div className="flex flex-wrap gap-3"><Button asChild><Link href="/vendor/kyc">Update KYC documents</Link></Button><Button asChild variant="outline"><Link href="/products">Browse marketplace</Link></Button></div></div></main>;
}
