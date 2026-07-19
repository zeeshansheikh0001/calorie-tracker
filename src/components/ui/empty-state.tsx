import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-border/80 bg-card/60 px-6 py-14 text-center shadow-[var(--shadow-sm)] backdrop-blur-xl",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-[var(--shadow-sm)]">
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
