"use client";

import { Droplets, Footprints, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MetricTilesProps = {
  steps: number;
  stepsGoal?: number;
  waterMl: number;
  waterGoalMl: number;
  onAddSteps: () => void;
  onAddWater: () => void;
  pending?: boolean;
};

export function MetricTiles({
  steps,
  stepsGoal = 8000,
  waterMl,
  waterGoalMl,
  onAddSteps,
  onAddWater,
  pending,
}: MetricTilesProps) {
  const stepsPct = Math.min(100, Math.round((steps / stepsGoal) * 100));
  const waterPct =
    waterGoalMl > 0
      ? Math.min(100, Math.round((waterMl / waterGoalMl) * 100))
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <article className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card p-4 shadow-[var(--shadow-sm)]">
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Footprints className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            aria-label="Add 1000 steps"
            disabled={pending}
            onClick={onAddSteps}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-4 text-xs font-medium text-muted-foreground">Steps</p>
        <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
          {steps.toLocaleString()}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Goal {stepsGoal.toLocaleString()}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full bg-primary transition-all")}
            style={{ width: `${stepsPct}%` }}
          />
        </div>
      </article>

      <article className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card p-4 shadow-[var(--shadow-sm)]">
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-water/15 text-water">
            <Droplets className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            aria-label="Add 250ml water"
            disabled={pending}
            onClick={onAddWater}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-4 text-xs font-medium text-muted-foreground">Water</p>
        <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
          {(waterMl / 1000).toFixed(1)}
          <span className="text-base font-semibold text-muted-foreground">L</span>
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Goal {(waterGoalMl / 1000).toFixed(1)}L · {waterPct}%
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-water transition-all"
            style={{ width: `${waterPct}%` }}
          />
        </div>
      </article>
    </div>
  );
}
