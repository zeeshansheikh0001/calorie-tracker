"use client";

import { Sparkles } from "lucide-react";
import type { CoachInsight } from "@/lib/wellness/scores";
import { cn } from "@/lib/utils";

const toneStyles: Record<CoachInsight["tone"], string> = {
  celebrate: "border-primary/20 bg-primary/5",
  nudge: "border-primary/25 bg-white dark:bg-card",
  tip: "border-border/70 bg-muted/40",
  streak: "border-gold/30 bg-gold/10",
};

type CoachPanelProps = {
  insights: CoachInsight[];
};

export function CoachPanel({ insights }: CoachPanelProps) {
  const lead = insights[0];
  const rest = insights.slice(1);
  if (!lead) return null;

  return (
    <section className="rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
          <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            AI Nutrition Coach
          </p>
          <p className="text-sm font-bold tracking-tight">Personal insight</p>
        </div>
      </div>

      <p className="mt-4 text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
        {lead.message}
      </p>

      {rest.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {rest.map((insight) => (
            <li
              key={insight.id}
              className={cn(
                "rounded-2xl border px-3.5 py-3 text-sm leading-relaxed",
                toneStyles[insight.tone]
              )}
            >
              {insight.message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
