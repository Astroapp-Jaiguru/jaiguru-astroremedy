import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

// Define the Vendor type
type VendorRow = {
  id: number;
  businessname: string;
  contactperson: string;
  phone: string | null;
  gstnumber: string | null;
  pannumber: string | null;
  status: string;
  organizationid: number | null;
  user_email: string | null;
  createdat: Date | null;
  updatedat: Date | null;
};

export default async function AdminVendorsPage() {
  await requireAdmin();
  
  // Use raw query to get vendors with correct snake_case columns
  const vendors = await prisma.$queryRaw<VendorRow[]>`
    SELECT v.*, u.email as user_email 
    FROM "Vendor" v
    LEFT JOIN "User" u ON v.userid = u.id
    WHERE v.status = 'PENDING'
    ORDER BY v.createdat ASC
  `;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Marketplace operations</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Vendor review</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review pending applications and KYC status before activation.</p>
      </div>
      <div className="grid gap-4">
        {vendors.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No pending vendor applications.</CardContent></Card>
        ) : (
          vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardHeader><CardTitle>{vendor.businessname}</CardTitle></CardHeader>
              <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <span>Contact: {vendor.contactperson}</span>
                <span>Email: {vendor.user_email ?? "—"}</span>
                <span>Status: {vendor.status}</span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
