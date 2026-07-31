"use client";

import { Icon3D } from "@/components/icons/icon-3d";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";

type LifestyleWidgetsProps = {
  sleepHours: number;
  activityMinutes: number;
  weightKg?: number;
  weightDelta?: number | null;
  onSleepAdjust: (delta: number) => void;
  onActivityAdjust: (delta: number) => void;
  onWeightLog: () => void;
};

function AdjustPair({
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  canDecrease,
}: {
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseLabel: string;
  increaseLabel: string;
  canDecrease: boolean;
}) {
  return (
    <div className="mt-auto flex gap-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 flex-1 rounded-lg px-0 text-xs"
        onClick={onDecrease}
        disabled={!canDecrease}
        aria-label={decreaseLabel}
      >
        −
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 flex-1 rounded-lg px-0 text-xs"
        onClick={onIncrease}
        aria-label={increaseLabel}
      >
        +
      </Button>
    </div>
  );
}

export function LifestyleWidgets({
  sleepHours,
  activityMinutes,
  weightKg,
  weightDelta,
  onSleepAdjust,
  onActivityAdjust,
  onWeightLog,
}: LifestyleWidgetsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <SurfaceCard className="flex h-full flex-col p-3.5 sm:p-4">
        <Icon3D name="sleep" size={22} className="mb-3" alt="" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Sleep
        </p>
        <p className="font-display mt-1 text-2xl font-medium tabular-nums leading-none">
          {sleepHours || "—"}
          {sleepHours ? (
            <span className="text-sm text-muted-foreground">h</span>
          ) : null}
        </p>
        <p className="mt-1 min-h-[1rem] text-[10px] text-muted-foreground">
          ±0.5 h
        </p>
        <AdjustPair
          onDecrease={() => onSleepAdjust(-0.5)}
          onIncrease={() => onSleepAdjust(0.5)}
          decreaseLabel="Decrease sleep by 0.5 hours"
          increaseLabel="Increase sleep by 0.5 hours"
          canDecrease={sleepHours > 0}
        />
      </SurfaceCard>

      <SurfaceCard className="flex h-full flex-col p-3.5 sm:p-4">
        <Icon3D name="move" size={22} className="mb-3" alt="" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Move
        </p>
        <p className="font-display mt-1 text-2xl font-medium tabular-nums leading-none">
          {activityMinutes}
          <span className="text-sm text-muted-foreground">m</span>
        </p>
        <p className="mt-1 min-h-[1rem] text-[10px] text-muted-foreground">
          ±15 min
        </p>
        <AdjustPair
          onDecrease={() => onActivityAdjust(-15)}
          onIncrease={() => onActivityAdjust(15)}
          decreaseLabel="Decrease activity by 15 minutes"
          increaseLabel="Increase activity by 15 minutes"
          canDecrease={activityMinutes > 0}
        />
      </SurfaceCard>

      <SurfaceCard className="flex h-full flex-col p-3.5 sm:p-4">
        <Icon3D name="weight" size={22} className="mb-3" alt="" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Weight
        </p>
        <p className="font-display mt-1 text-2xl font-medium tabular-nums leading-none">
          {weightKg ? Math.round(weightKg * 10) / 10 : "—"}
          {weightKg ? (
            <span className="text-sm text-muted-foreground">kg</span>
          ) : null}
        </p>
        <p className="mt-1 min-h-[1rem] text-[10px] text-muted-foreground">
          {weightDelta == null
            ? "Tap to log"
            : `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-auto h-7 w-full rounded-lg text-xs"
          onClick={onWeightLog}
        >
          Update
        </Button>
      </SurfaceCard>
    </div>
  );
}
