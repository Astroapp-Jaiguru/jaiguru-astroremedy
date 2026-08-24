"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCcw, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  runPricingJobAction,
  runImageJobAction,
  type JobFormState,
} from "@/lib/admin/pricing/actions";

/**
 * One-click pricing + image refresh for the admin dashboard.
 * The pricing button runs the full flow in one click:
 *   1. fetch competitor prices (SerpApi),
 *   2. apply the safe formulas (physical x0.99 / digital x1.05),
 *   3. never breach the price floor (explicit or cost x 1.15).
 */

function jobLabel(state: JobFormState | undefined): string | null {
  if (!state?.message) return null;
  try {
    const s = JSON.parse(state.message) as {
      fetched?: number;
      changed?: number;
      priced?: number;
      dormant?: boolean;
    };
    const parts: string[] = [];
    if (s.dormant) parts.push("dormant (no API keys set)");
    if (typeof s.fetched === "number") parts.push(`${s.fetched} competitor prices`);
    if (typeof s.changed === "number") parts.push(`${s.changed} prices updated`);
    if (typeof s.priced === "number") parts.push(`${s.priced} priced`);
    return parts.join(" · ") || state.message;
  } catch {
    return state.message;
  }
}

function useJob(action: (p: JobFormState | undefined, d: FormData) => Promise<JobFormState>) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const router = useRouter();
  useEffect(() => {
    const label = jobLabel(state);
    if (state?.message && label) {
      toast.success(`Done — ${label}`);
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);
  return [formAction, pending] as const;
}

export function DashboardActions({
  lastRunAt,
  lastImageRunAt,
  keysSet,
}: {
  lastRunAt: string | null;
  lastImageRunAt: string | null;
  keysSet: { serpapi: boolean; images: boolean };
}) {
  const [pricingAction, pricingPending] = useJob(runPricingJobAction);
  const [imageAction, imagePending] = useJob(runImageJobAction);

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <form action={pricingAction} className="flex flex-col gap-2 rounded-xl border border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Refresh Competitor Prices & Update My Prices</p>
            <p className="mt-1 text-xs text-muted-foreground">
              One click: fetches competitor prices (SerpApi), applies the 1% undercut rule for
              products and the 5% premium rule for services, and never sells below your price
              floor (cost × 1.15). Use it once a week.
            </p>
          </div>
          <Button type="submit" disabled={pricingPending} className="shrink-0">
            {pricingPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Refresh Prices
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {keysSet.serpapi
            ? `Last run: ${lastRunAt ? new Date(lastRunAt).toLocaleString() : "never"}`
            : "SERPAPI_API_KEY not set — add it under Vercel → Settings → Environment Variables to enable live lookups."}
        </p>
      </form>

      <form action={imageAction} className="flex flex-col gap-2 rounded-xl border border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Assign Missing Product Images</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fills products without an image: Unsplash fallback first, AI generation (DALL-E 3 or
              Flux) for niche spiritual items. Manual uploads are never overwritten.
            </p>
          </div>
          <Button type="submit" disabled={imagePending} variant="outline" className="shrink-0">
            {imagePending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 h-4 w-4" />
            )}
            Assign Images
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {keysSet.images
            ? `Last run: ${lastImageRunAt ? new Date(lastImageRunAt).toLocaleString() : "never"}`
            : "No image keys set (Unsplash / OpenAI / Replicate) — pipeline is dormant until configured."}
        </p>
      </form>
    </div>
  );
}