"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  updateGallerySectionsAction,
} from "@/lib/admin/settings/actions";
import type { GallerySectionsSettings } from "@/lib/gallery-data";

const SECTIONS = [
  { key: "youtube" as const, title: "YouTube Gallery", description: "Show the YouTube Gallery tile on the homepage." },
  { key: "photo" as const, title: "Photo Gallery", description: "Show the Photo Gallery tile on the homepage." },
  { key: "video" as const, title: "Video Gallery", description: "Show the Video Gallery tile on the homepage." },
];

export function GallerySectionsForm({ initial }: { initial: GallerySectionsSettings }) {
  const router = useRouter();
  const [values, setValues] = useState<GallerySectionsSettings>({
    youtube: initial.youtube,
    photo: initial.photo,
    video: initial.video,
  });
  const [state, formAction, pending] = useActionState(
    updateGallerySectionsAction,
    undefined
  );
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Gallery section settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <div
            key={s.key}
            className="flex items-center justify-between gap-4 rounded-lg border p-4"
          >
            <div>
              <Label htmlFor={`gallery-${s.key}`} className="cursor-pointer text-sm font-semibold">
                Show {s.title}
              </Label>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
            <input
              id={`gallery-${s.key}`}
              type="checkbox"
              checked={values[s.key]}
              onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.checked }))}
              className="h-4 w-4 rounded border-input accent-[#D4AF37]"
            />
            <input
              type="hidden"
              name={`gallery-${s.key}`}
              value={values[s.key] ? "on" : "off"}
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Disabled sections disappear from the homepage &quot;Explore Our Gallery&quot; band.
          The remaining tiles automatically expand to fill the space and stay centered.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Gallery Settings
        </Button>
      </div>
    </form>
  );
}