"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type MacroRow = {
  label: string;
  value: number;
  goal: number;
  tone: "protein" | "carbs" | "fat";
};

const toneDot: Record<MacroRow["tone"], string> = {
  protein: "bg-[hsl(var(--text-protein-raw))]",
  carbs: "bg-[hsl(var(--text-carbs-raw))]",
  fat: "bg-[hsl(var(--text-fat-raw))]",
};

type HeroTodayCardProps = {
  consumed: number;
  goal: number;
  macros: MacroRow[];
};

export function HeroTodayCard({ consumed, goal, macros }: HeroTodayCardProps) {
  const reduceMotion = useReducedMotion();
  const pct = goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <section
      className="relative overflow-hidden rounded-[1.75rem] bg-[hsl(var(--hero))] p-5 text-[hsl(var(--hero-foreground))] shadow-[var(--shadow-md)] sm:p-6"
      aria-label="Calories today"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/50 blur-2xl dark:bg-primary/10"
      />

      <div className="relative flex items-center gap-4 sm:gap-6">
        <div className="relative h-[8.5rem] w-[8.5rem] shrink-0 sm:h-40 sm:w-40">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140" aria-hidden>
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="hsl(var(--primary) / 0.15)"
              strokeWidth="12"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={reduceMotion ? false : { strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[1.65rem] font-bold tabular-nums tracking-tight sm:text-3xl">
              {Math.round(consumed)}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              kcal
            </p>
            <p className="mt-0.5 text-xs font-semibold text-primary">{pct}%</p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight">Calories today</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Goal {goal.toLocaleString()} kcal
          </p>
          <ul className="mt-4 space-y-3">
            {macros.map((macro) => {
              const macroPct =
                macro.goal > 0
                  ? Math.min(100, Math.round((macro.value / macro.goal) * 100))
                  : 0;
              return (
                <li key={macro.label}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          toneDot[macro.tone]
                        )}
                      />
                      {macro.label}
                    </span>
                    <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                      {Math.round(macro.value)}/{macro.goal}g
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/70 dark:bg-black/25">
                    <div
                      className={cn("h-full rounded-full", toneDot[macro.tone])}
                      style={{ width: `${macroPct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
