"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { FormField } from "@/components/forms/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { goalsService } from "@/services/calorie/daily-log.service";
import { profileService } from "@/services/profile/profile.service";
import { calculateBmr, calculateMacros } from "@/lib/nutrition/bmr";
import { useToast } from "@/hooks/use-toast";
import {
  onboardingSchema,
  type OnboardingValues,
} from "@/features/onboarding/schemas/onboarding-schema";
import { cn } from "@/lib/utils";

const steps = ["About you", "Body", "Goal"] as const;

const goalOptions: { value: OnboardingValues["fitnessGoal"]; label: string }[] =
  [
    { value: "weight_loss", label: "Lose weight" },
    { value: "muscle_gain", label: "Build muscle" },
    { value: "get_fit", label: "Get fitter" },
    { value: "overall_health", label: "Stay healthy" },
    { value: "stamina", label: "Build stamina" },
  ];

export function OnboardingScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      age: 28,
      gender: "other",
      unit: "metric",
      weight: 70,
      height: 170,
      fitnessGoal: "overall_health",
    },
    mode: "onBlur",
  });

  const values = form.watch();
  const previewMacros = useMemo(() => {
    try {
      const bmr = calculateBmr({
        weight: Number(values.weight) || 70,
        height: Number(values.height) || 170,
        age: Number(values.age) || 28,
        gender: values.gender,
        unit: values.unit,
      });
      return calculateMacros(bmr, values.fitnessGoal);
    } catch {
      return null;
    }
  }, [values]);

  const next = async () => {
    const fields: (keyof OnboardingValues)[][] = [
      ["name", "age", "gender"],
      ["unit", "weight", "height"],
      ["fitnessGoal"],
    ];
    const ok = await form.trigger(fields[step]);
    if (ok) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const finish = form.handleSubmit(async (data) => {
    setSaving(true);
    try {
      const bmr = calculateBmr(data);
      const macros = calculateMacros(bmr, data.fitnessGoal);
      profileService.save({
        name: data.name,
        email: "",
        age: data.age,
        gender: data.gender,
        weight: data.unit === "metric" ? data.weight : data.weight * 0.453592,
        height: data.unit === "metric" ? data.height : data.height * 2.54,
        heightUnit: data.unit === "metric" ? "cm" : "ft",
        weightUnit: data.unit === "metric" ? "kg" : "lbs",
      });
      goalsService.save(macros);
      toast({
        title: "You're set",
        description: "Your profile and daily targets are ready.",
      });
      router.replace("/");
    } catch {
      toast({
        title: "Couldn't save",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="font-display text-sm font-medium tracking-[0.08em] text-primary">
          nourish
        </p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Welcome · Step {step + 1} of {steps.length}
        </p>
        <h1 className="font-display mt-2 text-[2rem] font-medium tracking-tight sm:text-[2.35rem]">
          {steps[step]}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A calm setup so your targets feel personal from day one.
        </p>
        <ol className="mt-6 flex gap-2" aria-label="Onboarding progress">
          {steps.map((label, i) => (
            <li key={label} className="flex-1">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors duration-300",
                  i <= step ? "bg-primary" : "bg-muted"
                )}
              />
              <span className="sr-only">
                {label}
                {i === step ? " (current)" : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <SurfaceCard elevated className="flex-1">
        {step === 0 ? (
          <div className="space-y-4">
            <FormField
              label="Name"
              htmlFor="name"
              error={form.formState.errors.name?.message}
            >
              <Input id="name" {...form.register("name")} autoComplete="name" />
            </FormField>
            <FormField
              label="Age"
              htmlFor="age"
              error={form.formState.errors.age?.message}
            >
              <Input id="age" type="number" {...form.register("age")} />
            </FormField>
            <FormField label="Gender" error={form.formState.errors.gender?.message}>
              <Select
                value={form.watch("gender")}
                onValueChange={(v) =>
                  form.setValue("gender", v as OnboardingValues["gender"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger aria-label="Gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other / prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <FormField label="Units">
              <Select
                value={form.watch("unit")}
                onValueChange={(v) =>
                  form.setValue("unit", v as OnboardingValues["unit"])
                }
              >
                <SelectTrigger aria-label="Unit system">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                  <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              label={values.unit === "metric" ? "Weight (kg)" : "Weight (lb)"}
              htmlFor="weight"
              error={form.formState.errors.weight?.message}
            >
              <Input id="weight" type="number" {...form.register("weight")} />
            </FormField>
            <FormField
              label={values.unit === "metric" ? "Height (cm)" : "Height (in)"}
              htmlFor="height"
              error={form.formState.errors.height?.message}
            >
              <Input id="height" type="number" {...form.register("height")} />
            </FormField>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pick a primary goal. We&apos;ll suggest daily calories and macros.
            </p>
            <div className="grid gap-2">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => form.setValue("fitnessGoal", option.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200",
                    values.fitnessGoal === option.value
                      ? "border-primary bg-accent text-accent-foreground shadow-[var(--shadow-sm)]"
                      : "border-border/80 hover:bg-muted/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {previewMacros ? (
              <div className="rounded-2xl border border-border/70 bg-gradient-to-b from-accent/60 to-muted/40 p-4 text-sm">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Suggested targets
                </p>
                <p className="mt-2 text-base font-semibold tabular-nums tracking-tight">
                  {previewMacros.calories} kcal
                </p>
                <p className="mt-1 tabular-nums text-muted-foreground">
                  P {previewMacros.protein}g · C {previewMacros.carbs}g · F{" "}
                  {previewMacros.fat}g
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </SurfaceCard>

      <div className="mt-6 flex gap-3">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
        ) : null}
        {step < steps.length - 1 ? (
          <Button type="button" size="lg" className="flex-1" onClick={next}>
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={saving}
            onClick={finish}
          >
            {saving ? "Saving…" : "Start tracking"}
          </Button>
        )}
      </div>
    </div>
  );
}
