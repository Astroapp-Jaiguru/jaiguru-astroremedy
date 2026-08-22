"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  updateArticlesVisibilityAction,
} from "@/lib/admin/settings/actions";

/**
 * "Show Articles on Website" master toggle (Homepage > Articles Settings).
 * When OFF the public /articles pages 404 and the Articles links vanish
 * from the header, mobile menu and footer — same behavior as the gallery
 * section toggles.
 */
export function ArticlesSettingsForm({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(enabled);
  const [state, formAction, pending] = useActionState(
    updateArticlesVisibilityAction,
    undefined
  );
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Articles settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <Label htmlFor="articles-enabled" className="cursor-pointer text-sm font-semibold">
              Show Articles on Website
            </Label>
            <p className="text-sm text-muted-foreground">
              Turn off to hide the entire Articles system (listing page,
              article pages and every Articles link in the header, mobile
              menu and footer).
            </p>
          </div>
          <input
            id="articles-enabled"
            type="checkbox"
            checked={value}
            onChange={(e) => setValue(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-[#D4AF37]"
          />
          <input
            type="hidden"
            name="articles-enabled"
            value={value ? "on" : "off"}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Articles Settings
        </Button>
      </div>
    </form>
  );
}