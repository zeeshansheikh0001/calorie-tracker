"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { generateHealthSchedule } from "@/ai/flows/generate-health-schedule-flow";
import { summarizeDailyLog } from "@/ai/flows/summarize-daily-log-flow";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurfaceCard } from "@/components/ui/surface-card";
import { FormField } from "@/components/forms/form-field";
import {
  useDailyLogQuery,
  useSelectedLogDate,
} from "@/features/calorie/hooks/use-daily-log-query";
import { useGoalsQuery } from "@/features/profile/hooks/use-profile-query";
import { useToast } from "@/hooks/use-toast";

export function AiFeaturesScreen() {
  const { toast } = useToast();
  const { dateKey } = useSelectedLogDate();
  const { foodEntries, dailyLog } = useDailyLogQuery(dateKey);
  const { data: goals } = useGoalsQuery();

  const [weightGoal, setWeightGoal] = useState<
    "lose_weight" | "maintain_weight" | "gain_muscle" | "general_health"
  >("general_health");
  const [activity, setActivity] = useState<
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extra_active"
  >("moderately_active");

  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [schedule, setSchedule] = useState<Awaited<
    ReturnType<typeof generateHealthSchedule>
  > | null>(null);
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof summarizeDailyLog>
  > | null>(null);

  const runSchedule = async () => {
    setScheduleLoading(true);
    try {
      const result = await generateHealthSchedule({
        calorieGoal: goals?.calories ?? 2000,
        proteinGoal: goals?.protein ?? 150,
        fatGoal: goals?.fat ?? 70,
        carbGoal: goals?.carbs ?? 250,
        weightGoalType: weightGoal,
        activityLevel: activity,
      });
      setSchedule(result);
    } catch (err) {
      toast({
        title: "Schedule failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setScheduleLoading(false);
    }
  };

  const runSummary = async () => {
    if (!foodEntries.length) {
      toast({
        title: "No meals logged",
        description: "Log food today before requesting a summary.",
      });
      return;
    }
    setSummaryLoading(true);
    try {
      const result = await summarizeDailyLog({
        date: dateKey,
        foodEntries: foodEntries.map((entry) => ({
          name: entry.name,
          calories: entry.calories,
          protein: entry.protein,
          fat: entry.fat,
          carbs: entry.carbs,
        })),
        userGoals: {
          calories: goals?.calories ?? 2000,
          protein: goals?.protein ?? 150,
          fat: goals?.fat ?? 70,
          carb: goals?.carbs ?? 250,
        },
      });
      setSummary(result);
    } catch (err) {
      toast({
        title: "Summary failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6">
      <header className="mb-7">
        <p className="font-display text-sm font-medium tracking-[0.08em] text-primary">
          nourish
        </p>
        <h1 className="font-display mt-2 text-[2rem] font-medium tracking-tight">
          AI coach
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Schedules and daily insights ·{" "}
          {Math.round(dailyLog?.calories ?? 0)} kcal today
        </p>
      </header>

      <SurfaceCard elevated className="mb-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Health schedule
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Meal timing ideas based on your goals
          </p>
        </div>
        <FormField label="Primary goal">
          <Select
            value={weightGoal}
            onValueChange={(v) =>
              setWeightGoal(v as typeof weightGoal)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose_weight">Lose weight</SelectItem>
              <SelectItem value="maintain_weight">Maintain</SelectItem>
              <SelectItem value="gain_muscle">Gain muscle</SelectItem>
              <SelectItem value="general_health">General health</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Activity level">
          <Select
            value={activity}
            onValueChange={(v) => setActivity(v as typeof activity)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary</SelectItem>
              <SelectItem value="lightly_active">Lightly active</SelectItem>
              <SelectItem value="moderately_active">Moderately active</SelectItem>
              <SelectItem value="very_active">Very active</SelectItem>
              <SelectItem value="extra_active">Extra active</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={scheduleLoading}
          onClick={() => void runSchedule()}
        >
          {scheduleLoading ? (
            <>
              <Loader2 className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles /> Generate schedule
            </>
          )}
        </Button>
      </SurfaceCard>

      {schedule ? (
        <SurfaceCard elevated className="mb-4 space-y-3">
          <p className="text-sm font-semibold tracking-tight">
            {schedule.dailyScheduleTitle}
          </p>
          {schedule.introduction ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {schedule.introduction}
            </p>
          ) : null}
          <ul className="space-y-2">
            {schedule.mealTimingsAndPortions.map((meal) => (
              <li
                key={`${meal.time}-${meal.mealType}`}
                className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-sm"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {meal.time} · {meal.mealType}
                </p>
                <p className="mt-1.5 leading-relaxed">{meal.suggestion}</p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      ) : null}

      <SurfaceCard elevated className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Daily log summary
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            AI review of today&apos;s meals vs goals
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={summaryLoading}
          onClick={() => void runSummary()}
        >
          {summaryLoading ? (
            <>
              <Loader2 className="animate-spin" /> Summarizing…
            </>
          ) : (
            "Summarize today"
          )}
        </Button>
        {summary ? (
          <div className="space-y-3 text-sm">
            <p className="font-medium">{summary.overallAssessment}</p>
            <p className="text-muted-foreground">{summary.consumedItemsSummary}</p>
            <p className="text-muted-foreground">{summary.nutritionalAnalysis}</p>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
              {summary.actionableSuggestions.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}
