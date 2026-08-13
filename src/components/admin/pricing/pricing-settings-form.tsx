"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  savePricingSettingsAction,
  runPricingJobAction,
  runImageJobAction,
  type JobFormState,
} from "@/lib/admin/pricing/actions";
import type { PricingSettings } from "@/lib/pricing/settings";

/**
 * Admin page for the dynamic pricing engine + image pipeline.
 * Safe defaults: the toggle is OFF until explicitly enabled, and every
 * automatic price change is recorded in the audit table.
 */

export function PricingSettingsForm({ initial }: { initial: PricingSettings }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    savePricingSettingsAction,
    undefined
  );
  const handledRef = useRef(false);

  const [enabled, setEnabled] = useState(initial.enabled);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Pricing settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Global Pricing Toggle</CardTitle>
          <CardDescription>
            When ON, prices are shown converted to the viewer&apos;s local
            currency (USD / EUR / GBP) with the configured markup for
            international visitors. Indian visitors always see the base INR
            price. Display-only — the stored INR price is never changed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">International price display</p>
              <p className="text-xs text-muted-foreground">
                {enabled
                  ? "Active — international visitors see converted prices."
                  : "Off — every visitor sees the base INR price."}
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              name="enabled"
              aria-label="Enable international pricing"
            />
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Compliance note: regional pricing must be applied transparently.
            The disclosure text below is shown next to every converted price.
            Keep the markup modest and the note honest — misleading prices can
            breach consumer-protection rules in the EU/US.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="markup">International markup (%)</Label>
              <Input
                id="markup"
                name="markup"
                type="number"
                step="0.05"
                min="0"
                max="5"
                defaultValue={initial.markup * 100}
                required
              />
              <p className="text-xs text-muted-foreground">
                e.g. 30 = prices ×1.30 for international visitors.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseCountry">Base country (no markup)</Label>
              <Input
                id="baseCountry"
                name="baseCountry"
                defaultValue={initial.baseCountry}
                maxLength={2}
                className="uppercase"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="mb-3 text-sm font-semibold">Currency rates (1 INR = …)</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["USD", "EUR", "GBP"] as const).map((code) => {
                const c = initial.currencies[code];
                return (
                  <div key={code} className="space-y-3 rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide">
                      {c.label} ({code})
                    </p>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor={`${code.toLowerCase()}Rate`}>Rate</Label>
                        <Input
                          id={`${code.toLowerCase()}Rate`}
                          name={`${code.toLowerCase()}Rate`}
                          type="number"
                          step="0.0001"
                          min="0"
                          defaultValue={c.rate}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`${code.toLowerCase()}Symbol`}>Symbol</Label>
                          <Input
                            id={`${code.toLowerCase()}Symbol`}
                            name={`${code.toLowerCase()}Symbol`}
                            defaultValue={c.symbol}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`${code.toLowerCase()}Locale`}>Locale</Label>
                          <Input
                            id={`${code.toLowerCase()}Locale`}
                            name={`${code.toLowerCase()}Locale`}
                            defaultValue={c.locale}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disclosure">Disclosure note (shown under converted prices)</Label>
            <Textarea
              id="disclosure"
              name="disclosure"
              defaultValue={initial.disclosure}
              rows={2}
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save pricing settings
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

/** Status card for the engine key presence. */
export function EngineStatus({ keys }: { keys: Record<string, boolean> }) {
  const rows: Array<[string, string]> = [
    ["SERPAPI_API_KEY", "Competitor price lookups"],
    ["UNSPLASH_ACCESS_KEY", "Unsplash fallback images"],
    ["OPENAI_API_KEY", "AI image generation (DALL-E)"],
    ["REPLICATE_API_TOKEN", "AI image generation (Flux)"],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Engine Keys</CardTitle>
        <CardDescription>
          The engine runs safely without keys (jobs report as dormant) but
          needs the relevant key to do real work. Add them under Vercel →
          Settings → Environment Variables.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map(([key, purpose]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
          >
            <span className="font-mono text-xs">{key}</span>
            <span className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{purpose}</span>
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  keys[key] ? "bg-emerald-500" : "bg-slate-500"
                }`}
              />
              <span className="w-16 text-right text-xs font-semibold">
                {keys[key] ? "SET" : "missing"}
              </span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function useJobForm(action: (p: JobFormState | undefined, d: FormData) => Promise<JobFormState>) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const router = useRouter();
  useEffect(() => {
    if (state?.message) {
      try {
        const s = JSON.parse(state.message);
        toast.success(
          `Done — changed ${s.changed ?? 0}, fetched ${s.fetched ?? 0}, priced ${s.priced ?? 0}` +
            (s.dormant ? " (dormant: keys missing)" : "")
        );
      } catch {
        toast.info(state.message);
      }
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);
  return [formAction, pending] as const;
}

export function JobRunners() {
  const [pricingAction, pricingPending] = useJobForm(runPricingJobAction);
  const [imageAction, imagePending] = useJobForm(runImageJobAction);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Run Jobs Now</CardTitle>
      <CardDescription>
        One-click manual refresh — click the pricing button once a week (or
        whenever you want). Each click refreshes a batch of ~8 seconds worth
        of products; for a full-catalog sweep run
        <code className="mx-1 rounded bg-muted px-1">npm run pricing:sweep</code>
        locally.
      </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <form action={pricingAction}>
          <Button type="submit" disabled={pricingPending} variant="default">
            {pricingPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run pricing update
          </Button>
        </form>
        <form action={imageAction}>
          <Button type="submit" disabled={imagePending} variant="outline">
            {imagePending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Assign missing images
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
