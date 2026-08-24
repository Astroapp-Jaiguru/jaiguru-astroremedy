import { requireBuyer } from "@/lib/dal";
import { PortalShell } from "@/components/marketplace/portal-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const dynamic = "force-dynamic";
export default async function BuyerDashboardPage() { const user = await requireBuyer(); return <PortalShell eyebrow="Buyer workspace" title={`Welcome, ${user.name}`}><div className="grid gap-4 sm:grid-cols-3">{[["Total orders", "0"], ["Pending orders", "0"], ["Total spent", "₹0"]].map(([label, value]) => <Card key={label}><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle></CardHeader><CardContent><p className="font-heading text-3xl">{value}</p></CardContent></Card>)}</div><Card><CardHeader><CardTitle>Order history</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Your marketplace orders will appear here.</CardContent></Card></PortalShell>; }
