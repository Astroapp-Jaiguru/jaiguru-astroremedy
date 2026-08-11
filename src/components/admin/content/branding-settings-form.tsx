"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/admin/image-uploader";
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
  const [logo, setLogo] = useState(initial.logo);
  const [footerLogo, setFooterLogo] = useState(initial.footerLogo);
  const [favicon, setFavicon] = useState(initial.favicon);

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
            <ImageUploader
              name="favicon"
              value={favicon}
              onChange={setFavicon}
              label="Favicon"
              hint="Browser tab icon (recommended: 32x32 or 64x64 PNG)."
              aspect="square"
              previewClassName="size-16"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logos</CardTitle>
            <CardDescription>
              Upload images below - no manual URLs needed. The header logo is
              used across the site; a separate footer logo overrides it (leave
              empty to sync with the header).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUploader
              name="logo"
              value={logo}
              onChange={setLogo}
              label="Header Logo"
              hint="Recommended: transparent PNG, roughly 400x120."
              aspect="wide"
              previewClassName="h-14 w-auto"
            />
            <ImageUploader
              name="footerLogo"
              value={footerLogo}
              onChange={setFooterLogo}
              label="Footer Logo (optional)"
              hint="Syncs with the header logo when left empty."
              aspect="wide"
              previewClassName="h-14 w-auto"
            />
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