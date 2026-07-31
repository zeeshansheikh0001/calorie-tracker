"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  generateIndianDietChart,
  type GenerateIndianDietChartOutput,
} from "@/ai/flows/generateIndianDietChartFlow";
import { Icon3D } from "@/components/icons/icon-3d";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { FormField } from "@/components/forms/form-field";
import {
  dietChartFormSchema,
  type DietChartFormValues,
} from "@/features/diet/schemas/diet-chart-schema";
import {
  useProfileQuery,
  useSaveGoals,
} from "@/features/profile/hooks/use-profile-query";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/constants/storage";
import { profileService } from "@/services/profile/profile.service";
import { cn } from "@/lib/utils";
import type { SavedDietChart } from "@/types/domain";
import { useQueryClient } from "@tanstack/react-query";

const STEPS = ["Basics", "Preferences", "Plan"] as const;

const FITNESS_GOALS: {
  value: DietChartFormValues["fitnessGoal"];
  label: string;
  hint: string;
}[] = [
  { value: "weight_loss", label: "Lose weight", hint: "Calorie deficit" },
  { value: "maintain_weight", label: "Maintain", hint: "Steady intake" },
  { value: "muscle_gain", label: "Build muscle", hint: "Higher protein" },
  { value: "general_health", label: "Feel better", hint: "Balanced meals" },
];

const DIET_PREFS: {
  value: DietChartFormValues["dietaryPreference"];
  label: string;
}[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non_vegetarian", label: "Non-veg" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "jain", label: "Jain" },
  { value: "low_carb", label: "Low carb" },
  { value: "keto", label: "Keto" },
  { value: "gluten_free", label: "Gluten free" },
  { value: "dairy_free", label: "Dairy free" },
];

const ACTIVITY: {
  value: DietChartFormValues["activityLevel"];
  label: string;
}[] = [
  { value: "sedentary", label: "Sedentary" },
  { value: "lightly_active", label: "Light" },
  { value: "moderately_active", label: "Moderate" },
  { value: "very_active", label: "Very active" },
  { value: "extra_active", label: "Athlete" },
];

const MEAL_ACCENT: Record<string, string> = {
  breakfast: "bg-amber-500",
  lunch: "bg-primary",
  snack: "bg-[hsl(var(--gold))]",
  dinner: "bg-[hsl(var(--text-protein-raw))]",
};

function splitList(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function isDietPlan(value: unknown): value is GenerateIndianDietChartOutput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.dailyCalories === "number" &&
    Array.isArray(v.mealPlan) &&
    typeof v.macroBreakdown === "object" &&
    v.macroBreakdown !== null
  );
}

function Chip({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl px-3.5 py-3 text-left transition-all ring-1",
        active
          ? "bg-primary text-primary-foreground ring-primary shadow-[var(--shadow-sm)]"
          : "bg-muted/40 text-foreground ring-border/50 hover:bg-muted/70"
      )}
    >
      <span className="block text-sm font-semibold leading-tight">{label}</span>
      {hint ? (
        <span
          className={cn(
            "mt-0.5 block text-[11px]",
            active ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {hint}
        </span>
      ) : null}
    </button>
  );
}

function PlanResult({
  plan,
  onSave,
  onApplyGoals,
  applying,
  saved,
}: {
  plan: GenerateIndianDietChartOutput;
  onSave: () => void;
  onApplyGoals: () => void;
  applying: boolean;
  saved: boolean;
}) {
  const [dayIndex, setDayIndex] = useState(0);
  const day = plan.mealPlan[dayIndex] ?? plan.mealPlan[0];

  return (
    <div id="dietChartPdfArea" className="space-y-4">
      <SurfaceCard elevated className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-primary/15 via-background to-[hsl(var(--gold)/_0.12)] px-4 py-5 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            Daily targets
          </p>
          <p className="font-display mt-2 text-3xl font-medium tabular-nums tracking-tight">
            {plan.dailyCalories}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">
              kcal
            </span>
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Protein", value: plan.macroBreakdown.protein },
              { label: "Carbs", value: plan.macroBreakdown.carbs },
              { label: "Fat", value: plan.macroBreakdown.fats },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-2xl bg-background/70 px-3 py-2.5 ring-1 ring-border/40"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                  {m.value}g
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Icon3D name="water" size={16} className="mt-0.5 shrink-0" alt="" />
            {plan.hydrationRecommendation}
          </p>
        </div>
        <div className="flex gap-2 border-t border-border/40 p-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-2xl"
            onClick={onSave}
            disabled={saved}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Saved
              </>
            ) : (
              "Save plan"
            )}
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-2xl"
            onClick={onApplyGoals}
            disabled={applying}
          >
            <Icon3D name="goals" size={16} alt="" />
            Apply macros
          </Button>
        </div>
      </SurfaceCard>

      {plan.mealPlan.length > 1 ? (
        <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {plan.mealPlan.map((d, i) => (
            <button
              key={`${d.day ?? "day"}-${i}`}
              type="button"
              onClick={() => setDayIndex(i)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-all",
                dayIndex === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {d.day ?? `Day ${i + 1}`}
            </button>
          ))}
        </div>
      ) : null}

      <SurfaceCard elevated className="p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Icon3D name="meal" size={20} alt="" />
          <h2 className="font-display text-lg font-medium tracking-tight">
            {day?.day ?? "Today's meals"}
          </h2>
        </div>
        <ol className="relative space-y-0">
          {(day?.meals ?? []).map((meal, mealIndex) => (
            <li key={`${meal.type}-${mealIndex}`} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="flex w-4 shrink-0 flex-col items-center">
                <span
                  className={cn(
                    "mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                    MEAL_ACCENT[meal.type] ?? "bg-primary"
                  )}
                />
                {mealIndex < (day?.meals.length ?? 0) - 1 ? (
                  <span className="mt-1 w-px flex-1 bg-border/70" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 rounded-2xl bg-muted/35 p-3.5 ring-1 ring-border/40">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {meal.type}
                      {meal.recommendedTime ? ` · ${meal.recommendedTime}` : ""}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold leading-snug">
                      {meal.name}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-bold tabular-nums text-primary">
                    {meal.calories}
                    <span className="font-medium text-muted-foreground">
                      {" "}
                      kcal
                    </span>
                  </p>
                </div>
                <ul className="mt-2.5 space-y-1">
                  {meal.foodItems.map((item) => (
                    <li
                      key={`${item.name}-${item.quantity}`}
                      className="flex justify-between gap-3 text-xs text-muted-foreground"
                    >
                      <span>{item.name}</span>
                      <span className="shrink-0 tabular-nums">{item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2.5 text-[11px] tabular-nums text-muted-foreground">
                  P {meal.nutrients.protein}g · C {meal.nutrients.carbs}g · F{" "}
                  {meal.nutrients.fats}g
                </p>
              </div>
            </li>
          ))}
        </ol>
      </SurfaceCard>

      {plan.nutritionTips?.length ? (
        <SurfaceCard className="p-4 sm:p-5">
          <p className="font-display text-base font-medium tracking-tight">
            Nutrition tips
          </p>
          <ul className="mt-3 space-y-2.5">
            {plan.nutritionTips.map((tip) => (
              <li
                key={tip}
                className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </SurfaceCard>
      ) : null}
    </div>
  );
}

export function DietChartScreen() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useProfileQuery();
  const saveGoals = useSaveGoals();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<GenerateIndianDietChartOutput | null>(null);
  const [saved, setSaved] = useState(false);
  const [viewingSavedId, setViewingSavedId] = useState<string | null>(null);

  const form = useForm<DietChartFormValues>({
    resolver: zodResolver(dietChartFormSchema),
    defaultValues: {
      age: 28,
      gender: "other",
      weight: 70,
      height: 170,
      activityLevel: "moderately_active",
      fitnessGoal: "general_health",
      dietaryPreference: "vegetarian",
      allergies: "",
      medicalConditions: "",
      duration: "daily",
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      age: profile.age ?? 28,
      gender: profile.gender ?? "other",
      weight: profile.weight ?? 70,
      height: profile.height ?? 170,
      activityLevel: "moderately_active",
      fitnessGoal: "general_health",
      dietaryPreference: "vegetarian",
      allergies: "",
      medicalConditions: "",
      duration: "daily",
    });
  }, [profile, form]);

  const values = form.watch();
  const savedCharts = useMemo(
    () => [...(profile?.savedDietCharts ?? [])].reverse(),
    [profile?.savedDietCharts]
  );

  const goNext = async () => {
    const fields: (keyof DietChartFormValues)[][] = [
      ["age", "gender", "weight", "height", "activityLevel"],
      ["fitnessGoal", "dietaryPreference", "duration", "allergies", "medicalConditions"],
    ];
    const ok = await form.trigger(fields[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onGenerate = form.handleSubmit(async (data) => {
    setLoading(true);
    setPlan(null);
    setSaved(false);
    setViewingSavedId(null);
    try {
      const result = await generateIndianDietChart({
        ...data,
        allergies: splitList(data.allergies),
        medicalConditions: splitList(data.medicalConditions),
      });
      setPlan(result);
      setStep(2);
      toast({ title: "Diet plan ready" });
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  const onSave = () => {
    if (!plan) return;
    const name = `${values.fitnessGoal.replaceAll("_", " ")} · ${format(new Date(), "MMM d")}`;
    profileService.saveDietChart(
      name,
      plan as unknown as Record<string, unknown>
    );
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    setSaved(true);
    toast({ title: "Saved to profile" });
  };

  const onApplyGoals = () => {
    if (!plan) return;
    saveGoals.mutate(
      {
        calories: Math.round(plan.dailyCalories),
        protein: Math.round(plan.macroBreakdown.protein),
        carbs: Math.round(plan.macroBreakdown.carbs),
        fat: Math.round(plan.macroBreakdown.fats),
      },
      {
        onSuccess: () =>
          toast({
            title: "Goals updated",
            description: `${plan.dailyCalories} kcal · ${plan.macroBreakdown.protein}g protein`,
          }),
        onError: () =>
          toast({ title: "Couldn't update goals", variant: "destructive" }),
      }
    );
  };

  const openSaved = (chart: SavedDietChart) => {
    if (!isDietPlan(chart.dietChart)) {
      toast({
        title: "Couldn't open plan",
        description: "This save uses an older format. Generate a new plan.",
        variant: "destructive",
      });
      return;
    }
    setPlan(chart.dietChart);
    setViewingSavedId(chart.id);
    setSaved(true);
    setStep(2);
  };

  return (
    <PageContainer className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-medium tracking-[0.08em] text-primary">
            Calorie Tracker AI
          </p>
          <h1 className="font-display mt-2 text-[2rem] font-medium tracking-tight">
            Diet plan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Indian meals tailored to your body and goals.
          </p>
        </div>
      </header>

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={i === 2 && !plan}
              onClick={() => {
                if (i < 2 || plan) setStep(i);
              }}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                step === i
                  ? "bg-primary text-primary-foreground"
                  : step > i || (i === 2 && plan)
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </button>
            <span
              className={cn(
                "hidden text-xs font-semibold sm:inline",
                step === i ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="h-px flex-1 bg-border/70" />
            ) : null}
          </div>
        ))}
      </div>

      {step < 2 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 0) void goNext();
            else void onGenerate();
          }}
          className="space-y-4"
        >
          {step === 0 ? (
            <SurfaceCard elevated className="space-y-4 p-4 sm:p-5">
              <div>
                <h2 className="font-display text-lg font-medium tracking-tight">
                  Your basics
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Prefills from your profile when available.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Age"
                  htmlFor="age"
                  error={form.formState.errors.age?.message}
                >
                  <Input id="age" type="number" {...form.register("age")} />
                </FormField>
                <FormField label="Gender">
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["male", "female", "other"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => form.setValue("gender", g)}
                        className={cn(
                          "rounded-xl px-2 py-2.5 text-xs font-bold capitalize ring-1 transition-all",
                          values.gender === g
                            ? "bg-primary text-primary-foreground ring-primary"
                            : "bg-muted/40 ring-border/50"
                        )}
                      >
                        {g === "other" ? "Other" : g}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField
                  label="Weight (kg)"
                  htmlFor="weight"
                  error={form.formState.errors.weight?.message}
                >
                  <Input
                    id="weight"
                    type="number"
                    {...form.register("weight")}
                  />
                </FormField>
                <FormField
                  label="Height (cm)"
                  htmlFor="height"
                  error={form.formState.errors.height?.message}
                >
                  <Input
                    id="height"
                    type="number"
                    {...form.register("height")}
                  />
                </FormField>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Activity level
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ACTIVITY.map((item) => (
                    <Chip
                      key={item.value}
                      active={values.activityLevel === item.value}
                      label={item.label}
                      onClick={() => form.setValue("activityLevel", item.value)}
                    />
                  ))}
                </div>
              </div>
            </SurfaceCard>
          ) : (
            <SurfaceCard elevated className="space-y-5 p-4 sm:p-5">
              <div>
                <h2 className="font-display text-lg font-medium tracking-tight">
                  Preferences
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Diet style is followed strictly by the AI.
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Fitness goal
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {FITNESS_GOALS.map((item) => (
                    <Chip
                      key={item.value}
                      active={values.fitnessGoal === item.value}
                      label={item.label}
                      hint={item.hint}
                      onClick={() => form.setValue("fitnessGoal", item.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Diet preference
                </p>
                <div className="flex flex-wrap gap-2">
                  {DIET_PREFS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        form.setValue("dietaryPreference", item.value)
                      }
                      className={cn(
                        "rounded-full px-3.5 py-2 text-xs font-bold ring-1 transition-all",
                        values.dietaryPreference === item.value
                          ? "bg-primary text-primary-foreground ring-primary"
                          : "bg-muted/40 text-muted-foreground ring-border/50 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Plan length
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Chip
                    active={values.duration === "daily"}
                    label="1 day"
                    hint="Quick sample day"
                    onClick={() => form.setValue("duration", "daily")}
                  />
                  <Chip
                    active={values.duration === "weekly"}
                    label="7 days"
                    hint="Full week rotation"
                    onClick={() => form.setValue("duration", "weekly")}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Allergies"
                  htmlFor="allergies"
                  hint="Comma separated, optional"
                >
                  <Input
                    id="allergies"
                    placeholder="e.g. peanuts, shellfish"
                    {...form.register("allergies")}
                  />
                </FormField>
                <FormField
                  label="Medical notes"
                  htmlFor="medicalConditions"
                  hint="Comma separated, optional"
                >
                  <Input
                    id="medicalConditions"
                    placeholder="e.g. PCOS, diabetes"
                    {...form.register("medicalConditions")}
                  />
                </FormField>
              </div>
            </SurfaceCard>
          )}

          <div className="flex gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-2xl"
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : null}
            <Button
              type="submit"
              size="lg"
              className="flex-1 rounded-2xl"
              disabled={loading}
            >
              {step === 0 ? (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : loading ? (
                <>
                  <Loader2 className="animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Icon3D name="sparkles" size={18} alt="" /> Generate plan
                </>
              )}
            </Button>
          </div>
        </form>
      ) : plan ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-2xl"
              onClick={() => {
                setStep(1);
                setViewingSavedId(null);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Edit inputs
            </Button>
            {viewingSavedId ? (
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">
                Saved plan
              </span>
            ) : null}
          </div>
          <PlanResult
            plan={plan}
            onSave={onSave}
            onApplyGoals={onApplyGoals}
            applying={saveGoals.isPending}
            saved={saved}
          />
          <Button
            type="button"
            variant="ghost"
            className="w-full rounded-2xl"
            onClick={() => {
              setPlan(null);
              setSaved(false);
              setViewingSavedId(null);
              setStep(0);
            }}
          >
            Start a new plan
          </Button>
        </div>
      ) : (
        <SurfaceCard className="p-6 text-center">
          <p className="text-sm font-semibold">No plan yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Complete the form to generate one.
          </p>
          <Button
            type="button"
            className="mt-4 rounded-2xl"
            onClick={() => setStep(0)}
          >
            Start
          </Button>
        </SurfaceCard>
      )}

      {step < 2 && savedCharts.length > 0 ? (
        <SurfaceCard className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-medium tracking-tight">
              Saved plans
            </h2>
            <span className="text-xs text-muted-foreground">
              {savedCharts.length}
            </span>
          </div>
          <ul className="space-y-2">
            {savedCharts.slice(0, 5).map((chart) => (
              <li key={chart.id}>
                <button
                  type="button"
                  onClick={() => openSaved(chart)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl bg-muted/40 px-3.5 py-3 text-left ring-1 ring-border/40 transition-colors hover:bg-muted/70"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {chart.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {format(parseISO(chart.createdAt), "MMM d, yyyy")}
                      {typeof chart.dietChart?.dailyCalories === "number"
                        ? ` · ${chart.dietChart.dailyCalories} kcal`
                        : ""}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      ) : null}
    </PageContainer>
  );
}
