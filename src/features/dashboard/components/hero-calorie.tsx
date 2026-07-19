"use client";

import { motion, useReducedMotion } from "framer-motion";

type HeroCalorieProps = {
  consumed: number;
  goal: number;
  healthScore: number;
};

export function HeroCalorie({ consumed, goal, healthScore }: HeroCalorieProps) {
  const reduceMotion = useReducedMotion();
  const safeGoal = goal > 0 ? goal : 1;
  const pct = Math.min(100, Math.round((consumed / safeGoal) * 100));
  const remaining = Math.max(0, goal - consumed);
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center">
      <svg
        className="h-full w-full -rotate-90 drop-shadow-sm"
        viewBox="0 0 240 240"
        aria-hidden
      >
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="14"
          opacity="0.85"
        />
        <motion.circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="url(#nourishRing)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="nourishRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(158 48% 42%)" />
            <stop offset="55%" stopColor="hsl(168 45% 36%)" />
            <stop offset="100%" stopColor="hsl(198 60% 48%)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Today
        </p>
        <p className="font-display mt-1 text-[3.4rem] font-medium leading-none tracking-tight tabular-nums">
          {Math.round(consumed)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          of {goal.toLocaleString()} kcal
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
            {remaining.toLocaleString()} left
          </span>
          <span className="rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold text-gold">
            Score {healthScore}
          </span>
        </div>
      </div>
      <span className="sr-only">
        {consumed} of {goal} calories, health score {healthScore}
      </span>
    </div>
  );
}
