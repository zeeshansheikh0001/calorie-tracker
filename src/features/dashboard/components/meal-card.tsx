"use client";

import { format } from "date-fns";
import { Leaf, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mealTimeLabel } from "@/lib/wellness/scores";
import type { FoodEntry } from "@/types/domain";
import { cn } from "@/lib/utils";

type MealCardProps = {
  entry: FoodEntry;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

function mealHue(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function MealCard({ entry, onDelete, isDeleting }: MealCardProps) {
  const hue = mealHue(entry.name);
  const healthy =
    entry.protein >= 15 ||
    entry.calories < 450 ||
    entry.name.toLowerCase().includes("salad");

  return (
    <article
      className={cn(
        "group flex gap-3 rounded-[1.35rem] border border-border/50 bg-card p-3 shadow-[var(--shadow-sm)] transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
      )}
    >
      <div
        className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(145deg, hsl(${hue} 55% 78%), hsl(${(hue + 40) % 360} 45% 62%))`,
        }}
        aria-hidden
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white/90 tabular-nums drop-shadow-sm">
            {Math.round(entry.calories)}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight">
              {entry.name}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {mealTimeLabel(entry.timestamp)} ·{" "}
              {format(entry.timestamp, "h:mm a")}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
            aria-label={`Delete ${entry.name}`}
            disabled={isDeleting}
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
            P {Math.round(entry.protein)}g
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
            C {Math.round(entry.carbs)}g
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
            F {Math.round(entry.fat)}g
          </span>
          {healthy ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <Leaf className="h-3 w-3" /> Smart pick
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
