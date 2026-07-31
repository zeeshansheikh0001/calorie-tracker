"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { Icon3D, type Icon3DName } from "@/components/icons/icon-3d";
import { PageContainer } from "@/components/layout/page-container";
import { SurfaceCard } from "@/components/ui/surface-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGoalsQuery,
  useProfileQuery,
} from "@/features/profile/hooks/use-profile-query";
import {
  useStreakQuery,
  useWeightHistoryQuery,
} from "@/features/wellness/hooks/use-wellness-query";
import { wellnessService } from "@/services/wellness/wellness.service";
import type { SavedDietChart } from "@/types/domain";

const links: {
  href: string;
  label: string;
  description: string;
  icon: Icon3DName;
}[] = [
  {
    href: "/goals",
    label: "Daily calorie goal",
    description: "Calories & macros",
    icon: "goals",
  },
  {
    href: "/profile/edit",
    label: "Preferences",
    description: "Body metrics & units",
    icon: "gear",
  },
  {
    href: "/ai-features",
    label: "AI coach",
    description: "Schedules & summaries",
    icon: "ai",
  },
  {
    href: "/diet-chart",
    label: "Diet preference",
    description: "Personalized plans",
    icon: "apple",
  },
  {
    href: "/reminders",
    label: "Reminders",
    description: "Meal & water preferences",
    icon: "bell",
  },
];

function calcBmi(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function ProfileScreen() {
  const { data: profile, isLoading } = useProfileQuery();
  const { data: goals } = useGoalsQuery();
  const { data: streak = 0 } = useStreakQuery();
  const { data: weightHistory = [] } = useWeightHistoryQuery();
  const [openChartId, setOpenChartId] = useState<string | null>(null);
  const savedCharts = profile?.savedDietCharts ?? [];

  const currentWeight =
    weightHistory[weightHistory.length - 1]?.kg ?? profile?.weight;
  const targetWeight = profile?.weight
    ? Math.max(45, Math.round(profile.weight * 0.92 * 10) / 10)
    : 60;
  const toGoal =
    currentWeight != null
      ? Math.round((currentWeight - targetWeight) * 10) / 10
      : null;
  const bmi = calcBmi(currentWeight, profile?.height);

  const weekWeight = useMemo(() => {
    if (weightHistory.length === 0 && currentWeight) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
        day,
        kg: currentWeight,
      }));
    }
    const last7 = weightHistory.slice(-7);
    return last7.map((w) => ({
      day: format(parseISO(w.date), "EEE"),
      kg: w.kg,
    }));
  }, [weightHistory, currentWeight]);

  const weekDelta =
    weekWeight.length >= 2
      ? Math.round(
          (weekWeight[weekWeight.length - 1].kg - weekWeight[0].kg) * 10
        ) / 10
      : 0;

  const totalMeals = wellnessService.countTotalMeals();

  return (
    <PageContainer className="space-y-5">
      <SurfaceCard elevated className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 shadow-[var(--shadow-sm)]">
          <Icon3D name="profile" size={36} alt="" />
        </div>
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <Skeleton className="h-6 w-36" />
          ) : (
            <>
              <p className="truncate text-xl font-bold tracking-tight">
                {profile?.name || "Guest"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {profile?.email || "Local profile"}
              </p>
            </>
          )}
          <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            Weight loss goal
          </span>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link href="/profile/edit">Edit</Link>
        </Button>
      </SurfaceCard>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Current",
            value: currentWeight ? currentWeight.toFixed(1) : "—",
            unit: "kg",
          },
          {
            label: "Target",
            value: targetWeight.toFixed(1),
            unit: "kg",
          },
          {
            label: "To goal",
            value: toGoal != null ? Math.abs(toGoal).toFixed(1) : "—",
            unit: "kg",
          },
        ].map((stat) => (
          <SurfaceCard key={stat.label} className="p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums tracking-tight">
              {stat.value}
            </p>
            <p className="text-[11px] text-muted-foreground">{stat.unit}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SurfaceCard className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            BMI
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {bmi ?? "—"}
          </p>
        </SurfaceCard>
        <SurfaceCard className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Streak
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tabular-nums">
            <Icon3D name="streak" size={22} alt="" /> {streak}
          </p>
        </SurfaceCard>
      </div>

      {goals ? (
        <SurfaceCard className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Daily targets
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums">
            {goals.calories} kcal
          </p>
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            P {goals.protein}g · C {goals.carbs}g · F {goals.fat}g
          </p>
        </SurfaceCard>
      ) : null}

      <SurfaceCard elevated>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight">Weekly progress</h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            {weekDelta > 0 ? "+" : ""}
            {weekDelta} kg
          </span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekWeight}>
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 14,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="kg"
                fill="hsl(var(--primary))"
                radius={[8, 8, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Button asChild variant="outline" className="mt-3 w-full rounded-2xl">
          <Link href="/progress">View detailed analytics</Link>
        </Button>
      </SurfaceCard>

      {savedCharts.length > 0 ? (
        <SurfaceCard className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold tracking-tight">Saved diet plans</h2>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/diet-chart">New plan</Link>
            </Button>
          </div>
          <ul className="space-y-2">
            {savedCharts
              .slice()
              .reverse()
              .map((chart: SavedDietChart) => {
                const open = openChartId === chart.id;
                const summary =
                  typeof chart.dietChart?.summary === "string"
                    ? chart.dietChart.summary
                    : typeof chart.dietChart?.overview === "string"
                      ? chart.dietChart.overview
                      : null;
                return (
                  <li
                    key={chart.id}
                    className="rounded-2xl border border-border/50 bg-muted/30"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                      onClick={() =>
                        setOpenChartId(open ? null : chart.id)
                      }
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">
                          {chart.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {format(parseISO(chart.createdAt), "MMM d, yyyy")}
                        </span>
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                          open ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {open ? (
                      <div className="border-t border-border/40 px-3.5 py-3 text-sm text-muted-foreground">
                        {summary ||
                          "Open Diet Plan to generate a fresh chart — this save stores the full AI payload locally."}
                        <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-background/80 p-3 text-[11px] leading-relaxed text-foreground/80">
                          {JSON.stringify(chart.dietChart, null, 2)}
                        </pre>
                      </div>
                    ) : null}
                  </li>
                );
              })}
          </ul>
        </SurfaceCard>
      ) : null}

      <SurfaceCard padded={false} className="overflow-hidden">
        <ul className="divide-y divide-border/50">
          {links.map((item) => {
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                    <Icon3D name={item.icon} size={22} alt="" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold tracking-tight">
                      {item.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </SurfaceCard>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Meals", value: totalMeals },
          { label: "Streak", value: `${streak}d` },
          {
            label: "Member",
            value: "Local",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-muted/50 px-2 py-3"
          >
            <p className="text-sm font-bold tabular-nums">{item.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
