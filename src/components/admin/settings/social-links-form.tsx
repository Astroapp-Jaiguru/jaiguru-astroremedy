"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  saveSocialLinksAction,
  type SocialLinkRow,
} from "@/lib/admin/settings/actions";
import { SOCIAL_ICONS } from "@/components/layout/social-icons";

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  instagram: "Instagram",
  twitter: "Twitter / X",
  whatsapp: "WhatsApp",
  googlebusiness: "Google Business Profile",
};

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  facebook: "https://facebook.com/yourpage",
  youtube: "https://youtube.com/@yourchannel",
  instagram: "https://instagram.com/yourhandle",
  twitter: "https://x.com/yourhandle",
  whatsapp: "https://wa.me/919874886574",
  googlebusiness: "https://g.page/r/your-business",
};

export function SocialLinksForm({ rows }: { rows: SocialLinkRow[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveSocialLinksAction,
    undefined
  );
  const [values, setValues] = useState<Record<string, SocialLinkRow>>(
    Object.fromEntries(rows.map((r) => [r.platform, r]))
  );
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Social links saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const setUrl = (platform: string, url: string) =>
    setValues((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        url,
        isActive: url.trim() ? true : prev[platform].isActive,
      },
    }));
  const setActive = (platform: string, isActive: boolean) =>
    setValues((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], isActive },
    }));

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Social Media Links</CardTitle>
          <CardDescription>
            Links shown in the top header and footer. Empty links are hidden
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {Object.keys(values).map((platform) => {
            const row = values[platform];
            const Icon = SOCIAL_ICONS[platform];
            return (
              <div
                key={platform}
                className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {Icon ? (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-semibold">
                        {PLATFORM_LABELS[platform] ?? platform}
                      </Label>
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          name={`active_${platform}`}
                          checked={row.isActive}
                          disabled={!row.url.trim()}
                          onChange={(e) =>
                            setActive(platform, e.target.checked)
                          }
                          className="h-3.5 w-3.5 rounded border-input disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        Show
                      </label>
                    </div>
                    <Input
                      name={`url_${platform}`}
                      value={row.url}
                      onChange={(e) => setUrl(platform, e.target.value)}
                      placeholder={PLATFORM_PLACEHOLDERS[platform]}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button type="submit" disabled={pending} className="min-w-[130px]">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Social Links
        </Button>
      </div>
    </form>
  );
}