"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";

/**
 * Visible reminder shown on the admin sign-in page: if the dashboard ever
 * fails to load from a stale browser cache, a hard refresh fixes it
 * instantly. Also fires a one-time toast as a friendly nudge.
 */
export function HardRefreshHint() {
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.info(
        "Dashboard not loading? Press Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac) to hard refresh.",
        { duration: 6000 }
      );
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-5 flex items-start gap-3 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 p-3.5 text-left">
      <RefreshCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="text-xs leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">
          Seeing an outdated or broken dashboard?
        </p>
        <p className="mt-1">
          Hold{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold">
            Ctrl + Shift + R
          </kbd>{" "}
          (Windows) or{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold">
            Cmd + Shift + R
          </kbd>{" "}
          (Mac) to hard refresh. If it keeps happening, open the page in an
          incognito window.
        </p>
      </div>
    </div>
  );
}