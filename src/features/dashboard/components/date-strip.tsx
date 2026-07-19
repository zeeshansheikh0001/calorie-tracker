"use client";

import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

type DateStripProps = {
  selected: Date;
  onSelect?: (date: Date) => void;
};

export function DateStrip({ selected, onSelect }: DateStripProps) {
  const start = startOfWeek(selected, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="listbox"
      aria-label="Select day"
    >
      {days.map((day) => {
        const active = isSameDay(day, selected);
        return (
          <button
            key={day.toISOString()}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onSelect?.(day)}
            className={cn(
              "flex min-w-[3.25rem] flex-col items-center rounded-2xl px-2.5 py-2.5 transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "bg-card text-muted-foreground shadow-[var(--shadow-sm)] hover:text-foreground"
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
              {format(day, "EEE")}
            </span>
            <span className="mt-1 text-sm font-bold tabular-nums">
              {format(day, "d")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
