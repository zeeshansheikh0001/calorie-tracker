"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  useDailyLogQuery,
  useSelectedLogDate,
} from "@/features/calorie/hooks/use-daily-log-query";
import { useGoalsQuery } from "@/features/profile/hooks/use-profile-query";
import {
  useStreakQuery,
  useWaterQuery,
  useWeightHistoryQuery,
} from "@/features/wellness/hooks/use-wellness-query";
import { dailyLogService } from "@/services/calorie/daily-log.service";
import { cn } from "@/lib/utils";

const ranges = ["7D", "14D", "30D"] as const;

export function ProgressScreen() {
  const [range, setRange] = useState<(typeof ranges)[number]>("7D");
  const days = range === "7D" ? 7 : range === "14D" ? 14 : 30;
  const { dateKey } = useSelectedLogDate();
  const { dailyLog, foodEntries, isLoading } = useDailyLogQuery(dateKey);
  const { data: goals, isLoading: goalsLoading } = useGoalsQuery();
  const { data: water } = useWaterQuery(dateKey);
  const { data: streak = 0 } = useStreakQuery();
  const { data: weightHistory = [] } = useWeightHistoryQuery();

  const series = useMemo(() => {
    const end = new Date();
    return dailyLogService.getWeekSummaries(end, days).map((log) => ({
      day: format(parseISO(log.date), days > 7 ? "M/d" : "EEE"),
      calories: Math.round(log.calories),
      protein: Math.round(log.protein),
      goal: goals?.calories ?? 2000,
    }));
  }, [goals?.calories, days, dailyLog, foodEntries]);

  const weightSeries = useMemo(() => {
    return weightHistory.slice(-days).map((w) => ({
      day: format(parseISO(w.date), "M/d"),
      kg: w.kg,
    }));
  }, [weightHistory, days]);

  const calorieGoal = goals?.calories ?? 2000;
  const consumed = dailyLog?.calories ?? 0;
  const pct =
    calorieGoal > 0
      ? Math.min(100, Math.round((consumed / calorieGoal) * 100))
      : 0;
  const weekAvg = series.length
    ? Math.round(series.reduce((sum, d) => sum + d.calories, 0) / series.length)
    : 0;

  return (
    <PageContainer className="space-y-6">
      <header>
        <p className="font-display text-sm font-medium tracking-[0.08em] text-primary">
          nourish
        </p>
        <h1 className="font-display mt-2 text-[2rem] font-medium tracking-tight">
          Insights
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trends that help you stay calm and consistent.
        </p>
      </header>

      <div className="flex gap-1 rounded-2xl border border-border/60 bg-card/70 p-1 backdrop-blur-xl">
        {ranges.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
              range === item
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-sm)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Today",
            value: isLoading || goalsLoading ? null : Math.round(consumed),
            hint: `${pct}% of goal`,
          },
          {
            label: "Avg",
            value: goalsLoading ? null : weekAvg,
            hint: `Last ${days}d`,
          },
          {
            label: "Meals",
            value: isLoading ? null : foodEntries.length,
            hint: "Logged today",
          },
          {
            label: "Streak",
            value: streak,
            hint: "Days in a row",
          },
        ].map((stat) => (
          <SurfaceCard key={stat.label} className="p-4" elevated>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
            {stat.value === null ? (
              <Skeleton className="mt-2 h-8 w-14" />
            ) : (
              <p className="font-display mt-2 text-2xl font-medium tabular-nums">
                {stat.value}
              </p>
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">{stat.hint}</p>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard elevated>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Calories
          </h2>
          <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
            Goal {calorieGoal}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} barCategoryGap="24%">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={34}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 16,
                  boxShadow: "var(--shadow-md)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="calories" radius={[10, 10, 4, 4]}>
                {series.map((entry, index) => (
                  <Cell
                    key={`c-${index}`}
                    fill={
                      entry.calories >= entry.goal * 0.85
                        ? "hsl(var(--primary))"
                        : "hsl(var(--primary) / 0.4)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>

      <SurfaceCard elevated>
        <h2 className="font-display mb-4 text-lg font-medium tracking-tight">
          Protein trend
        </h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="proteinFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={28}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 16,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="protein"
                stroke="hsl(var(--primary))"
                fill="url(#proteinFill)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>

      {weightSeries.length > 0 ? (
        <SurfaceCard elevated>
          <h2 className="font-display mb-4 text-lg font-medium tracking-tight">
            Weight
          </h2>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightSeries}>
                <defs>
                  <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--gold))"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--gold))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 16,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="kg"
                  stroke="hsl(var(--gold))"
                  fill="url(#weightFill)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <h2 className="font-display mb-4 text-lg font-medium tracking-tight">
          Macros today
        </h2>
        <ul className="space-y-4">
          {[
            {
              label: "Protein",
              value: dailyLog?.protein ?? 0,
              goal: goals?.protein ?? 150,
              tone: "bg-[hsl(var(--text-protein-raw))]",
            },
            {
              label: "Carbs",
              value: dailyLog?.carbs ?? 0,
              goal: goals?.carbs ?? 250,
              tone: "bg-[hsl(var(--text-carbs-raw))]",
            },
            {
              label: "Fat",
              value: dailyLog?.fat ?? 0,
              goal: goals?.fat ?? 70,
              tone: "bg-[hsl(var(--text-fat-raw))]",
            },
            {
              label: "Water",
              value: (water?.ml ?? 0) / 1000,
              goal: (water?.goalMl ?? 2500) / 1000,
              tone: "bg-water",
              unit: "L",
            },
          ].map((item) => {
            const progress =
              item.goal > 0
                ? Math.min(100, Math.round((item.value / item.goal) * 100))
                : 0;
            const unit = "unit" in item ? item.unit : "g";
            return (
              <li key={item.label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold">{item.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {unit === "L"
                      ? `${item.value.toFixed(1)}/${item.goal.toFixed(1)}L`
                      : `${Math.round(item.value)}/${item.goal}${unit}`}{" "}
                    · {progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      item.tone
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </SurfaceCard>
    </PageContainer>
  );
}
