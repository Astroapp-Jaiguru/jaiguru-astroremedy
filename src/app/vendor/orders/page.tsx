import { redirect } from "next/navigation";
import { requireVendor } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VendorOrdersPage() {
  const user = await requireVendor();
  const vendor = await prisma.vendor.findFirst({ where: { organization: { ownerId: user.id } }, select: { id: true, businessName: true } });
  if (!vendor) redirect("/admin/unauthorized");
  const orders = await prisma.order.findMany({ where: { vendorId: vendor.id }, orderBy: { createdAt: "desc" }, take: 100 });
  const marketplaceOrders = await prisma.vendorOrder.findMany({
    where: { vendorId: vendor.id },
    include: { marketplaceOrder: true, items: true, shipment: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6"><div><p className="text-sm text-muted-foreground">Vendor workspace</p><h1 className="text-3xl font-semibold">Orders & settlements</h1><p className="mt-2 text-muted-foreground">Manage orders assigned to {vendor.businessName} and monitor payout status.</p></div><Card><CardHeader><CardTitle>Recent orders ({orders.length})</CardTitle></CardHeader><CardContent>{orders.length ? <div className="flex flex-col gap-3">{orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4"><div><p className="font-medium">{order.itemName}</p><p className="text-sm text-muted-foreground">{order.customerName} · {order.pincode || "No pincode"}</p></div><div className="flex items-center gap-4"><span className="font-semibold">{order.amountLabel || "Amount pending"}</span><Badge variant="secondary">{order.status}</Badge></div></div>)}</div> : <p className="py-10 text-center text-muted-foreground">No vendor orders yet. Orders from the public catalogue will appear here after checkout.</p>}</CardContent></Card><Card><CardHeader><CardTitle>Marketplace fulfillment ({marketplaceOrders.length})</CardTitle></CardHeader><CardContent>{marketplaceOrders.length ? <div className="flex flex-col gap-3">{marketplaceOrders.map((order) => <div key={order.id} className="rounded-xl border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Order {order.marketplaceOrder.id.slice(-8).toUpperCase()}</p><p className="text-sm text-muted-foreground">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</p></div><Badge variant="secondary">{order.status.replaceAll("_", " ")}</Badge></div><div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground"><span>Payment: {order.marketplaceOrder.paymentStatus}</span><span>Shipping: {order.shipment?.status?.replaceAll("_", " ") ?? "Not created"}</span>{order.shipment?.awbNumber ? <span>AWB: {order.shipment.awbNumber}</span> : null}</div>{order.shipment?.trackingUrl ? <a className="mt-3 inline-block font-medium text-royal-purple underline" href={order.shipment.trackingUrl} target="_blank" rel="noreferrer">Track shipment</a> : null}</div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">No marketplace fulfillment orders yet.</p>}</CardContent></Card></main>;
}
