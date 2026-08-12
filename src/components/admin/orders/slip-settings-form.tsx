"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { saveSlipSettingsAction } from "@/lib/admin/orders/actions";
import type { SlipSettings } from "@/lib/orders/slip-settings";

/**
 * Delivery slip tax settings (order detail page).
 * Stored under SiteSetting "delivery-slip"; when "Show Tax on Slip" is
 * off, the slip prints no tax information at all.
 */
export function SlipSettingsForm({
  id,
  settings,
}: {
  id: string;
  settings: SlipSettings;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveSlipSettingsAction,
    undefined
  );
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Delivery slip settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="showTax"
          defaultChecked={settings.showTax}
          className="size-4 rounded border-input accent-orange-600"
        />
        Show Tax on Slip
      </label>
      <p className="-mt-2 text-xs text-muted-foreground">
        When on, the slip lists the GSTIN and tax rate below and adds GST to
        the item amount. When off, no tax information is printed.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gstin">GSTIN</Label>
          <input
            id="gstin"
            name="gstin"
            type="text"
            defaultValue={settings.gstin}
            maxLength={40}
            placeholder="e.g. 27ABCDE1234F1Z5"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <input
            id="taxRate"
            name="taxRate"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max="100"
            defaultValue={settings.taxRate}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-1.5 h-4 w-4" />
        )}
        Save Settings
      </Button>
    </form>
  );
}