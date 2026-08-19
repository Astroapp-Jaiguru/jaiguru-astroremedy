"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SizeOptionRow {
  label: string;
  price: string;
  certificateLabel: string;
  isActive: boolean;
}

function parseRows(json: string): SizeOptionRow[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((o) => ({
      label: String(o?.label ?? ""),
      price: String(o?.price ?? ""),
      certificateLabel: String(o?.certificateLabel ?? ""),
      isActive: o?.isActive === undefined ? true : Boolean(o.isActive),
    }));
  } catch {
    return [];
  }
}

function toJson(rows: SizeOptionRow[]): string {
  const clean = rows
    .map((r) => ({
      label: r.label.trim(),
      price: Number(r.price),
      certificateLabel: r.certificateLabel.trim() || undefined,
      isActive: r.isActive,
    }))
    .filter((r) => r.label && Number.isFinite(r.price) && r.price > 0);
  return JSON.stringify(clean);
}

/**
 * Dynamic CRUD editor for product size options. Renders a hidden input named
 * "sizeOptions" carrying the JSON payload so the server action picks it up.
 */
export function SizeOptionsEditor({ initialJson }: { initialJson: string }) {
  const [rows, setRows] = useState<SizeOptionRow[]>(() => parseRows(initialJson));

  const json = useMemo(() => toJson(rows), [rows]);

  const update = (i: number, patch: Partial<SizeOptionRow>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const remove = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const add = () =>
    setRows((rs) => [
      ...rs,
      { label: "", price: "", certificateLabel: "", isActive: true },
    ]);

  return (
    <div className="space-y-3">
      <input type="hidden" name="sizeOptions" value={json} />
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          No sizes yet — click "Add Size" to create the first one.
        </p>
      ) : (
        rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              "grid grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-12",
              row.isActive ? "border-border" : "border-border/50 opacity-60"
            )}
          >
            <div className="sm:col-span-4">
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                Size Label
              </label>
              <Input
                value={row.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="1 Carat"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                Price (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={row.price}
                onChange={(e) => update(i, { price: e.target.value })}
                placeholder="4500"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                Certificate Label (optional)
              </label>
              <Input
                value={row.certificateLabel}
                onChange={(e) => update(i, { certificateLabel: e.target.value })}
                placeholder="Lab Certified with Mine Test"
              />
            </div>
            <div className="flex items-end justify-between gap-2 sm:col-span-1 sm:flex-col sm:items-center sm:justify-center">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <Checkbox
                  checked={row.isActive}
                  onCheckedChange={(c) => update(i, { isActive: Boolean(c) })}
                />
                Active
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => remove(i)}
                aria-label={`Delete size ${row.label || i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="h-4 w-4" /> Add Size
      </Button>
    </div>
  );
}