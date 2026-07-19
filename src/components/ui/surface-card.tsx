import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
  elevated?: boolean;
  glass?: boolean;
  tone?: "default" | "primary" | "water" | "gold" | "ink";
};

const toneClass = {
  default: "bg-card/80 text-card-foreground",
  primary:
    "bg-gradient-to-br from-primary to-[hsl(158_42%_18%)] text-primary-foreground border-transparent",
  water:
    "bg-gradient-to-br from-[hsl(198_70%_44%)] to-[hsl(205_65%_32%)] text-white border-transparent",
  gold: "bg-gradient-to-br from-[hsl(38_55%_52%)] to-[hsl(32_50%_38%)] text-gold-foreground border-transparent",
  ink: "bg-gradient-to-br from-[hsl(160_24%_12%)] to-[hsl(160_28%_8%)] text-[hsl(140_20%_96%)] border-transparent",
} as const;

export function SurfaceCard({
  children,
  className,
  padded = true,
  elevated = false,
  glass = true,
  tone = "default",
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border border-border/60 backdrop-blur-xl transition-shadow duration-300",
        glass && tone === "default" && "border-white/50 dark:border-white/10",
        toneClass[tone],
        elevated ? "shadow-[var(--shadow-md)]" : "shadow-[var(--shadow-sm)]",
        padded && "p-5 sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
