"use client";

import { Trash2, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { FoodEntry } from "@/types/domain";

type MealListProps = {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

export function MealList({ entries, onDelete, isDeleting }: MealListProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="No meals yet today"
        description="Log a photo or describe what you ate — AI estimates nutrition instantly."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild size="sm">
              <Link href="/log-food/photo">Scan meal</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/log-food/manual">Describe meal</Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <SurfaceCard padded={false} className="overflow-hidden">
      <ul className="divide-y divide-border/60">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-xs font-semibold text-accent-foreground">
              {Math.round(entry.calories)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium tracking-tight">
                {entry.name}
              </p>
              <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                P {Math.round(entry.protein)}g · C {Math.round(entry.carbs)}g · F{" "}
                {Math.round(entry.fat)}g
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0 text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100 hover:text-destructive"
              aria-label={`Delete ${entry.name}`}
              disabled={isDeleting}
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
