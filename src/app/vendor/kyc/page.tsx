import { requireVendor } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function VendorKycPage() {
  await requireVendor();
  return <main className="min-h-screen bg-background px-4 py-12"><div className="mx-auto max-w-3xl"><Card><CardHeader><p className="font-mono text-xs uppercase tracking-widest text-primary">Verification centre</p><CardTitle className="font-heading text-3xl">KYC status</CardTitle></CardHeader><CardContent className="space-y-5"><div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"><p className="font-medium text-amber-200">Pending review</p><p className="mt-1 text-sm text-muted-foreground">Documents submitted with your application are awaiting admin review.</p></div><div className="grid gap-3 sm:grid-cols-2">{["Address proof", "PAN card", "GST certificate", "Business registration"].map((name) => <div className="rounded-lg border border-border/70 p-4" key={name}><p className="text-sm font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">Pending verification</p></div>)}</div></CardContent></Card></div></main>;
}
