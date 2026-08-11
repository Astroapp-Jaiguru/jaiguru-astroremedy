"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { saveBrandingAction } from "@/lib/admin/content/actions";
import type { BrandingSettings } from "@/lib/admin/content/actions";

export function BrandingSettingsForm({
  initial,
}: {
  initial: BrandingSettings;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveBrandingAction,
    undefined
  );
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Branding saved");
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
            <CardTitle className="text-lg">Site Identity</CardTitle>
            <CardDescription>
              Site title, tagline and alt text used across the header and footer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Title</Label>
              <Input id="siteName" name="siteName" defaultValue={initial.siteName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" defaultValue={initial.tagline} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoAlt">Logo Alt Text</Label>
              <Input id="logoAlt" name="logoAlt" defaultValue={initial.logoAlt} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon URL</Label>
              <Input
                id="favicon"
                name="favicon"
                type="url"
                defaultValue={initial.favicon}
                placeholder="https://.../favicon.png"
              />
              <p className="text-xs text-muted-foreground">
                Browser tab icon (recommended: 32x32 or 64x64 png).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logos</CardTitle>
            <CardDescription>
              The header logo is used across the site. Set a separate footer
              logo to override it (or leave empty to sync with the header).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Header Logo URL</Label>
              <Input
                name="logo"
                type="url"
                defaultValue={initial.logo}
                placeholder="https://..."
                className="mt-2"
              />
              {initial.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={initial.logo}
                  alt=""
                  className="mt-2 h-14 w-auto rounded-lg border object-contain"
                />
              ) : null}
            </div>
            <div>
              <Label>Footer Logo URL (optional)</Label>
              <Input
                name="footerLogo"
                type="url"
                defaultValue={initial.footerLogo}
                placeholder="Syncs with header logo when empty"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={pending} className="min-w-[130px]">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Branding
        </Button>
      </div>
    </form>
  );
}