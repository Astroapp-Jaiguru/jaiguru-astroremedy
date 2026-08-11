"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { saveHeroAction } from "@/lib/admin/content/actions";
import type { HeroSettings } from "@/lib/admin/content/actions";

export function HeroSettingsForm({ initial }: { initial: HeroSettings }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveHeroAction, undefined);
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Hero section saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Headline & Trust Badge</CardTitle>
            <CardDescription>
              The headline is split into three parts - the highlighted middle
              part renders in gold.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="badge">Trust Badge Text</Label>
              <Input id="badge" name="badge" defaultValue={initial.badge} />
              <p className="text-xs text-muted-foreground">
                Small pill above the headline.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headlineBefore">Headline (before highlight)</Label>
              <Input
                id="headlineBefore"
                name="headlineBefore"
                defaultValue={initial.headlineBefore}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headlineHighlight">Headline (highlight)</Label>
              <Input
                id="headlineHighlight"
                name="headlineHighlight"
                defaultValue={initial.headlineHighlight}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headlineAfter">Headline (after highlight)</Label>
              <Input
                id="headlineAfter"
                name="headlineAfter"
                defaultValue={initial.headlineAfter}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtext">Subheading</Label>
              <Textarea
                id="subtext"
                name="subtext"
                rows={3}
                defaultValue={initial.subtext}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeText">Fee Label</Label>
              <Input
                id="feeText"
                name="feeText"
                defaultValue={initial.feeText}
                placeholder="Consultation Fee: ₹700"
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div>
                <Label htmlFor="active" className="cursor-pointer font-medium">
                  Hero Visible
                </Label>
                <p className="text-xs text-muted-foreground">
                  Turn the hero section on or off site-wide.
                </p>
              </div>
              <Switch
                id="active"
                name="active"
                defaultChecked={initial.active === false ? false : true}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Images & Buttons</CardTitle>
            <CardDescription>
              Paste image URLs (upload to the Photo Gallery or use a CDN
              link). Leave empty to keep the current image.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Astrologer Image URL</Label>
              <Input
                name="astrologerImage"
                type="url"
                defaultValue={initial.astrologerImage}
                placeholder="https://..."
                className="mt-2"
              />
              {initial.astrologerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={initial.astrologerImage}
                  alt=""
                  className="mt-2 h-28 w-24 rounded-lg border object-cover"
                />
              ) : null}
            </div>
            <div>
              <Label>Master Image URL (circular frame)</Label>
              <Input
                name="masterImage"
                type="url"
                defaultValue={initial.masterImage}
                placeholder="https://..."
                className="mt-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappLabel">WhatsApp Button Label</Label>
              <Input
                id="whatsappLabel"
                name="whatsappLabel"
                defaultValue={initial.whatsappLabel}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callLabel">Call Button Label</Label>
              <Input id="callLabel" name="callLabel" defaultValue={initial.callLabel} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productsLabel">Products Button Label</Label>
              <Input
                id="productsLabel"
                name="productsLabel"
                defaultValue={initial.productsLabel}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={pending} className="min-w-[130px]">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Hero Section
        </Button>
      </div>
    </form>
  );
}