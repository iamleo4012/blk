"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Preset =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "custom";

const PRESET_LABELS: Array<{ id: Preset; label: string }> = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 Days" },
  { id: "last30", label: "Last 30 Days" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fromIsoDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function label(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function presetRange(id: Preset, today: Date): { from: Date; to: Date } | null {
  switch (id) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = addDays(today, -1);
      return { from: y, to: y };
    }
    case "last7":
      return { from: addDays(today, -6), to: today };
    case "last30":
      return { from: addDays(today, -29), to: today };
    case "thisMonth":
      return { from: startOfMonth(today), to: today };
    case "lastMonth": {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const to = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from, to };
    }
    default:
      return null;
  }
}

function MonthGrid({
  month,
  draftFrom,
  draftTo,
  onPick,
}: {
  month: Date;
  draftFrom: Date;
  draftTo: Date;
  onPick: (d: Date) => void;
}) {
  const cells: Date[] = [];
  const first = startOfMonth(month);
  const lead = first.getDay();
  for (let i = 0; i < lead; i++)
    cells.push(new Date(month.getFullYear(), month.getMonth(), -lead + i + 1));
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++)
    cells.push(new Date(month.getFullYear(), month.getMonth(), i));

  return (
    <div className="min-w-[248px]">
      <p className="text-center text-[16px] font-bold text-charcoal">
        {month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
      </p>
      <div className="mt-3 grid grid-cols-7 text-center text-[12px] font-semibold text-charcoal/50">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === month.getMonth();
          const inRange = d >= draftFrom && d <= draftTo;
          const isEnd = sameDay(d, draftFrom) || sameDay(d, draftTo);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(d)}
              className={`mx-auto my-[2px] flex h-[34px] w-[34px] items-center justify-center rounded-full text-[14px] transition ${
                !inMonth
                  ? "text-charcoal/25 hover:bg-[#F1F2F6]"
                  : isEnd
                    ? "bg-accent font-bold text-white"
                    : inRange
                      ? "bg-accent-soft font-semibold text-charcoal"
                      : "text-charcoal hover:bg-[#F1F2F6]"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Expanded date-range picker (Upgrade: advanced picker).
 * Preset ranges + dual calendar + From/To inputs + Cancel/Apply.
 * Draft state stays separate from the applied range until Apply.
 */
export default function DateRangePicker({
  from,
  to,
  onApply,
}: {
  from: Date;
  to: Date;
  onApply: (from: Date, to: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<Preset>("custom");
  const [draftFrom, setDraftFrom] = useState<Date>(from);
  const [draftTo, setDraftTo] = useState<Date>(to);
  const [leftMonth, setLeftMonth] = useState<Date>(startOfMonth(from));
  const [rightMonth, setRightMonth] = useState<Date>(startOfMonth(new Date(from.getFullYear(), from.getMonth() + 1, 1)));
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function openPicker() {
    setOpen(true);
    setDraftFrom(from);
    setDraftTo(to);
    setLeftMonth(startOfMonth(from));
    setRightMonth(startOfMonth(new Date(from.getFullYear(), from.getMonth() + 1, 1)));
    setPreset(
      sameDay(from, to) && sameDay(from, startOfDay(new Date())) ? "today" : "custom",
    );
  }

  function pick(d: Date) {
    setPreset("custom");
    setDraftFrom((prevFrom) => {
      // Restart the range when clicking before the current start, or when
      // both ends already match (single-day range chosen again).
      if (d < prevFrom || sameDay(prevFrom, draftTo)) {
        setDraftTo(d);
        return d;
      }
      setDraftTo(d);
      return prevFrom;
    });
  }

  function choosePreset(id: Preset) {
    setPreset(id);
    const range = presetRange(id, startOfDay(new Date()));
    if (range) {
      setDraftFrom(range.from);
      setDraftTo(range.to);
      setLeftMonth(startOfMonth(range.from));
      setRightMonth(
        startOfMonth(new Date(range.from.getFullYear(), range.from.getMonth() + 1, 1)),
      );
    }
  }

  function shiftMonths(delta: number) {
    setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() + delta, 1));
    setRightMonth(new Date(rightMonth.getFullYear(), rightMonth.getMonth() + delta, 1));
  }

  const detectedPreset = useMemo<Preset>(() => {
    const today = startOfDay(new Date());
    for (const { id } of PRESET_LABELS) {
      if (id === "custom") continue;
      const r = presetRange(id, today);
      if (r && sameDay(r.from, draftFrom) && sameDay(r.to, draftTo)) return id;
    }
    return "custom";
  }, [draftFrom, draftTo]);

  return (
    <div className="relative" ref={popRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-expanded={open}
        className={`flex h-[52px] items-center gap-[12px] rounded-[14px] border px-[20px] text-[17px] font-semibold text-charcoal shadow-[0_1px_4px_rgba(30,41,82,0.06)] transition ${
          open ? "border-accent" : "border-[#E4E6F0] hover:border-[#c9cdda]"
        }`}
      >
        <CalendarDays className="h-[22px] w-[22px]" strokeWidth={1.9} />
        {label(from)} – {label(to)}
        {open ? (
          <ChevronUp className="h-[20px] w-[20px] text-charcoal/60" strokeWidth={2.2} />
        ) : (
          <ChevronDown className="h-[20px] w-[20px] text-charcoal/60" strokeWidth={2.2} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[60px] z-40 flex gap-[18px] rounded-[20px] border border-[#E4E6F0] bg-white p-[18px] shadow-[0_18px_50px_rgba(20,26,46,0.18)]">
          {/* Presets */}
          <div className="w-[168px] shrink-0">
            <p className="mb-[10px] text-[16px] font-bold text-charcoal">
              Select Date Range
            </p>
            <div className="flex flex-col gap-[7px]">
              {PRESET_LABELS.map((p) => {
                const active = detectedPreset === p.id || preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => choosePreset(p.id)}
                    className={`w-full rounded-[10px] border px-[14px] py-[9px] text-start text-[15px] font-semibold transition ${
                      active
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-[#E4E6F0] bg-white text-charcoal hover:bg-[#F7F8FC]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual calendar */}
          <div>
            <div className="flex items-start gap-[10px]">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonths(-1)}
                className="mt-[2px] flex h-9 w-9 items-center justify-center rounded-full text-charcoal hover:bg-[#F1F2F6]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <MonthGrid month={leftMonth} draftFrom={draftFrom} draftTo={draftTo} onPick={pick} />
              <MonthGrid month={rightMonth} draftFrom={draftFrom} draftTo={draftTo} onPick={pick} />
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonths(1)}
                className="mt-[2px] flex h-9 w-9 items-center justify-center rounded-full text-charcoal hover:bg-[#F1F2F6]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* From / To + actions */}
            <div className="mt-[12px] flex items-center justify-between gap-[10px] border-t border-[#EEF0F6] pt-[14px]">
              <div className="flex items-center gap-[10px]">
                <label className="flex items-center gap-[6px] rounded-full border border-[#E4E6F0] px-[12px] py-[7px] text-[14px] font-semibold text-charcoal">
                  From
                  <input
                    type="date"
                    value={toIsoDate(draftFrom)}
                    max={toIsoDate(draftTo)}
                    onChange={(e) => {
                      const d = fromIsoDate(e.target.value);
                      if (Number.isNaN(d.getTime())) return;
                      setPreset("custom");
                      setDraftFrom(d);
                      setLeftMonth(startOfMonth(d));
                    }}
                    className="w-[120px] bg-transparent text-[14px] font-semibold text-charcoal focus:outline-none"
                  />
                </label>
                <label className="flex items-center gap-[6px] rounded-full border border-[#E4E6F0] px-[12px] py-[7px] text-[14px] font-semibold text-charcoal">
                  To
                  <input
                    type="date"
                    value={toIsoDate(draftTo)}
                    min={toIsoDate(draftFrom)}
                    onChange={(e) => {
                      const d = fromIsoDate(e.target.value);
                      if (Number.isNaN(d.getTime())) return;
                      setPreset("custom");
                      setDraftTo(d);
                      setRightMonth(startOfMonth(d));
                    }}
                    className="w-[120px] bg-transparent text-[14px] font-semibold text-charcoal focus:outline-none"
                  />
                </label>
              </div>
              <div className="flex items-center gap-[10px]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[#E4E6F0] px-[18px] py-[9px] text-[14px] font-bold text-charcoal transition hover:bg-[#F7F8FC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onApply(draftFrom < draftTo ? draftFrom : draftTo, draftFrom < draftTo ? draftTo : draftFrom);
                    setOpen(false);
                  }}
                  className="rounded-full bg-accent px-[22px] py-[9px] text-[14px] font-bold text-white transition active:scale-95"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
