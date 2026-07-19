"use client";

import { format } from "date-fns";
import { Trash2, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { mealTimeLabel } from "@/lib/wellness/scores";
import type { FoodEntry } from "@/types/domain";

type MealTimelineProps = {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

export function MealTimeline({
  entries,
  onDelete,
  isDeleting,
}: MealTimelineProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="Your meal timeline is waiting"
        description="Log breakfast in under 10 seconds — photo or a quick description."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild size="sm">
              <Link href="/log-food/photo">Scan meal</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/log-food/manual">Describe</Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <SurfaceCard padded={false} elevated className="overflow-hidden">
      <ol className="relative divide-y divide-border/50">
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            className="group relative flex gap-3 px-4 py-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex w-12 flex-col items-center pt-1">
              <span className="flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]" />
              {index < entries.length - 1 ? (
                <span className="mt-1 w-px flex-1 bg-border/70" aria-hidden />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {mealTimeLabel(entry.timestamp)} ·{" "}
                    {format(entry.timestamp, "h:mm a")}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold tracking-tight">
                    {entry.name}
                  </p>
                  <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                    {Math.round(entry.calories)} kcal · P{" "}
                    {Math.round(entry.protein)} · C {Math.round(entry.carbs)} ·
                    F {Math.round(entry.fat)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  aria-label={`Delete ${entry.name}`}
                  disabled={isDeleting}
                  onClick={() => onDelete(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </SurfaceCard>
  );
}
