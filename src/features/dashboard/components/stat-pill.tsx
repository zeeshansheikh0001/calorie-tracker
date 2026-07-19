import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatPillProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  className?: string;
};

export function StatPill({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: StatPillProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
