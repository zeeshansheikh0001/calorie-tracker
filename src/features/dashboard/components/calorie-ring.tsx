"use client";

import { motion, useReducedMotion } from "framer-motion";

type CalorieRingProps = {
  consumed: number;
  goal: number;
};

export function CalorieRing({ consumed, goal }: CalorieRingProps) {
  const reduceMotion = useReducedMotion();
  const safeGoal = goal > 0 ? goal : 1;
  const pct = Math.min(100, Math.round((consumed / safeGoal) * 100));
  const remaining = Math.max(0, goal - consumed);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140" aria-hidden>
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="11"
        />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="url(#calorieRingGradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="calorieRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(170 45% 42%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[2.5rem] font-semibold tracking-tight tabular-nums leading-none">
          {Math.round(consumed)}
        </p>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          of {goal.toLocaleString()} kcal
        </p>
        <p className="mt-2 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
          {remaining.toLocaleString()} remaining
        </p>
      </div>
      <span className="sr-only">
        {consumed} of {goal} calories consumed, {remaining} remaining
      </span>
    </div>
  );
}
