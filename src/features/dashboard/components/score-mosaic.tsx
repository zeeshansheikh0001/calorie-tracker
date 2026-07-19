"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SurfaceCard } from "@/components/ui/surface-card";

type ScoreItem = {
  label: string;
  value: number;
  hint: string;
};

type ScoreMosaicProps = {
  items: ScoreItem[];
};

export function ScoreMosaic({ items }: ScoreMosaicProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item, index) => (
        <SurfaceCard
          key={item.label}
          className="p-3.5 sm:p-4"
          elevated={index === 0}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item.label}
          </p>
          <p className="font-display mt-2 text-3xl font-medium tabular-nums tracking-tight">
            {item.value}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${Math.min(100, item.value)}%` }}
              transition={{ duration: 0.8, delay: index * 0.08 }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{item.hint}</p>
        </SurfaceCard>
      ))}
    </div>
  );
}
