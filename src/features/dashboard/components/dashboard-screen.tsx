"use client";

import { format, isToday } from "date-fns";
import { Bell, Flame, Moon, Quote, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";
import { QUERY_KEYS } from "@/constants/storage";
import {
  useDailyLogQuery,
  useDeleteFoodEntry,
  useSelectedLogDate,
} from "@/features/calorie/hooks/use-daily-log-query";
import { AchievementsRow } from "@/features/dashboard/components/achievements-row";
import { CoachPanel } from "@/features/dashboard/components/coach-panel";
import { DateStrip } from "@/features/dashboard/components/date-strip";
import { HeroTodayCard } from "@/features/dashboard/components/hero-today-card";
import { MealCard } from "@/features/dashboard/components/meal-card";
import { MetricTiles } from "@/features/dashboard/components/metric-tiles";
import { Recommendations } from "@/features/dashboard/components/recommendations";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useGoalsQuery,
  useProfileQuery,
  useUpdateProfile,
} from "@/features/profile/hooks/use-profile-query";
import {
  useActivityQuery,
  useAddSteps,
  useAddWater,
  useLogWeight,
  useStreakQuery,
  useWaterQuery,
  useWeightHistoryQuery,
  useWellnessMetaQuery,
} from "@/features/wellness/hooks/use-wellness-query";
import { useToast } from "@/hooks/use-toast";
import {
  buildCoachInsights,
  calorieScore,
  estimateXp,
  evaluateAchievements,
  healthScore,
  proteinScore,
  recommendMeals,
  sortMealsTimeline,
} from "@/lib/wellness/scores";
import { dailyLogService } from "@/services/calorie/daily-log.service";
import { wellnessService } from "@/services/wellness/wellness.service";
import { UtensilsCrossed } from "lucide-react";

const QUOTES = [
  "Small bites of consistency beat perfect plans.",
  "Fuel today like you love tomorrow-you.",
  "Progress is a plate logged, not a plate perfect.",
];

export function DashboardScreen() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { selectedDate, setSelectedDate, dateKey } = useSelectedLogDate();
  const { dailyLog, foodEntries, isLoading } = useDailyLogQuery(dateKey);
  const { data: goals, isLoading: goalsLoading } = useGoalsQuery();
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const updateProfile = useUpdateProfile();
  const deleteEntry = useDeleteFoodEntry(dateKey);

  const { data: water } = useWaterQuery(dateKey);
  const addWater = useAddWater(dateKey);
  const { data: activity } = useActivityQuery(dateKey);
  const addSteps = useAddSteps(dateKey);
  const { data: streak = 0 } = useStreakQuery();
  const { data: weightHistory = [] } = useWeightHistoryQuery();
  const { data: meta } = useWellnessMetaQuery();
  const logWeight = useLogWeight();
  const queryClient = useQueryClient();

  const goalCalories = goals?.calories ?? 2000;
  const log = dailyLog ?? {
    date: dateKey,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
  const waterMl = water?.ml ?? 0;
  const waterGoal = water?.goalMl ?? 2500;
  const mealCount = foodEntries.length;
  const steps = activity?.steps ?? 0;

  const scores = useMemo(() => {
    if (!goals) return { health: 0, protein: 0, calorie: 0 };
    return {
      health: healthScore({
        log,
        goals,
        mealCount,
        waterMl,
        waterGoalMl: waterGoal,
      }),
      protein: Math.round(proteinScore(log.protein, goals.protein)),
      calorie: Math.round(calorieScore(log.calories, goalCalories)),
    };
  }, [goals, log, mealCount, waterMl, waterGoal, goalCalories]);

  const weekLogs = useMemo(
    () => dailyLogService.getWeekSummaries(new Date(), 7),
    [dailyLog, foodEntries]
  );

  const insights = useMemo(() => {
    if (!goals) return [];
    return buildCoachInsights({
      name: profile?.name || "there",
      log,
      goals,
      mealCount,
      streak,
      weekLogs,
      waterMl,
      waterGoalMl: waterGoal,
    });
  }, [goals, profile?.name, log, mealCount, streak, weekLogs, waterMl, waterGoal]);

  const suggestions = useMemo(() => {
    if (!goals) return [];
    return recommendMeals({ log, goals });
  }, [goals, log]);

  const achievements = useMemo(
    () =>
      evaluateAchievements({
        streak,
        mealCount,
        healthScore: scores.health,
        totalMealsLogged: wellnessService.countTotalMeals(),
        waterHit: waterMl >= waterGoal && waterGoal > 0,
      }),
    [streak, mealCount, scores.health, waterMl, waterGoal]
  );

  const xp = estimateXp({
    mealCount,
    healthScore: scores.health,
    streak,
    waterHit: waterMl >= waterGoal && waterGoal > 0,
  });

  useEffect(() => {
    wellnessService.syncXp(
      xp,
      achievements.filter((a) => a.unlocked).map((a) => a.id)
    );
  }, [achievements, xp]);

  const greetingName = profile?.name?.split(" ")[0] || "friend";
  const quote = QUOTES[greetingName.length % QUOTES.length];
  const dateLabel = isToday(selectedDate)
    ? "Today"
    : format(selectedDate, "EEE, MMM d");

  const latestWeight =
    weightHistory[weightHistory.length - 1]?.kg ?? profile?.weight;

  const handleDelete = (id: string) => {
    deleteEntry.mutate(id, {
      onError: () =>
        toast({
          title: "Couldn't delete meal",
          variant: "destructive",
        }),
    });
  };

  const handleWeightLog = () => {
    const current = latestWeight ?? 70;
    const raw = window.prompt("Log today's weight (kg)", String(current));
    if (!raw) return;
    const kg = Number(raw);
    if (!Number.isFinite(kg) || kg <= 0) {
      toast({ title: "Enter a valid weight", variant: "destructive" });
      return;
    }
    logWeight.mutate(kg, {
      onSuccess: () => {
        updateProfile.mutate({ weight: kg });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.weightHistory,
        });
        toast({ title: "Weight logged", description: `${kg} kg saved` });
      },
    });
  };

  const meals = sortMealsTimeline(foodEntries);

  return (
    <PageContainer className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
          <h1 className="mt-0.5 truncate text-[1.75rem] font-bold tracking-tight">
            {profileLoading ? (
              <Skeleton className="h-9 w-44" />
            ) : (
              <>Hello! {greetingName}</>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 ? (
            <span className="hidden items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary sm:inline-flex">
              <Flame className="h-3.5 w-3.5" /> {streak}d
            </span>
          ) : null}
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="relative h-11 w-11 rounded-full"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            asChild
            size="icon"
            variant="outline"
            className="h-11 w-11 rounded-full"
            aria-label="Open profile"
          >
            <Link href="/profile">
              <UserRound className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="icon"
            variant="outline"
            className="relative h-11 w-11 rounded-full"
            aria-label="Reminders"
          >
            <Link href="/reminders">
              <Bell className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <DateStrip selected={selectedDate} onSelect={setSelectedDate} />

      {isLoading || goalsLoading ? (
        <Skeleton className="h-48 w-full rounded-[1.75rem]" />
      ) : (
        <HeroTodayCard
          consumed={log.calories}
          goal={goalCalories}
          macros={[
            {
              label: "Protein",
              value: log.protein,
              goal: goals?.protein ?? 150,
              tone: "protein",
            },
            {
              label: "Carbs",
              value: log.carbs,
              goal: goals?.carbs ?? 250,
              tone: "carbs",
            },
            {
              label: "Fat",
              value: log.fat,
              goal: goals?.fat ?? 70,
              tone: "fat",
            },
          ]}
        />
      )}

      <MetricTiles
        steps={steps}
        waterMl={waterMl}
        waterGoalMl={waterGoal}
        pending={addWater.isPending || addSteps.isPending}
        onAddSteps={() => addSteps.mutate(1000)}
        onAddWater={() => addWater.mutate(250)}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Health", value: scores.health },
          { label: "Protein", value: scores.protein },
          {
            label: "Weight",
            value: latestWeight ? Math.round(latestWeight) : "—",
            action: handleWeightLog,
          },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={"action" in item ? item.action : undefined}
            className="rounded-[1.35rem] border border-border/50 bg-card p-3.5 text-left shadow-[var(--shadow-sm)] transition-transform active:scale-[0.98]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight">
              {item.value}
            </p>
          </button>
        ))}
      </div>

      <SurfaceCard className="flex items-start gap-3 border-none bg-secondary/80 p-4">
        <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm font-medium leading-relaxed text-secondary-foreground">
          {quote}
        </p>
      </SurfaceCard>

      <CoachPanel insights={insights} />

      <Recommendations items={suggestions} />

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Daily meals</h2>
            <p className="text-xs text-muted-foreground">
              {mealCount} logged · tap scan to add
            </p>
          </div>
          <Link
            href="/log-food/photo"
            className="text-xs font-bold text-primary hover:underline"
          >
            Scan food
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-[1.35rem]" />
            <Skeleton className="h-24 rounded-[1.35rem]" />
          </div>
        ) : meals.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No meals yet"
            description="Scan a plate or describe what you ate — AI fills nutrition in seconds."
            action={
              <Button asChild size="sm">
                <Link href="/log-food/photo">Scan a meal</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {meals.map((entry) => (
              <li key={entry.id}>
                <MealCard
                  entry={entry}
                  onDelete={handleDelete}
                  isDeleting={deleteEntry.isPending}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <AchievementsRow
        items={achievements}
        streak={streak}
        level={meta?.level ?? Math.max(1, Math.floor(xp / 500) + 1)}
        xp={Math.max(meta?.xp ?? 0, xp)}
      />
    </PageContainer>
  );
}
