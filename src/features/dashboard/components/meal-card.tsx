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
  isLast?: boolean;
};

function MacroChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", tone)} aria-hidden />
      <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
        {label}
      </span>
      {Math.round(value)}g
    </span>
  );
}

export function MealCard({
  entry,
  onDelete,
  isDeleting,
  isLast,
}: MealCardProps) {
  const healthy =
    entry.protein >= 15 ||
    entry.calories < 450 ||
    entry.name.toLowerCase().includes("salad");

  return (
    <article className="relative flex gap-3.5">
      {/* Timeline rail */}
      <div className="relative flex w-10 shrink-0 flex-col items-center pt-1">
        <div className="z-[1] flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
          <span className="text-[13px] font-bold tabular-nums tracking-tight text-primary">
            {Math.round(entry.calories)}
          </span>
        </div>
        {!isLast ? (
          <span
            aria-hidden
            className="absolute top-12 bottom-[-0.75rem] w-px bg-gradient-to-b from-border to-transparent"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 rounded-[1.35rem] bg-muted/35 px-3.5 py-3 ring-1 ring-border/40 transition-colors hover:bg-muted/55 hover:ring-border/70">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[15px] font-semibold tracking-tight">
                {entry.name}
              </p>
              {healthy ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <Leaf className="h-3 w-3" aria-hidden />
                  Smart
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground">
              <span className="text-foreground/70">
                {mealTimeLabel(entry.timestamp)}
              </span>
              <span className="mx-1.5 text-border">·</span>
              {format(entry.timestamp, "h:mm a")}
            </p>
          </div>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${entry.name}`}
            disabled={isDeleting}
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-t border-border/40 pt-2.5">
          <MacroChip
            label="P"
            value={entry.protein}
            tone="bg-[hsl(var(--text-protein-raw))]"
          />
          <MacroChip
            label="C"
            value={entry.carbs}
            tone="bg-[hsl(var(--text-carbs-raw))]"
          />
          <MacroChip
            label="F"
            value={entry.fat}
            tone="bg-[hsl(var(--text-fat-raw))]"
          />
          <span className="ml-auto text-[11px] font-bold tabular-nums text-foreground/80">
            {Math.round(entry.calories)}{" "}
            <span className="font-semibold text-muted-foreground">kcal</span>
          </span>
        </div>
      </div>
    </article>
  );
}
