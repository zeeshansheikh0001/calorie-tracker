"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Icon3D, type Icon3DName } from "@/components/icons/icon-3d";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  useDailyLogQuery,
  useSelectedLogDate,
  useWeekLogsQuery,
} from "@/features/calorie/hooks/use-daily-log-query";
import { useGoalsQuery } from "@/features/profile/hooks/use-profile-query";
import {
  useLogWeight,
  useStreakQuery,
  useWaterQuery,
  useWeightHistoryQuery,
} from "@/features/wellness/hooks/use-wellness-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ranges = [
  { id: "7D" as const, days: 7, label: "7D" },
  { id: "14D" as const, days: 14, label: "14D" },
  { id: "30D" as const, days: 30, label: "30D" },
];

function StatTile({
  label,
  value,
  hint,
  icon,
  loading,
}: {
  label: string;
  value: string | number | null;
  hint: string;
  icon: Icon3DName;
  loading?: boolean;
}) {
  return (
    <div className="rounded-[1.35rem] bg-muted/40 p-3.5 ring-1 ring-border/40">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <Icon3D name={icon} size={18} alt="" />
      </div>
      {loading || value === null ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="font-display mt-1.5 text-2xl font-medium tabular-nums tracking-tight">
          {value}
        </p>
      )}
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ProgressScreen() {
  const { toast } = useToast();
  const [rangeId, setRangeId] = useState<(typeof ranges)[number]["id"]>("7D");
  const days = ranges.find((r) => r.id === rangeId)?.days ?? 7;

  const { dateKey } = useSelectedLogDate();
  const { dailyLog, foodEntries, isLoading } = useDailyLogQuery(dateKey);
  const { data: goals, isLoading: goalsLoading } = useGoalsQuery();
  const { data: water } = useWaterQuery(dateKey);
  const { data: streak = 0 } = useStreakQuery();
  const { data: weightHistory = [] } = useWeightHistoryQuery();
  const { data: weekLogs = [], isLoading: weekLoading } = useWeekLogsQuery(days);
  const logWeight = useLogWeight();

  const calorieGoal = goals?.calories ?? 2000;
  const proteinGoal = goals?.protein ?? 150;

  const series = useMemo(() => {
    return weekLogs.map((log) => {
      const calories = Math.round(log.calories);
      const onTarget =
        calorieGoal > 0 &&
        calories >= calorieGoal * 0.85 &&
        calories <= calorieGoal * 1.1;
      return {
        day: format(parseISO(log.date), days > 7 ? "M/d" : "EEE"),
        date: log.date,
        calories,
        protein: Math.round(log.protein),
        carbs: Math.round(log.carbs),
        fat: Math.round(log.fat),
        goal: calorieGoal,
        onTarget,
      };
    });
  }, [weekLogs, calorieGoal, days]);

  const weightSeries = useMemo(() => {
    return weightHistory.slice(-Math.max(days, 7)).map((w) => ({
      day: format(parseISO(w.date), "M/d"),
      kg: Number(w.kg.toFixed(1)),
    }));
  }, [weightHistory, days]);

  const insights = useMemo(() => {
    const activeDays = series.filter((d) => d.calories > 0);
    const avg = activeDays.length
      ? Math.round(
          activeDays.reduce((sum, d) => sum + d.calories, 0) / activeDays.length
        )
      : 0;
    const avgProtein = activeDays.length
      ? Math.round(
          activeDays.reduce((sum, d) => sum + d.protein, 0) / activeDays.length
        )
      : 0;
    const hitRate = activeDays.length
      ? Math.round(
          (activeDays.filter((d) => d.onTarget).length / activeDays.length) * 100
        )
      : 0;
    const best = activeDays.reduce<(typeof series)[number] | null>((acc, d) => {
      if (!acc) return d;
      const accDiff = Math.abs(acc.calories - calorieGoal);
      const dDiff = Math.abs(d.calories - calorieGoal);
      return dDiff < accDiff ? d : acc;
    }, null);
    const heaviest = activeDays.reduce<(typeof series)[number] | null>(
      (acc, d) => (!acc || d.calories > acc.calories ? d : acc),
      null
    );
    const weightDelta =
      weightSeries.length >= 2
        ? Number(
            (
              weightSeries[weightSeries.length - 1].kg - weightSeries[0].kg
            ).toFixed(1)
          )
        : null;

    return {
      avg,
      avgProtein,
      hitRate,
      loggedDays: activeDays.length,
      best,
      heaviest,
      weightDelta,
    };
  }, [series, calorieGoal, weightSeries]);

  const consumed = dailyLog?.calories ?? 0;
  const pct =
    calorieGoal > 0
      ? Math.min(100, Math.round((consumed / calorieGoal) * 100))
      : 0;

  const onLogWeight = () => {
    const raw = window.prompt("Log today's weight (kg)", "");
    if (!raw) return;
    const kg = Number(raw);
    if (!Number.isFinite(kg) || kg < 25 || kg > 300) {
      toast({
        title: "Invalid weight",
        description: "Enter a number between 25 and 300 kg.",
        variant: "destructive",
      });
      return;
    }
    logWeight.mutate(kg, {
      onSuccess: () => toast({ title: "Weight logged", description: `${kg} kg` }),
      onError: () =>
        toast({ title: "Couldn't save weight", variant: "destructive" }),
    });
  };

  return (
    <PageContainer className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-medium tracking-[0.08em] text-primary">
            Calorie Tracker AI
          </p>
          <h1 className="font-display mt-2 text-[2rem] font-medium tracking-tight">
            Progress
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trends, adherence, and what to improve next.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 h-10 shrink-0 rounded-2xl"
          onClick={onLogWeight}
          disabled={logWeight.isPending}
        >
          <Icon3D name="weight" size={18} alt="" />
          Log weight
        </Button>
      </header>

      <div className="flex gap-1 rounded-2xl bg-muted/50 p-1 ring-1 ring-border/50">
        {ranges.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setRangeId(item.id)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
              rangeId === item.id
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-sm)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Today"
          value={isLoading || goalsLoading ? null : Math.round(consumed)}
          hint={`${pct}% of ${calorieGoal} kcal`}
          icon="flame"
          loading={isLoading || goalsLoading}
        />
        <StatTile
          label="Avg calories"
          value={weekLoading ? null : insights.avg || "—"}
          hint={`${insights.loggedDays}/${days} days logged`}
          icon="chart"
          loading={weekLoading}
        />
        <StatTile
          label="Goal hit rate"
          value={weekLoading ? null : `${insights.hitRate}%`}
          hint="Days within ±15% of goal"
          icon="target"
          loading={weekLoading}
        />
        <StatTile
          label="Streak"
          value={streak}
          hint={`${foodEntries.length} meals today`}
          icon="meal"
        />
      </div>

      {(insights.best || insights.heaviest || insights.weightDelta !== null) && (
        <div className="grid gap-2 sm:grid-cols-3">
          {insights.best ? (
            <div className="rounded-2xl bg-primary/10 px-3.5 py-3 ring-1 ring-primary/15">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                Closest to goal
              </p>
              <p className="mt-1 text-sm font-semibold">
                {insights.best.day} · {insights.best.calories} kcal
              </p>
            </div>
          ) : null}
          {insights.heaviest ? (
            <div className="rounded-2xl bg-muted/50 px-3.5 py-3 ring-1 ring-border/40">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Highest day
              </p>
              <p className="mt-1 text-sm font-semibold">
                {insights.heaviest.day} · {insights.heaviest.calories} kcal
              </p>
            </div>
          ) : null}
          {insights.weightDelta !== null ? (
            <div className="rounded-2xl bg-muted/50 px-3.5 py-3 ring-1 ring-border/40">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Weight change
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold">
                {insights.weightDelta > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                ) : insights.weightDelta < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5 text-primary" />
                ) : null}
                {insights.weightDelta > 0 ? "+" : ""}
                {insights.weightDelta} kg
              </p>
            </div>
          ) : null}
        </div>
      )}

      <SurfaceCard elevated className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-medium tracking-tight">
              Calories
            </h2>
            <p className="text-xs text-muted-foreground">
              vs {calorieGoal} kcal goal
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            Avg {insights.avg || 0}
          </span>
        </div>
        <div className="h-64 w-full">
          {weekLoading ? (
            <Skeleton className="h-full w-full rounded-2xl" />
          ) : series.every((d) => d.calories === 0) ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-muted/30 text-center">
              <p className="text-sm font-semibold">No calorie data yet</p>
              <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
                Log meals for a few days to see your trend.
              </p>
              <Button asChild size="sm" className="mt-4 rounded-2xl">
                <Link href="/log-food/photo">Log a meal</Link>
              </Button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} barCategoryGap="22%">
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
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 16,
                    boxShadow: "var(--shadow-md)",
                    fontSize: 12,
                  }}
                />
                <ReferenceLine
                  y={calorieGoal}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.55}
                />
                <Bar dataKey="calories" radius={[10, 10, 4, 4]}>
                  {series.map((entry) => (
                    <Cell
                      key={entry.date}
                      fill={
                        entry.onTarget
                          ? "hsl(var(--primary))"
                          : entry.calories === 0
                            ? "hsl(var(--muted-foreground) / 0.2)"
                            : "hsl(var(--primary) / 0.4)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard elevated className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-medium tracking-tight">
              Protein
            </h2>
            <p className="text-xs text-muted-foreground">
              Avg {insights.avgProtein}g · goal {proteinGoal}g
            </p>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="proteinFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--text-protein-raw))"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--text-protein-raw))"
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
              <ReferenceLine
                y={proteinGoal}
                stroke="hsl(var(--text-protein-raw))"
                strokeDasharray="4 4"
                strokeOpacity={0.45}
              />
              <Area
                type="monotone"
                dataKey="protein"
                stroke="hsl(var(--text-protein-raw))"
                fill="url(#proteinFill)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>

      <SurfaceCard elevated className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-medium tracking-tight">
              Weight
            </h2>
            <p className="text-xs text-muted-foreground">
              {weightSeries.length
                ? `${weightSeries[weightSeries.length - 1].kg} kg latest`
                : "Log weight to unlock this chart"}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-2xl"
            onClick={onLogWeight}
          >
            Add
          </Button>
        </div>
        <div className="h-44 w-full">
          {weightSeries.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-muted/30 text-center">
              <Icon3D name="weight" size={28} alt="" />
              <p className="mt-2 text-sm font-semibold">No weight logs yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Track weekly to see the trend.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Macros today
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href="/goals">Edit goals</Link>
          </Button>
        </div>
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
              unit: "L" as const,
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
