import { requireAdmin } from "@/lib/dal";
import { getModeVisibility } from "@/lib/mode-visibility-actions";
import { ServiceModesForm } from "@/components/admin/settings/service-modes-form";

export const dynamic = "force-dynamic";

export default async function ServiceModesPage() {
  await requireAdmin();
  const visibility = await getModeVisibility();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Service Mode Settings</h1>
        <p className="text-sm text-muted-foreground">
          Choose which booking modes are offered to users — Online, Offline or
          Home Service. Disabled modes are hidden from consultation pricing
          cards and the booking modal.
        </p>
      </div>
      <ServiceModesForm initial={visibility} />
    </div>
  );
}