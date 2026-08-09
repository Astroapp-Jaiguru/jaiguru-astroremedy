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
import { THEME_PRESETS } from "@/config/themes";
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
  step = 1,
  suffix = "px",
}: {
  label: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
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
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#4C1D95]"
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

function GradientField({
  label,
  name,
  start,
  end,
  onChangeStart,
  onChangeEnd,
}: {
  label: string;
  name: string;
  start: string;
  end: string;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
}) {
  const safeStart = /^#[0-9a-fA-F]{6}$/.test(start) ? start : "#0f172a";
  const safeEnd = /^#[0-9a-fA-F]{6}$/.test(end) ? end : "#4c1d95";
  return (
    <div>
      <Label>{label}</Label>
      <div
        className="mt-2 h-10 rounded-lg border border-input"
        style={{ background: `linear-gradient(135deg, ${safeStart} 0%, ${safeEnd} 100%)` }}
        aria-label={`${label} preview`}
      />
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Start
          </span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={safeStart}
              onChange={(e) => onChangeStart(e.target.value)}
              className="h-9 w-11 cursor-pointer rounded-md border border-input bg-transparent p-1"
            />
            <input
              type="hidden"
              name={`${name}Start`}
              value={start}
            />
            <Input
              value={start}
              onChange={(e) => onChangeStart(e.target.value)}
              spellCheck={false}
              className="font-mono"
            />
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            End
          </span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={safeEnd}
              onChange={(e) => onChangeEnd(e.target.value)}
              className="h-9 w-11 cursor-pointer rounded-md border border-input bg-transparent p-1"
            />
            <input
              type="hidden"
              name={`${name}End`}
              value={end}
            />
            <Input
              value={end}
              onChange={(e) => onChangeEnd(e.target.value)}
              spellCheck={false}
              className="font-mono"
            />
          </div>
        </div>
      </div>
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Select Active Theme</CardTitle>
            <CardDescription>
              Pick one of the curated preset themes to instantly fill the
              color fields below, then press “Save Theme” to apply it to the
              whole website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {THEME_PRESETS.map((preset) => {
                const active =
                  settings.primary === preset.theme.primary &&
                  settings.secondary === preset.theme.secondary &&
                  settings.accent === preset.theme.accent;
                const swatches = [
                  preset.theme.primary ?? "#4C1D95",
                  preset.theme.secondary ?? "#312E81",
                  preset.theme.accent ?? "#FACC15",
                  preset.theme.accent2 ?? "#D4AF37",
                ];
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        ...preset.theme,
                      }))
                    }
                    className={`group rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-input hover:border-primary/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {swatches.map((c) => (
                        <span
                          key={c}
                          className="h-5 w-5 rounded-full border border-black/10"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <p className="mt-2.5 text-sm font-semibold">
                      {preset.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {preset.description}
                    </p>
                    <span
                      className={`mt-2.5 inline-block text-xs font-semibold ${
                        active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      }`}
                    >
                      {active ? "Currently applied" : "Apply theme"}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Colors</CardTitle>
            <CardDescription>
              Global background, text, accent and CTA colors. The preset
              themes above are shortcuts that fill these fields.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg bg-muted/60 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Global
            </div>
            <ColorField
              label="Page Background"
              name="pageBackground"
              value={settings.pageBackground}
              onChange={(v) => set("pageBackground", v)}
            />
            <ColorField
              label="Primary Text Color"
              name="primaryTextColor"
              value={settings.primaryTextColor}
              onChange={(v) => set("primaryTextColor", v)}
            />
            <ColorField
              label="Secondary Text Color"
              name="secondaryTextColor"
              value={settings.secondaryTextColor}
              onChange={(v) => set("secondaryTextColor", v)}
            />
            <div className="rounded-lg bg-muted/60 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Accents & CTAs
            </div>
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
              label="Accent Color 1"
              name="accent"
              value={settings.accent}
              onChange={(v) => set("accent", v)}
            />
            <ColorField
              label="Accent Color 2"
              name="accent2"
              value={settings.accent2}
              onChange={(v) => set("accent2", v)}
            />
            <ColorField
              label="Accent Color 3"
              name="accent3"
              value={settings.accent3}
              onChange={(v) => set("accent3", v)}
            />
            <ColorField
              label="WhatsApp Button Color"
              name="whatsapp"
              value={settings.whatsapp}
              onChange={(v) => set("whatsapp", v)}
            />
            <ColorField
              label="Primary CTA Button Color"
              name="ctaPrimary"
              value={settings.ctaPrimary}
              onChange={(v) => set("ctaPrimary", v)}
            />
            <div className="rounded-lg bg-muted/60 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cards
            </div>
            <ColorField
              label="Card Background Color"
              name="cardBackground"
              value={settings.cardBackground}
              onChange={(v) => set("cardBackground", v)}
            />
            <ColorField
              label="Card Border Color"
              name="cardBorder"
              value={settings.cardBorder}
              onChange={(v) => set("cardBorder", v)}
            />
            <ColorField
              label="Emerald"
              name="emerald"
              value={settings.emerald}
              onChange={(v) => set("emerald", v)}
            />
            <ColorField
              label="Deep Navy"
              name="deepNavy"
              value={settings.deepNavy}
              onChange={(v) => set("deepNavy", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gradients</CardTitle>
            <CardDescription>
              Pick start and end colors for the main gradients — a live
              preview is shown above each pair before you save.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <GradientField
              label="Hero Background"
              name="heroGradient"
              start={settings.heroGradientStart}
              end={settings.heroGradientEnd}
              onChangeStart={(v) => set("heroGradientStart", v)}
              onChangeEnd={(v) => set("heroGradientEnd", v)}
            />
            <GradientField
              label="Top Header Bar"
              name="topbarGradient"
              start={settings.topbarGradientStart}
              end={settings.topbarGradientEnd}
              onChangeStart={(v) => set("topbarGradientStart", v)}
              onChangeEnd={(v) => set("topbarGradientEnd", v)}
            />
            <GradientField
              label="Footer"
              name="footerGradient"
              start={settings.footerGradientStart}
              end={settings.footerGradientEnd}
              onChangeStart={(v) => set("footerGradientStart", v)}
              onChangeEnd={(v) => set("footerGradientEnd", v)}
            />
            <GradientField
              label="Gold Accents"
              name="goldGradient"
              start={settings.goldGradientStart}
              end={settings.goldGradientEnd}
              onChangeStart={(v) => set("goldGradientStart", v)}
              onChangeEnd={(v) => set("goldGradientEnd", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Typography</CardTitle>
            <CardDescription>
              Font families and sizes for the whole website. Georgia and
              Arial are system fonts and need no download.
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
            <SliderField
              label="Body Font Size"
              name="bodyFontSize"
              value={settings.bodyFontSize}
              onChange={(v) => set("bodyFontSize", v)}
              min={12}
              max={20}
            />
            <SliderField
              label="Heading Size Scale"
              name="headingScale"
              value={settings.headingScale}
              onChange={(v) => set("headingScale", v)}
              min={0.8}
              max={1.3}
              step={0.05}
              suffix="x"
            />
            <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              Heading Size Scale multiplies every heading (1 = default
              size). Font changes are applied instantly on the public
              website after saving.
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
            <CardTitle className="text-lg">Section Colors</CardTitle>
            <CardDescription>
              Background and text colors for key sections: legal pages,
              contact form fields and the 20+ years experience banner.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg bg-muted/60 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Legal Pages
            </div>
            <ColorField
              label="Page Title Color"
              name="legalTitleColor"
              value={settings.legalTitleColor}
              onChange={(v) => set("legalTitleColor", v)}
            />
            <ColorField
              label="Breadcrumb Color"
              name="legalBreadcrumbColor"
              value={settings.legalBreadcrumbColor}
              onChange={(v) => set("legalBreadcrumbColor", v)}
            />
            <ColorField
              label="Content Card Background"
              name="legalCardBackground"
              value={settings.legalCardBackground}
              onChange={(v) => set("legalCardBackground", v)}
            />
            <ColorField
              label="Content Card Border"
              name="legalCardBorder"
              value={settings.legalCardBorder}
              onChange={(v) => set("legalCardBorder", v)}
            />
            <ColorField
              label="Body Text Color"
              name="legalTextColor"
              value={settings.legalTextColor}
              onChange={(v) => set("legalTextColor", v)}
            />
            <ColorField
              label="Heading Text Color"
              name="legalHeadingColor"
              value={settings.legalHeadingColor}
              onChange={(v) => set("legalHeadingColor", v)}
            />
            <div className="rounded-lg bg-muted/60 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contact Form
            </div>
            <ColorField
              label="Form Card Background"
              name="contactFormSurface"
              value={settings.contactFormSurface}
              onChange={(v) => set("contactFormSurface", v)}
            />
            <ColorField
              label="Field Label Color"
              name="contactFormLabelColor"
              value={settings.contactFormLabelColor}
              onChange={(v) => set("contactFormLabelColor", v)}
            />
            <div className="rounded-lg bg-muted/60 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Experience Banner
            </div>
            <ColorField
              label="Banner Background"
              name="experienceBannerBackground"
              value={settings.experienceBannerBackground}
              onChange={(v) => set("experienceBannerBackground", v)}
            />
            <ColorField
              label="Banner Text Color"
              name="experienceBannerTextColor"
              value={settings.experienceBannerTextColor}
              onChange={(v) => set("experienceBannerTextColor", v)}
            />
            <ColorField
              label="Banner Border Color"
              name="experienceBannerBorder"
              value={settings.experienceBannerBorder}
              onChange={(v) => set("experienceBannerBorder", v)}
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
                background: `linear-gradient(135deg, ${settings.heroGradientStart} 0%, ${settings.heroGradientEnd} 100%)`,
                borderRadius: `${settings.cardRadius}px`,
              }}
            >
              <p
                className="font-display text-lg font-bold"
                style={{
                  color: settings.accent,
                  fontSize: `${Math.round(18 * settings.headingScale)}px`,
                }}
              >
                JAIGURU ASTROREMEDY
              </p>
              <p
                className="mt-1 text-sm text-white/85"
                style={{ fontSize: `${settings.bodyFontSize}px` }}
              >
                Theme preview with your chosen colors.
              </p>
              <span
                className="mt-3 inline-flex items-center rounded-[var(--jaiguru-btn-radius)] px-4 py-2 text-xs font-semibold text-slate-900"
                style={{
                  background: `linear-gradient(90deg, ${settings.goldGradientStart} 0%, ${settings.goldGradientEnd} 100%)`,
                  borderRadius: pill
                    ? "9999px"
                    : `${settings.buttonRadius}px`,
                }}
              >
                Book Consultation
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Top Header Bar
                </p>
                <div
                  className="mt-1.5 h-8 rounded-lg border border-input"
                  style={{
                    background: `linear-gradient(90deg, ${settings.topbarGradientStart} 0%, ${settings.topbarGradientEnd} 100%)`,
                  }}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Footer
                </p>
                <div
                  className="mt-1.5 h-8 rounded-lg border border-input"
                  style={{
                    background: `linear-gradient(90deg, ${settings.footerGradientStart} 0%, ${settings.footerGradientEnd} 100%)`,
                  }}
                />
              </div>
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