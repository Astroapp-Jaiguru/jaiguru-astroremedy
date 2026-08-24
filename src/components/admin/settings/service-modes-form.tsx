"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  MODE_LABELS,
  type ModeId,
  type ModeVisibility,
} from "@/lib/mode-visibility";
import { saveModeVisibilityAction } from "@/lib/mode-visibility-actions";

const MODE_DESCRIPTIONS: Record<ModeId, string> = {
  online: "Show the Online option for consultations and courses.",
  offline: "Show the Offline / at-chamber option for consultations and courses.",
  homeService: "Show the Home Service / Home Visit option for consultations and courses.",
};

export function ServiceModesForm({ initial }: { initial: ModeVisibility }) {
  const [state, formAction, pending] = useActionState(saveModeVisibilityAction, undefined);
  const [values, setValues] = useState<ModeVisibility>(initial);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="online" value={values.online ? "on" : "off"} />
        <input type="hidden" name="offline" value={values.offline ? "on" : "off"} />
        <input type="hidden" name="homeService" value={values.homeService ? "on" : "off"} />

        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(MODE_LABELS) as ModeId[]).map((id) => (
            <div
              key={id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{MODE_LABELS[id]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {MODE_DESCRIPTIONS[id]}
                  </p>
                </div>
                <Switch
                  checked={values[id]}
                  onCheckedChange={(c) => setValues((v) => ({ ...v, [id]: c }))}
                  aria-label={`Toggle ${MODE_LABELS[id]}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Save Mode Settings
          </Button>
          {state?.ok ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Saved successfully.
            </span>
          ) : null}
          {state?.error ? (
            <span className="text-sm text-red-500">{state.error}</span>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          Turning a mode off hides that option from consultation pricing cards
          and the booking modal — existing bookings and orders are not affected.
        </p>
      </form>
    </div>
  );
}