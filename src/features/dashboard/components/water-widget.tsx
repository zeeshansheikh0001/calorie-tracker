"use client";

import { Droplets, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";

type WaterWidgetProps = {
  ml: number;
  goalMl: number;
  onAdd: (ml: number) => void;
  pending?: boolean;
};

export function WaterWidget({ ml, goalMl, onAdd, pending }: WaterWidgetProps) {
  const pct = goalMl > 0 ? Math.min(100, Math.round((ml / goalMl) * 100)) : 0;

  return (
    <SurfaceCard tone="water" elevated className="text-white">
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              Hydration
            </p>
            <p className="font-display mt-1 text-3xl font-medium tabular-nums tracking-tight">
              {(ml / 1000).toFixed(1)}
              <span className="text-lg text-white/70"> L</span>
            </p>
            <p className="mt-1 text-xs text-white/70">
              Goal {(goalMl / 1000).toFixed(1)}L · {pct}%
            </p>
          </div>
          <Droplets className="h-6 w-6 text-white/80" strokeWidth={1.5} />
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="flex-1 rounded-xl border-0 bg-white/15 text-white hover:bg-white/25"
            disabled={pending || ml <= 0}
            onClick={() => onAdd(-250)}
            aria-label="Remove 250 milliliters"
          >
            <Minus className="h-4 w-4" /> 250
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="flex-1 rounded-xl border-0 bg-white text-[hsl(205_65%_28%)] hover:bg-white/90"
            disabled={pending}
            onClick={() => onAdd(250)}
            aria-label="Add 250 milliliters"
          >
            <Plus className="h-4 w-4" /> 250ml
          </Button>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl"
      />
    </SurfaceCard>
  );
}
