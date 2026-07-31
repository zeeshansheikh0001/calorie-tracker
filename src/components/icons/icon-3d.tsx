"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/** Semantic 3D icons (Microsoft Fluent Emoji 3D, local assets). */
export const ICONS_3D = {
  home: "/icons/3d/home.png",
  progress: "/icons/3d/progress.png",
  scan: "/icons/3d/scan.png",
  plan: "/icons/3d/plan.png",
  profile: "/icons/3d/profile.png",
  steps: "/icons/3d/steps.png",
  water: "/icons/3d/water.png",
  sleep: "/icons/3d/sleep.png",
  move: "/icons/3d/move.png",
  weight: "/icons/3d/weight.png",
  fire: "/icons/3d/fire.png",
  flame: "/icons/3d/flame.png",
  sun: "/icons/3d/sun.png",
  moon: "/icons/3d/moon.png",
  bell: "/icons/3d/bell.png",
  meal: "/icons/3d/meal.png",
  food: "/icons/3d/food.png",
  apple: "/icons/3d/apple.png",
  ai: "/icons/3d/ai.png",
  trophy: "/icons/3d/trophy.png",
  target: "/icons/3d/target.png",
  goals: "/icons/3d/goals.png",
  chart: "/icons/3d/chart.png",
  protein: "/icons/3d/protein.png",
  cooking: "/icons/3d/cooking.png",
  bowl: "/icons/3d/bowl.png",
  memo: "/icons/3d/memo.png",
  gear: "/icons/3d/gear.png",
  camera: "/icons/3d/camera.png",
  leaf: "/icons/3d/leaf.png",
  zap: "/icons/3d/zap.png",
  droplets: "/icons/3d/droplets.png",
  utensils: "/icons/3d/utensils.png",
  book: "/icons/3d/book.png",
  check: "/icons/3d/check.png",
  health: "/icons/3d/health.png",
  streak: "/icons/3d/streak.png",
  sparkles: "/icons/3d/sparkles.png",
  barcode: "/icons/3d/barcode.png",
  plus: "/icons/3d/plus.png",
  minus: "/icons/3d/minus.png",
  quote: "/icons/3d/quote.png",
  user: "/icons/3d/user.png",
  activity: "/icons/3d/activity.png",
  scale: "/icons/3d/scale.png",
  "water-glass": "/icons/3d/water-glass.png",
  dumbbell: "/icons/3d/dumbbell.png",
  heart: "/icons/3d/heart.png",
} as const;

export type Icon3DName = keyof typeof ICONS_3D;

type Icon3DProps = {
  name: Icon3DName;
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
};

export function Icon3D({
  name,
  size = 24,
  className,
  alt = "",
  priority = false,
}: Icon3DProps) {
  return (
    <Image
      src={ICONS_3D[name]}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "pointer-events-none select-none object-contain drop-shadow-sm",
        className
      )}
      unoptimized
    />
  );
}
