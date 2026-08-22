"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  saveSeoAction,
  resetSeoAction,
} from "@/lib/admin/settings/actions";

export interface SeoFormValues {
  title: string;
  description: string;
  keywords: string;
}

export function SeoSettingsForm({ initial }: { initial: SeoFormValues }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveSeoAction,
    undefined
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetSeoAction,
    undefined
  );
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("SEO settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  useEffect(() => {
    if (resetState?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("SEO settings reset to defaults");
      router.refresh();
    } else if (resetState?.error) {
      toast.error(resetState.error);
    }
  }, [resetState, router]);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Global SEO Settings</CardTitle>
          <CardDescription>
            These values are injected into the <code>&lt;head&gt;</code> of
            every public page via Next.js metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">SEO Title</Label>
              <span className="text-xs text-muted-foreground">
                {initial.title.length}/70 characters recommended
              </span>
            </div>
            <Input
              id="title"
              name="title"
              defaultValue={initial.title}
              placeholder="JAIGURU ASTROREMEDY | Best Astrologer in Kolkata"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">SEO Description</Label>
              <span className="text-xs text-muted-foreground">
                {initial.description.length}/160 characters recommended
              </span>
            </div>
            <Textarea
              id="description"
              name="description"
              defaultValue={initial.description}
              rows={3}
              placeholder="Best astrologer in Kolkata. Vedic Astrology, Vastu, Numerology, Yoga & Spiritual Remedies…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">SEO Keywords</Label>
            <Textarea
              id="keywords"
              name="keywords"
              defaultValue={initial.keywords}
              rows={3}
              placeholder="best astrologer in Kolkata, vastu consultant Kolkata, …"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of keywords.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={pending} className="min-w-[130px]">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save SEO
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={resetPending}
          onClick={() => {
            if (window.confirm("Reset SEO settings to the defaults?")) {
              resetAction();
            }
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </form>
  );
}
