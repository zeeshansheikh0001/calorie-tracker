"use client";

import { Activity, Moon, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";

type LifestyleWidgetsProps = {
  sleepHours: number;
  activityMinutes: number;
  weightKg?: number;
  weightDelta?: number | null;
  onSleepAdjust: (delta: number) => void;
  onActivityAdd: () => void;
  onWeightLog: () => void;
};

export function LifestyleWidgets({
  sleepHours,
  activityMinutes,
  weightKg,
  weightDelta,
  onSleepAdjust,
  onActivityAdd,
  onWeightLog,
}: LifestyleWidgetsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <SurfaceCard className="p-3.5 sm:p-4">
        <Moon
          className="mb-3 h-4 w-4 text-[hsl(var(--sleep))]"
          strokeWidth={1.75}
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Sleep
        </p>
        <p className="font-display mt-1 text-2xl font-medium tabular-nums">
          {sleepHours || "—"}
          {sleepHours ? (
            <span className="text-sm text-muted-foreground">h</span>
          ) : null}
        </p>
        <div className="mt-3 flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 flex-1 rounded-lg px-0 text-xs"
            onClick={() => onSleepAdjust(-0.5)}
            aria-label="Decrease sleep"
          >
            −
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 flex-1 rounded-lg px-0 text-xs"
            onClick={() => onSleepAdjust(0.5)}
            aria-label="Increase sleep"
          >
            +
          </Button>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-3.5 sm:p-4">
        <Activity
          className="mb-3 h-4 w-4 text-[hsl(var(--activity))]"
          strokeWidth={1.75}
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Move
        </p>
        <p className="font-display mt-1 text-2xl font-medium tabular-nums">
          {activityMinutes}
          <span className="text-sm text-muted-foreground">m</span>
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3 h-7 w-full rounded-lg text-xs"
          onClick={onActivityAdd}
        >
          +15 min
        </Button>
      </SurfaceCard>

      <SurfaceCard className="p-3.5 sm:p-4">
        <Scale className="mb-3 h-4 w-4 text-primary" strokeWidth={1.75} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Weight
        </p>
        <p className="font-display mt-1 text-2xl font-medium tabular-nums">
          {weightKg ? Math.round(weightKg * 10) / 10 : "—"}
          {weightKg ? (
            <span className="text-sm text-muted-foreground">kg</span>
          ) : null}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {weightDelta == null
            ? "Tap to log"
            : `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2 h-7 w-full rounded-lg text-xs"
          onClick={onWeightLog}
        >
          Update
        </Button>
      </SurfaceCard>
    </div>
  );
}
