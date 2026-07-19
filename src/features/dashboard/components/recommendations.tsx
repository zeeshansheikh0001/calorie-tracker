import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { MealSuggestion } from "@/lib/wellness/scores";

type RecommendationsProps = {
  items: MealSuggestion[];
};

export function Recommendations({ items }: RecommendationsProps) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            For you
          </p>
          <h2 className="font-display text-xl font-medium tracking-tight">
            Recommended next
          </h2>
        </div>
        <Link
          href="/log-food/manual"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Log custom
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory">
        {items.map((item) => (
          <SurfaceCard
            key={item.id}
            className="min-w-[220px] max-w-[240px] shrink-0 snap-start p-4"
            elevated
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold tracking-tight">{item.title}</p>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {item.reason}
            </p>
            <p className="mt-3 text-[11px] font-medium tabular-nums text-primary">
              {item.macros}
            </p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
