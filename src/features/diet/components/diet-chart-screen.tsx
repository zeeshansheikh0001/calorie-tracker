"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  generateIndianDietChart,
  type GenerateIndianDietChartOutput,
} from "@/ai/flows/generateIndianDietChartFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  dietChartFormSchema,
  type DietChartFormValues,
} from "@/features/diet/schemas/diet-chart-schema";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/services/profile/profile.service";

function splitList(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function DietChartScreen() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<GenerateIndianDietChartOutput | null>(null);

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

  const onGenerate = form.handleSubmit(async (values) => {
    setLoading(true);
    setPlan(null);
    try {
      const result = await generateIndianDietChart({
        ...values,
        allergies: splitList(values.allergies),
        medicalConditions: splitList(values.medicalConditions),
      });
      setPlan(result);
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
    profileService.saveDietChart(
      `Plan ${new Date().toLocaleDateString()}`,
      plan as unknown as Record<string, unknown>
    );
    toast({ title: "Saved to profile" });
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6">
      <header className="mb-7">
        <p className="font-display text-sm font-medium tracking-[0.08em] text-primary">
          nourish
        </p>
        <h1 className="font-display mt-2 text-[2rem] font-medium tracking-tight">
          Diet plan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalized Indian meals tailored to your goals.
        </p>
      </header>

      <form onSubmit={onGenerate} className="space-y-4">
        <SurfaceCard elevated className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Age" htmlFor="age" error={form.formState.errors.age?.message}>
              <Input id="age" type="number" {...form.register("age")} />
            </FormField>
            <FormField label="Gender">
              <Select
                value={form.watch("gender")}
                onValueChange={(v) =>
                  form.setValue("gender", v as DietChartFormValues["gender"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Weight (kg)" htmlFor="weight">
              <Input id="weight" type="number" {...form.register("weight")} />
            </FormField>
            <FormField label="Height (cm)" htmlFor="height">
              <Input id="height" type="number" {...form.register("height")} />
            </FormField>
          </div>

          <FormField label="Activity">
            <Select
              value={form.watch("activityLevel")}
              onValueChange={(v) =>
                form.setValue(
                  "activityLevel",
                  v as DietChartFormValues["activityLevel"]
                )
              }
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

          <FormField label="Goal">
            <Select
              value={form.watch("fitnessGoal")}
              onValueChange={(v) =>
                form.setValue(
                  "fitnessGoal",
                  v as DietChartFormValues["fitnessGoal"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight loss</SelectItem>
                <SelectItem value="maintain_weight">Maintain</SelectItem>
                <SelectItem value="muscle_gain">Muscle gain</SelectItem>
                <SelectItem value="general_health">General health</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Diet preference">
            <Select
              value={form.watch("dietaryPreference")}
              onValueChange={(v) =>
                form.setValue(
                  "dietaryPreference",
                  v as DietChartFormValues["dietaryPreference"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="non_vegetarian">Non-vegetarian</SelectItem>
                <SelectItem value="eggetarian">Eggetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="jain">Jain</SelectItem>
                <SelectItem value="gluten_free">Gluten free</SelectItem>
                <SelectItem value="dairy_free">Dairy free</SelectItem>
                <SelectItem value="low_carb">Low carb</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Duration">
            <Select
              value={form.watch("duration")}
              onValueChange={(v) =>
                form.setValue("duration", v as DietChartFormValues["duration"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">1 day</SelectItem>
                <SelectItem value="weekly">7 days</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Allergies (comma separated)"
            htmlFor="allergies"
            hint="Optional"
          >
            <Input id="allergies" {...form.register("allergies")} />
          </FormField>
          <FormField
            label="Medical conditions (comma separated)"
            htmlFor="medicalConditions"
            hint="Optional"
          >
            <Input
              id="medicalConditions"
              {...form.register("medicalConditions")}
            />
          </FormField>
        </SurfaceCard>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles /> Generate plan
            </>
          )}
        </Button>
      </form>

      {plan ? (
        <div id="dietChartPdfArea" className="mt-6 space-y-4">
          <SurfaceCard elevated>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Targets
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight">
              {plan.dailyCalories} kcal
            </p>
            <p className="mt-1 text-sm tabular-nums text-muted-foreground">
              P {plan.macroBreakdown.protein}g · C {plan.macroBreakdown.carbs}g
              · F {plan.macroBreakdown.fats}g
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {plan.hydrationRecommendation}
            </p>
          </SurfaceCard>

          {plan.mealPlan.map((day, dayIndex) => (
            <SurfaceCard key={`${day.day ?? "day"}-${dayIndex}`}>
              {day.day ? (
                <p className="mb-3 text-sm font-semibold tracking-tight">
                  {day.day}
                </p>
              ) : null}
              <ul className="space-y-3">
                {day.meals.map((meal, mealIndex) => (
                  <li
                    key={`${meal.type}-${mealIndex}`}
                    className="rounded-2xl border border-border/70 bg-muted/20 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {meal.type}
                          {meal.recommendedTime
                            ? ` · ${meal.recommendedTime}`
                            : ""}
                        </p>
                        <p className="text-sm font-medium">{meal.name}</p>
                      </div>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {meal.calories} kcal
                      </p>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {meal.foodItems.map((item) => (
                        <li key={`${item.name}-${item.quantity}`}>
                          {item.name} — {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          ))}

          {plan.nutritionTips?.length ? (
            <SurfaceCard>
              <p className="mb-2 text-sm font-semibold">Tips</p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {plan.nutritionTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </SurfaceCard>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onSave}
          >
            Save to profile
          </Button>
        </div>
      ) : null}
    </div>
  );
}
