"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BODY_FONTS,
  HEADING_FONTS,
  FONT_WEIGHTS,
  type ThemeSettings,
} from "@/config/theme";
import {
  saveTypographyAction,
  resetTypographyAction,
} from "@/lib/admin/typography/actions";
import { cn } from "@/lib/utils";

function RangeControl({
  label,
  name,
  value,
  min,
  max,
  step,
  format,
}: {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
          {format(value)}
        </span>
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={value}
        className="w-full accent-[var(--jaiguru-primary,#4c1d95)]"
      />
    </div>
  );
}

function WeightGroup({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {FONT_WEIGHTS.map((w) => (
          <label
            key={w.id}
            className="cursor-pointer"
            style={{ fontWeight: w.css }}
          >
            <input
              type="radio"
              name={name}
              value={w.id}
              defaultChecked={value === w.id}
              className="peer sr-only"
            />
            <span
              className={cn(
                "inline-block rounded-md border px-3 py-1.5 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground"
              )}
            >
              {w.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ColorControl({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
        <input
          id={name}
          name={name}
          type="color"
          defaultValue={value}
          className="h-9 w-14 cursor-pointer rounded border bg-transparent p-1"
        />
      </div>
    </div>
  );
}

export function TypographyForm({ initial }: { initial: ThemeSettings }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveTypographyAction,
    undefined
  );
  const handledRef = useRef(false);
  const [resetting, startReset] = useTransition();
  const [bodyFont, setBodyFont] = useState(initial.bodyFont);
  const [headingFont, setHeadingFont] = useState(initial.headingFont);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Typography saved - the website updates instantly");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  function reset() {
    if (!window.confirm("Restore default typography settings?")) return;
    startReset(async () => {
      const res = await resetTypographyAction();
      if (res.success) {
        toast.success("Typography reset to defaults");
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not reset typography.");
      }
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Font Family</CardTitle>
            <CardDescription>
              Body font applies to paragraphs and UI text; heading font applies
              to every heading across the website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bodyFont">Body Font</Label>
              <input type="hidden" name="bodyFont" value={bodyFont} />
              <Select value={bodyFont} onValueChange={setBodyFont}>
                <SelectTrigger id="bodyFont" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BODY_FONTS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headingFont">Heading Font</Label>
              <input type="hidden" name="headingFont" value={headingFont} />
              <Select value={headingFont} onValueChange={setHeadingFont}>
                <SelectTrigger id="headingFont" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEADING_FONTS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <WeightGroup
              label="Body Font Weight"
              name="bodyFontWeight"
              value={initial.bodyFontWeight}
            />
            <WeightGroup
              label="Heading Font Weight"
              name="headingFontWeight"
              value={initial.headingFontWeight}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Font Size</CardTitle>
            <CardDescription>
              Heading sizes are multipliers of the default size. Body text uses
              a pixel size.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <RangeControl
              label="Body Text"
              name="bodyFontSize"
              value={initial.bodyFontSize}
              min={12}
              max={20}
              step={1}
              format={(v) => `${v}px`}
            />
            <RangeControl
              label="Caption / Footer Text"
              name="smallFontSize"
              value={initial.smallFontSize}
              min={11}
              max={18}
              step={1}
              format={(v) => `${v}px`}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <RangeControl
                label="Hero Main Headline"
                name="h1FontSize"
                value={initial.h1FontSize}
                min={0.5}
                max={1.5}
                step={0.05}
                format={(v) => `${v.toFixed(2)}×`}
              />
              <RangeControl
                label="Hero Highlight / Section Titles"
                name="h2FontSize"
                value={initial.h2FontSize}
                min={0.5}
                max={1.5}
                step={0.05}
                format={(v) => `${v.toFixed(2)}×`}
              />
              <RangeControl
                label="Card Titles"
                name="h3FontSize"
                value={initial.h3FontSize}
                min={0.5}
                max={1.5}
                step={0.05}
                format={(v) => `${v.toFixed(2)}×`}
              />
              <RangeControl
                label="Subheadings"
                name="h4FontSize"
                value={initial.h4FontSize}
                min={0.5}
                max={1.5}
                step={0.05}
                format={(v) => `${v.toFixed(2)}×`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spacing</CardTitle>
            <CardDescription>
              Letter spacing and line height apply to body text globally.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <RangeControl
              label="Letter Spacing"
              name="letterSpacing"
              value={initial.letterSpacing}
              min={0}
              max={0.2}
              step={0.01}
              format={(v) => `${v.toFixed(2)}em`}
            />
            <RangeControl
              label="Line Height"
              name="lineHeight"
              value={initial.lineHeight}
              min={1}
              max={2.2}
              step={0.05}
              format={(v) => v.toFixed(2)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Color & Gradient Text</CardTitle>
            <CardDescription>
              The heading color is automatically kept readable on the page
              background. Gradient colors drive every gold-gradient headline
              (hero, section titles).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorControl
              label="Heading Text Color"
              name="headingTextColor"
              value={initial.headingTextColor}
            />
            <div className="flex items-center gap-2">
              <ColorControl
                label="Gradient Start"
                name="gradientTextStart"
                value={initial.gradientTextStart}
              />
              <ColorControl
                label="Gradient End"
                name="gradientTextEnd"
                value={initial.gradientTextEnd}
              />
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-[var(--jaiguru-gradient-text-1,#facc15)] to-[var(--jaiguru-gradient-text-3,#f97316)] bg-clip-text text-transparent">
                  Preview of gradient text
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} className="min-w-[150px]">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Typography
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          disabled={resetting}
        >
          {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </form>
  );
}