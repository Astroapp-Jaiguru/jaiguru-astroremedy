"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  upsertBookingBlockAction,
  deleteBookingBlockAction,
} from "@/lib/admin/bookings/actions";
import {
  BOOKING_SLOTS_30,
  formatDateKeyLong,
  formatSlot12h,
  fromDateKey,
  toDateKey,
} from "@/lib/booking";
import { cn } from "@/lib/utils";

export interface BlockData {
  id: string;
  dateKey: string;
  allDay: boolean;
  timeSlots: string[];
  reason: string | null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function BookingCalendar({ blocks }: { blocks: BlockData[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const [today] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const view = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  const cells = useMemo(() => {
    const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      0
    ).getDate();
    const list: (string | null)[] = [];
    for (let i = 0; i < startWeekday; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(toDateKey(new Date(viewDate.getFullYear(), viewDate.getMonth(), d)));
    }
    return list;
  }, [monthOffset, today]);

  const blockByDate = useMemo(() => {
    const m = new Map<string, BlockData>();
    for (const b of blocks) m.set(b.dateKey, b);
    return m;
  }, [blocks]);

  const selectedBlock = selected ? blockByDate.get(selected) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Calendar grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">
            {MONTHS[view.getMonth()]} {view.getFullYear()}
          </p>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMonthOffset((o) => o - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMonthOffset((o) => o + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((key, i) => {
            if (!key)
              return <div key={`e-${i}`} className="aspect-square" />;
            const block = blockByDate.get(key);
            const isPast = daysBetween(key, toDateKey(today)) < 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition",
                  isPast && "opacity-30",
                  selected === key
                    ? "border-primary bg-primary/15 font-bold text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted",
                  block?.allDay && "border-red-300 bg-red-100 text-red-700",
                  block && !block.allDay && block.timeSlots.length > 0 && "border-amber-300 bg-amber-50 text-amber-700",
                  !block && "bg-background"
                )}
              >
                <span>{fromDateKey(key).getDate()}</span>
                {block ? (
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-current" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor panel */}
      <div className="rounded-xl border bg-muted/30 p-4">
        {!selected ? (
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
            Select a day on the calendar to block it — or choose which time
            slots should be unavailable.
          </p>
        ) : (
          <DayEditor
            key={selected}
            dateKey={selected}
            block={selectedBlock}
            onDeleted={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

function daysBetween(a: string, b: string): number {
  const da = fromDateKey(a).getTime();
  const db = fromDateKey(b).getTime();
  return Math.round((da - db) / (1000 * 60 * 60 * 24));
}

function DayEditor({
  dateKey,
  block,
  onDeleted,
}: {
  dateKey: string;
  block?: BlockData;
  onDeleted: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    upsertBookingBlockAction,
    undefined
  );
  const [allDay, setAllDay] = useState(block?.allDay ?? false);
  const [slots, setSlots] = useState<string[]>(
    block?.allDay ? [] : block?.timeSlots ?? []
  );
  const [deleting, setDeleting] = useState(false);

  const toggleSlot = (slot: string) =>
    setSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot].sort()
    );

  const handleDelete = async () => {
    if (!block) return;
    setDeleting(true);
    await deleteBookingBlockAction(block.id);
    setDeleting(false);
    onDeleted();
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="date" value={dateKey} />
      <input type="hidden" name="id" value={block?.id ?? ""} />
      <input type="hidden" name="timeSlots" value={JSON.stringify(slots)} />
      <input type="hidden" name="allDay" value={allDay ? "on" : ""} />

      <div>
        <p className="text-sm font-semibold">{formatDateKeyLong(dateKey)}</p>
        {block ? (
          <p className="text-xs text-muted-foreground">Editing existing block</p>
        ) : (
          <p className="text-xs text-muted-foreground">No block yet</p>
        )}
      </div>

      <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
        <input
          type="checkbox"
          checked={allDay}
          onChange={(e) => {
            setAllDay(e.target.checked);
            if (e.target.checked) setSlots([]);
          }}
          className="size-4 accent-[#4C1D95]"
        />
        Block entire day (unavailable)
      </label>

      <div>
        <Label>Blocked time slots</Label>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {BOOKING_SLOTS_30.map((slot) => (
            <label
              key={slot}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition",
                allDay && "opacity-30",
                slots.includes(slot)
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "hover:bg-muted"
              )}
            >
              <input
                type="checkbox"
                disabled={allDay}
                checked={slots.includes(slot)}
                onChange={() => toggleSlot(slot)}
                className="size-3.5 accent-red-600"
              />
              {formatSlot12h(slot)}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reason">Reason (optional, internal)</Label>
        <Input
          id="reason"
          name="reason"
          defaultValue={block?.reason ?? ""}
          placeholder="e.g. Out on tour, Diwali break"
        />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert>
          <AlertDescription>Block saved.</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Block
        </Button>
        {block ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
