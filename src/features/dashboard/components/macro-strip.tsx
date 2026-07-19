import { cn } from "@/lib/utils";

type Macro = {
  label: string;
  value: number;
  goal: number;
  tone: "protein" | "carbs" | "fat";
};

const toneClass: Record<Macro["tone"], string> = {
  protein: "bg-[hsl(var(--text-protein-raw))]",
  carbs: "bg-[hsl(var(--text-carbs-raw))]",
  fat: "bg-[hsl(var(--text-fat-raw))]",
};

type MacroStripProps = {
  items: Macro[];
};

export function MacroStrip({ items }: MacroStripProps) {
  return (
    <ul className="grid grid-cols-3 gap-3">
      {items.map((item) => {
        const pct =
          item.goal > 0
            ? Math.min(100, Math.round((item.value / item.goal) * 100))
            : 0;
        return (
          <li
            key={item.label}
            className="rounded-[1.25rem] border border-white/50 bg-card/75 p-3.5 shadow-[var(--shadow-sm)] backdrop-blur-xl dark:border-white/10"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {pct}%
              </span>
            </div>
            <p className="font-display mt-2 text-[1.35rem] font-medium tabular-nums tracking-tight">
              {Math.round(item.value)}
              <span className="text-sm font-sans font-normal text-muted-foreground">
                /{item.goal}g
              </span>
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  toneClass[item.tone]
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
