"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Leaf, Sparkles, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "detect",
    label: "Detecting food",
    detail: "Finding dishes & portion size",
    icon: Leaf,
  },
  {
    id: "macros",
    label: "Estimating macros",
    detail: "Calories, protein, carbs & fat",
    icon: Target,
  },
  {
    id: "coach",
    label: "Finishing insights",
    detail: "Preparing your nutrition card",
    icon: Zap,
  },
] as const;

const TIPS = [
  "Tip: Overhead shots are ~20% more accurate.",
  "Pro move: Include the whole plate in frame.",
  "Good light helps AI read textures better.",
  "Almost there — crunching the numbers…",
  "Fun fact: Protein keeps you fuller longer.",
  "Your streak loves consistent logging.",
];

type ScanEngagementOverlayProps = {
  active: boolean;
};

export function ScanEngagementOverlay({ active }: ScanEngagementOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setTipIndex(0);
      setProgress(8);
      return;
    }

    const stepTimer = window.setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 2200);

    const tipTimer = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 2800);

    const progressTimer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        const boost = p < 40 ? 4 : p < 70 ? 2.5 : 1;
        return Math.min(92, p + boost);
      });
    }, 180);

    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(tipTimer);
      window.clearInterval(progressTimer);
    };
  }, [active]);

  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-end bg-gradient-to-t from-black via-black/75 to-black/35 backdrop-blur-[2px]"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Floating particles */}
      {!reduceMotion
        ? Array.from({ length: 6 }).map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute h-1.5 w-1.5 rounded-full bg-primary/70"
              style={{
                left: `${12 + i * 14}%`,
                top: `${18 + (i % 3) * 12}%`,
              }}
              animate={{
                y: [0, -18, 0],
                opacity: [0.2, 0.9, 0.2],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 2.4 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))
        : null}

      {/* Center orb */}
      <div className="absolute left-1/2 top-[28%] flex -translate-x-1/2 flex-col items-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          {!reduceMotion ? (
            <>
              <motion.span
                className="absolute inset-0 rounded-full border border-primary/30"
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.span
                className="absolute inset-3 rounded-full border border-primary/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
            </>
          ) : null}
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[hsl(152_55%_32%)] shadow-[0_0_40px_rgba(52,189,98,0.45)]"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.04, 1], rotate: [0, 4, -4, 0] }
            }
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <Sparkles className="h-8 w-8 text-white" strokeWidth={1.75} />
          </motion.div>
        </div>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          AI scanning
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={STEPS[stepIndex].label}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            className="mt-2 text-center text-lg font-bold tracking-tight text-white"
          >
            {STEPS[stepIndex].label}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Engagement card */}
      <motion.div
        className="relative w-full px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        initial={reduceMotion ? false : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.3 }}
      >
        <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          {/* Progress */}
          <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
            <span className="text-white/70">Working on your meal</span>
            <span className="tabular-nums text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-300"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </div>

          {/* Steps */}
          <ul className="space-y-2.5">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const done = index < stepIndex;
              const current = index === stepIndex;
              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                    current && "bg-primary/15 ring-1 ring-primary/30",
                    done && "opacity-70",
                    !done && !current && "opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      done && "bg-primary text-primary-foreground",
                      current && "bg-primary/25 text-primary",
                      !done && !current && "bg-white/10 text-white/50"
                    )}
                  >
                    {done ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">{step.label}</p>
                    <p className="text-[11px] text-white/55">{step.detail}</p>
                  </div>
                  {current ? (
                    <motion.span
                      className="h-2 w-2 rounded-full bg-primary"
                      animate={
                        reduceMotion ? undefined : { opacity: [1, 0.3, 1] }
                      }
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Rotating tip */}
          <div className="mt-4 min-h-[2.5rem] rounded-2xl bg-black/25 px-3 py-2.5">
            <AnimatePresence mode="wait">
              <motion.p
                key={TIPS[tipIndex]}
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                className="text-xs font-medium leading-relaxed text-white/80"
              >
                {TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
