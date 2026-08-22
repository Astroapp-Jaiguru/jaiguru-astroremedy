import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { saveShippingSettingsAction } from "@/lib/admin/shipping/actions";

export const dynamic = "force-dynamic";

export default async function ShippingSettingsPage() {
  await requireAdmin();
  const settings = await prisma.shippingSettings.findUnique({ where: { id: "singleton" } });
  return (
    <main className="max-w-2xl space-y-6">
      <div><h1 className="font-heading text-2xl font-bold">Shipping Settings</h1><p className="text-sm text-muted-foreground">Configure NimbusPost primary routing and Delhivery fallback rules.</p></div>
      <form action={saveShippingSettingsAction} className="space-y-5 rounded-xl border bg-card p-6">
        <label className="grid gap-2 text-sm font-medium">Default provider<select name="defaultProvider" defaultValue={settings?.defaultProvider ?? "NIMBUSPOST"} className="rounded-md border bg-background p-2"><option value="NIMBUSPOST">NimbusPost</option><option value="DELHIVERY">Delhivery</option></select></label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="fallbackEnabled" defaultChecked={settings?.fallbackEnabled ?? true} /> Automatically fall back to the other provider</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="metroUsesDelhivery" defaultChecked={settings?.metroUsesDelhivery ?? false} /> Prefer Delhivery for metro pincodes</label>
        <label className="grid gap-2 text-sm font-medium">Delhivery threshold: order value (paise)<input name="delhiveryValuePaise" type="number" min="1" defaultValue={settings?.delhiveryValuePaise ?? ""} className="rounded-md border bg-background p-2" /></label>
        <label className="grid gap-2 text-sm font-medium">Delhivery threshold: parcel weight (grams)<input name="delhiveryWeightGrams" type="number" min="1" defaultValue={settings?.delhiveryWeightGrams ?? ""} className="rounded-md border bg-background p-2" /></label>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save Shipping Settings</button>
      </form>
      <p className="text-xs text-muted-foreground">Provider credentials are server-only environment variables. Pincode serviceability and fallback are checked at checkout.</p>
    </main>
  );
}
