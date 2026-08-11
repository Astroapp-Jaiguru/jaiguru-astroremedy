"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, RotateCcw, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  OVERRIDE_FONT_OPTIONS,
  OVERRIDE_FONT_WEIGHTS,
  overrideActive,
  type TypographyOverride,
} from "@/lib/typography-overrides";

interface PanelProps {
  /** Override map key, e.g. "headlineLine2". */
  field: string;
  /** Human-readable field name shown in the panel. */
  label: string;
  /** Persisted override (from the section's typography map). */
  override?: TypographyOverride;
  /**
   * "form" renders hidden inputs named `typography[<field>][<prop>]` for
   * server-action forms. "controlled" reports changes via onValueChange
   * (used by the FAQ manager, which calls its action directly).
   */
  mode?: "form" | "controlled";
  onValueChange?: (value: TypographyOverride | undefined) => void;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: string) => void;
}) {
  const n = Number(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
          {value === "" ? "Global" : format(n)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value === "" ? min : n}
        onChange={(e) => onChange(e.target.value)}
        className="w-full accent-[var(--jaiguru-primary,#4c1d95)]"
      />
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        {value !== "" && (
          <span className="font-mono text-[11px]">{value}</span>
        )}
        <input
          type="color"
          value={value === "" ? "#000000" : value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded border bg-transparent p-0.5"
        />
      </div>
    </div>
  );
}

/**
 * Collapsible "Typography Override" panel for a single text field. Local
 * overrides win over the global Typography system on the public site.
 */
export function TypographyOverridePanel({
  field,
  label,
  override,
  mode = "form",
  onValueChange,
}: PanelProps) {
  const [open, setOpen] = useState(false);
  const [o, setO] = useState<TypographyOverride>(override ?? {});
  const [active, setActive] = useState(() => overrideActive(override));
  const prevOverride = useRef(override);

  useEffect(() => {
    if (prevOverride.current !== override) {
      prevOverride.current = override;
      setO(override ?? {});
      setActive(overrideActive(override));
    }
  }, [override]);

  function update(patch: Partial<TypographyOverride>) {
    const next = { ...o, ...patch };
    const clean: TypographyOverride = {};
    for (const [k, v] of Object.entries(next)) {
      if (v !== "" && v !== undefined) clean[k as keyof TypographyOverride] = v as never;
    }
    setO(clean);
    setActive(overrideActive(clean));
    if (mode === "controlled") {
      onValueChange?.(overrideActive(clean) ? clean : undefined);
    }
  }

  function reset() {
    setO({});
    setActive(false);
    if (mode === "controlled") onValueChange?.(undefined);
  }

  const inputName = (prop: string) =>
    mode === "form" ? `typography[${field}][${prop}]` : undefined;

  return (
    <div className="mt-1.5 rounded-lg border border-dashed border-border/70">
      <div className="flex items-center justify-end gap-2 px-2 py-1">
        {active && (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-300">
            Local Override Active
          </Badge>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-expanded={open}
        >
          <Type className="h-3.5 w-3.5" />
          Typography Override
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-dashed border-border/60 p-3">
          <p className="text-xs text-muted-foreground">
            Override for <strong className="text-foreground">{label}</strong>.
            Leave blank to use the global Typography settings.
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Font Family
            </Label>
            <select
              name={inputName("fontFamily")}
              value={o.fontFamily ?? ""}
              onChange={(e) => update({ fontFamily: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="">Global default</option>
              {OVERRIDE_FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Font Weight
            </Label>
            <select
              name={inputName("fontWeight")}
              value={o.fontWeight ?? ""}
              onChange={(e) => update({ fontWeight: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="">Global default</option>
              {OVERRIDE_FONT_WEIGHTS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <Slider
            label="Font Size"
            value={o.fontSize === undefined ? "" : String(o.fontSize)}
            min={8}
            max={96}
            step={1}
            format={(v) => `${v}px`}
            onChange={(v) => update({ fontSize: Number(v) })}
          />

          <Slider
            label="Letter Spacing"
            value={o.letterSpacing === undefined ? "" : String(o.letterSpacing)}
            min={0}
            max={0.2}
            step={0.01}
            format={(v) => `${v.toFixed(2)}em`}
            onChange={(v) => update({ letterSpacing: Number(v) })}
          />

          <Slider
            label="Line Height"
            value={o.lineHeight === undefined ? "" : String(o.lineHeight)}
            min={1}
            max={2.2}
            step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={(v) => update({ lineHeight: Number(v) })}
          />

          <div className="space-y-1.5">
            <ColorRow
              label="Text Color"
              value={o.textColor ?? ""}
              onChange={(v) => update({ textColor: v })}
            />
            <p className="text-[11px] text-muted-foreground">
              Setting both gradient colors below turns this text into gradient
              text (and overrides Text Color).
            </p>
            <div className="grid grid-cols-2 gap-2">
              <ColorRow
                label="Gradient Start"
                value={o.gradientStart ?? ""}
                onChange={(v) => update({ gradientStart: v })}
              />
              <ColorRow
                label="Gradient End"
                value={o.gradientEnd ?? ""}
                onChange={(v) => update({ gradientEnd: v })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reset}
              className="text-xs"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset to Global Default
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
