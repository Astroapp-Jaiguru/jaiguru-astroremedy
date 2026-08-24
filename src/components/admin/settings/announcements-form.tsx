"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  saveAnnouncementsAction,
} from "@/lib/admin/announcements/actions";

export interface AnnouncementSlot {
  title: string | null;
  text: string;
  fontSize: number;
  fontStyle: string | null;
  speed: number;
  isActive: boolean;
}

export interface AnnouncementsFormValues {
  slots: AnnouncementSlot[];
  extraCount: number;
}

export function AnnouncementsForm({ initial }: { initial: AnnouncementsFormValues }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveAnnouncementsAction,
    undefined
  );
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success(
        state.deletedCount
          ? `Announcement bars saved · ${state.deletedCount} extra bar(s) removed`
          : "Announcement bars saved"
      );
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const slot = (i: number) => initial.slots[i] ?? {
    title: null,
    text: "",
    fontSize: 16,
    fontStyle: "normal",
    speed: 30,
    isActive: true,
  };

  const [fontStyles, setFontStyles] = useState<[string, string]>([
    slot(0).fontStyle === "bold" ? "bold" : "normal",
    slot(1).fontStyle === "bold" ? "bold" : "normal",
  ]);

  return (
    <form action={formAction}>
      <div className="space-y-6">
        {[0, 1].map((i) => {
          const s = slot(i);
          return (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Megaphone className="h-4 w-4 text-[#D4AF37]" />
                  Announcement Bar {i + 1}
                </CardTitle>
                <CardDescription>
                  Scrolling bar {i + 1} — colors come from the active theme (bar {i + 1} uses
                  its own theme variables and updates when you switch preset in Theme Settings).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor={`slot${i}-active`} className="cursor-pointer">
                    Show this bar on the website
                  </Label>
                  <input
                    id={`slot${i}-active`}
                    type="checkbox"
                    name={`slot${i}-active`}
                    defaultChecked={s.isActive}
                    className="h-4 w-4 rounded border-input accent-[#D4AF37]"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`slot${i}-title`}>Title (admin only)</Label>
                    <Input
                      id={`slot${i}-title`}
                      name={`slot${i}-title`}
                      defaultValue={s.title ?? ""}
                      placeholder="e.g. New Batch Announcement"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`slot${i}-fontStyle`}>Font Style</Label>
                    <input type="hidden" name={`slot${i}-fontStyle`} value={fontStyles[i]} />
                    <Select
                      value={fontStyles[i]}
                      onValueChange={(v) =>
                        setFontStyles((prev) => {
                          const next = [...prev] as [string, string];
                          next[i] = v;
                          return next;
                        })
                      }
                    >
                      <SelectTrigger id={`slot${i}-fontStyle`} className="w-full">
                        <SelectValue placeholder="Font style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`slot${i}-text`}>Message</Label>
                  <Textarea
                    id={`slot${i}-text`}
                    name={`slot${i}-text`}
                    defaultValue={s.text}
                    rows={2}
                    placeholder='Separate multiple messages with "||"'
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`slot${i}-fontSize`}>Font Size (px)</Label>
                    <Input
                      id={`slot${i}-fontSize`}
                      name={`slot${i}-fontSize`}
                      type="number"
                      min={12}
                      max={24}
                      defaultValue={s.fontSize}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`slot${i}-speed`}>Scroll Speed (s, higher = slower)</Label>
                    <Input
                      id={`slot${i}-speed`}
                      name={`slot${i}-speed`}
                      type="number"
                      min={8}
                      max={120}
                      defaultValue={s.speed}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {initial.extraCount > 0 ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            {initial.extraCount} extra announcement bar{initial.extraCount === 1 ? "" : "s"} found in the
            database. They will be removed when you save — the website will then show these two bars only.
          </div>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Announcement Bars
        </Button>
      </div>
    </form>
  );
}