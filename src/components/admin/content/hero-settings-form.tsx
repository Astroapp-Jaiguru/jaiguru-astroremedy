"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/admin/image-uploader";
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
  const [astrologerImage, setAstrologerImage] = useState(initial.astrologerImage);
  const [masterImage, setMasterImage] = useState(initial.masterImage);

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
            <CardTitle className="text-lg">Headline & Badge</CardTitle>
            <CardDescription>
              The three headline lines render stacked; line 2 is the gold
              gradient highlight.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="badge">Badge Text</Label>
              <Input id="badge" name="badge" defaultValue={initial.badge} />
              <p className="text-xs text-muted-foreground">
                Small pill above the headline.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headlineLine1">Headline Line 1</Label>
              <Input
                id="headlineLine1"
                name="headlineLine1"
                defaultValue={initial.headlineLine1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headlineLine2">Headline Line 2</Label>
              <Input
                id="headlineLine2"
                name="headlineLine2"
                defaultValue={initial.headlineLine2}
              />
              <p className="text-xs text-muted-foreground">
                Renders in gold gradient. Required.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headlineLine3">Headline Line 3</Label>
              <Input
                id="headlineLine3"
                name="headlineLine3"
                defaultValue={initial.headlineLine3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtext">Subheading Text</Label>
              <Textarea
                id="subtext"
                name="subtext"
                rows={3}
                defaultValue={initial.subtext}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeText">Fee Label Text</Label>
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
              Upload images directly - no manual URLs needed. Leave empty to
              keep the current image.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUploader
              name="astrologerImage"
              value={astrologerImage}
              onChange={setAstrologerImage}
              label="Astrologer Image"
              aspect="portrait"
              previewClassName="h-28 w-24"
            />
            <ImageUploader
              name="masterImage"
              value={masterImage}
              onChange={setMasterImage}
              label="Master Image (circular frame)"
              hint="A square image that fills the golden circular frame in the hero."
              aspect="circle"
              previewClassName="size-24"
            />
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