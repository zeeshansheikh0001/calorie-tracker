import { Award, Lock } from "lucide-react";
import type { Achievement } from "@/lib/wellness/scores";
import { cn } from "@/lib/utils";

type AchievementsRowProps = {
  items: Achievement[];
  streak: number;
  level: number;
  xp: number;
};

export function AchievementsRow({
  items,
  streak,
  level,
  xp,
}: AchievementsRowProps) {
  const unlocked = items.filter((a) => a.unlocked).length;

  return (
    <section className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary to-[hsl(152_55%_32%)] p-5 text-primary-foreground shadow-[var(--shadow-glow)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
            Progress
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">Level {level}</p>
          <p className="mt-1 text-xs text-white/75">
            {xp} XP · {streak}-day streak · {unlocked}/{items.length} badges
          </p>
        </div>
        <Award className="h-6 w-6 text-white/90" strokeWidth={1.5} />
      </div>

      <ul className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "min-w-[7.5rem] rounded-2xl border px-3 py-3",
              item.unlocked
                ? "border-white/35 bg-white/15"
                : "border-white/10 bg-black/10 opacity-75"
            )}
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-xl bg-white/15">
              {item.unlocked ? (
                <Award className="h-3.5 w-3.5 text-white" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-white/60" />
              )}
            </div>
            <p className="text-xs font-bold tracking-tight">{item.title}</p>
            <p className="mt-1 text-[10px] leading-snug text-white/70">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
