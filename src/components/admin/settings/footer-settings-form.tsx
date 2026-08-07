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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { saveFooterAction } from "@/lib/admin/settings/actions";

export interface FooterFormValues {
  about: string;
  ownedBy: string;
  registered: string;
  copyright: string;
}

export function FooterSettingsForm({ initial }: { initial: FooterFormValues }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveFooterAction,
    undefined
  );
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Footer settings saved");
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
            <CardTitle className="text-lg">About & Legal Lines</CardTitle>
            <CardDescription>
              Shown in the footer bottom bar. Empty lines are hidden
              automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="about">About Text</Label>
              <Textarea
                id="about"
                name="about"
                rows={3}
                defaultValue={initial.about}
              />
              <p className="text-xs text-muted-foreground">
                Shown in the footer brand column.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="copyright">Copyright Line</Label>
              <Textarea
                id="copyright"
                name="copyright"
                rows={2}
                defaultValue={initial.copyright}
              />
              <p className="text-xs text-muted-foreground">
                The main legal line shown at the bottom of the footer.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Legal Lines</CardTitle>
            <CardDescription>
              Optional extra lines under the copyright (e.g. ownership or
              registration). Leave empty to hide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ownedBy">Owned By Line</Label>
              <Textarea
                id="ownedBy"
                name="ownedBy"
                rows={2}
                defaultValue={initial.ownedBy}
                placeholder="jaiguruastroremedy.com is owned and operated by ASTRO GEMS."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registered">Registered Line</Label>
              <Textarea
                id="registered"
                name="registered"
                rows={2}
                defaultValue={initial.registered}
                placeholder="ASTRO GEMS is a registered enterprise under the Kolkata Municipal Corporation."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={pending} className="min-w-[130px]">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Footer Settings
        </Button>
      </div>
    </form>
  );
}