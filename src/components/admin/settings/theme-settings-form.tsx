"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
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
  BODY_FONTS,
  HEADING_FONTS,
  THEME_DEFAULTS,
  type ThemeSettings,
} from "@/config/theme";
import {
  saveThemeAction,
  resetThemeAction,
} from "@/lib/admin/settings/actions";

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#4c1d95";
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="mt-2 flex items-center gap-3">
        <input
          id={name}
          name={name}
          type="color"
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-md border border-input bg-transparent p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="max-w-[170px] font-mono"
        />
      </div>
    </div>
  );
}

function SliderField({
  label,
  name,
  value,
  onChange,
  min,
  max,
  suffix = "px",
}: {
  label: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#4C1D95]"
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

function FontField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { id: string; label: string }[];
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ThemeSettingsForm({ initial }: { initial: ThemeSettings }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveThemeAction,
    undefined
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetThemeAction,
    undefined
  );
  const [settings, setSettings] = useState<ThemeSettings>(initial);
  const [pill, setPill] = useState(initial.buttonRadius >= 9999);
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Theme settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  useEffect(() => {
    if (resetState?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Theme settings reset to defaults");
      router.refresh();
    } else if (resetState?.error) {
      toast.error(resetState.error);
    }
  }, [resetState, router]);

  const set = (key: keyof ThemeSettings, value: string | number) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <form action={formAction}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Colors</CardTitle>
            <CardDescription>
              Primary, secondary and accent colors used across the website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ColorField
              label="Primary Color"
              name="primary"
              value={settings.primary}
              onChange={(v) => set("primary", v)}
            />
            <ColorField
              label="Secondary Color"
              name="secondary"
              value={settings.secondary}
              onChange={(v) => set("secondary", v)}
            />
            <ColorField
              label="Accent Color"
              name="accent"
              value={settings.accent}
              onChange={(v) => set("accent", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fonts</CardTitle>
            <CardDescription>
              Body and heading font families for the whole website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FontField
              label="Body Font"
              name="bodyFont"
              value={settings.bodyFont}
              onChange={(v) => set("bodyFont", v)}
              options={BODY_FONTS}
            />
            <FontField
              label="Heading Font"
              name="headingFont"
              value={settings.headingFont}
              onChange={(v) => set("headingFont", v)}
              options={HEADING_FONTS}
            />
            <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              Font changes are applied instantly on the public website after
              saving.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Radius & Spacing</CardTitle>
            <CardDescription>
              Corner radius of cards, buttons and the vertical spacing between
              page sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SliderField
              label="Global Card Radius"
              name="cardRadius"
              value={settings.cardRadius}
              onChange={(v) => set("cardRadius", v)}
              min={0}
              max={32}
            />
            <SliderField
              label="Product Card Radius"
              name="productCardRadius"
              value={settings.productCardRadius}
              onChange={(v) => set("productCardRadius", v)}
              min={0}
              max={32}
            />
            <SliderField
              label="Service Card Radius"
              name="serviceCardRadius"
              value={settings.serviceCardRadius}
              onChange={(v) => set("serviceCardRadius", v)}
              min={0}
              max={32}
            />
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="buttonRadius">Button Radius</Label>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {pill ? "Pill" : `${settings.buttonRadius}px`}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <input
                  id="buttonRadius"
                  type="range"
                  min={0}
                  max={32}
                  value={pill ? 0 : settings.buttonRadius}
                  disabled={pill}
                  onChange={(e) => set("buttonRadius", Number(e.target.value))}
                  className="w-full accent-[#4C1D95] disabled:opacity-40"
                />
                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="pill"
                    checked={pill}
                    onChange={(e) => setPill(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  Pill
                </label>
              </div>
              <input type="hidden" name="buttonRadius" value={settings.buttonRadius} />
            </div>
            <SliderField
              label="Section Spacing"
              name="sectionSpacing"
              value={settings.sectionSpacing}
              onChange={(v) => set("sectionSpacing", v)}
              min={32}
              max={160}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Preview</CardTitle>
            <CardDescription>
              How the theme looks right now on the public website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="rounded-xl border p-6 text-white"
              style={{
                background: `linear-gradient(135deg, ${settings.secondary} 0%, ${settings.primary} 100%)`,
                borderRadius: `${settings.cardRadius}px`,
              }}
            >
              <p
                className="font-display text-lg font-bold"
                style={{ color: settings.accent }}
              >
                JAIGURU ASTROREMEDY
              </p>
              <p className="mt-1 text-sm text-white/85">
                Theme preview with your chosen colors.
              </p>
              <span
                className="mt-3 inline-flex items-center rounded-[var(--jaiguru-btn-radius)] px-4 py-2 text-xs font-semibold text-slate-900"
                style={{
                  background: settings.accent,
                  borderRadius: pill
                    ? "9999px"
                    : `${settings.buttonRadius}px`,
                }}
              >
                Book Consultation
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={pending}
                className="min-w-[130px]"
              >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Theme
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={resetPending}
                onClick={() => {
                  if (
                    window.confirm(
                      "Reset all theme settings to the default design?"
                    )
                  ) {
                    setSettings({ ...THEME_DEFAULTS });
                    resetAction();
                  }
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}