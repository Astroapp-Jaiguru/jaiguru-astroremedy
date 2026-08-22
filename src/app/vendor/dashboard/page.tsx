import Link from "next/link";
import { redirect } from "next/navigation";
import { requireVendor } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getAllVendorProducts } from "@/lib/vendor/product-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VendorDashboardPage() {
  const user = await requireVendor();
  const vendor = await prisma.vendor.findFirst({ where: { organization: { ownerId: user.id } }, include: { organization: { include: { kycCases: { orderBy: { createdAt: "desc" }, take: 1 } } } } });
  if (!vendor || vendor.status !== "APPROVED") redirect("/admin/unauthorized");
  const products = await getAllVendorProducts();
  const approved = products.filter((product) => product.approvalStatus === "APPROVED");
  const pending = products.filter((product) => product.approvalStatus === "PENDING");
  const kyc = vendor.organization.kycCases[0]?.status || "PENDING";
  return <main className="mx-auto flex max-w-6xl flex-col gap-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Vendor workspace</p><h1 className="text-3xl font-semibold text-balance">{vendor.businessName}</h1></div><div className="flex gap-3"><Button asChild><Link href="/vendor/products/create">Add new product</Link></Button><Button variant="outline" asChild><Link href="/vendor/kyc">Update KYC</Link></Button></div></div><Card><CardContent className="flex items-center justify-between gap-4 p-6"><div><p className="text-sm text-muted-foreground">KYC status</p><p className="mt-1 text-xl font-semibold">{kyc.replaceAll("_", " ")}</p></div><Badge>{kyc}</Badge></CardContent></Card><div className="grid gap-4 sm:grid-cols-3"><Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total products</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{products.length}</p></CardContent></Card><Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Approved and live</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{approved.length}</p></CardContent></Card><Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Awaiting review</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{pending.length}</p></CardContent></Card></div><Card><CardHeader><CardTitle>Product catalog</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">{products.length === 0 ? <p className="text-sm text-muted-foreground">No products yet. Add your first product to begin.</p> : products.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{product.name}</p><p className="text-sm text-muted-foreground">{product.category.name} · ₹{product.price.toString()}</p></div><Badge variant={product.approvalStatus === "APPROVED" ? "default" : "secondary"}>{product.approvalStatus}</Badge></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Recent orders</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">No orders have been placed yet.</p></CardContent></Card></main>;
}
