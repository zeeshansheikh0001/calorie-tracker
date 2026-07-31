"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Dumbbell,
  Heart,
  Scale,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { FormField } from "@/components/forms/form-field";
import { goalsService } from "@/services/calorie/daily-log.service";
import { analytics } from "@/lib/analytics";
import { profileService } from "@/services/profile/profile.service";
import { calculateBmr, calculateMacros } from "@/lib/nutrition/bmr";
import { useToast } from "@/hooks/use-toast";
import {
  onboardingSchema,
  type OnboardingValues,
} from "@/features/onboarding/schemas/onboarding-schema";
import { cn } from "@/lib/utils";

const STEPS = ["Profile", "Measurements", "Goal"] as const;

const GOALS: {
  value: OnboardingValues["fitnessGoal"];
  label: string;
  description: string;
  icon: typeof Heart;
}[] = [
  {
    value: "weight_loss",
    label: "Lose weight",
    description: "Gentle calorie deficit",
    icon: Scale,
  },
  {
    value: "muscle_gain",
    label: "Build muscle",
    description: "Protein-forward plan",
    icon: Dumbbell,
  },
  {
    value: "get_fit",
    label: "Get fitter",
    description: "Balanced everyday fuel",
    icon: Activity,
  },
  {
    value: "overall_health",
    label: "Stay healthy",
    description: "Maintain & feel good",
    icon: Heart,
  },
  {
    value: "stamina",
    label: "Build stamina",
    description: "Energy for long days",
    icon: Zap,
  },
];

const GENDERS: { value: OnboardingValues["gender"]; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export function OnboardingScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
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

  useEffect(() => {
    analytics.onboardingStepViewed(1);
  }, []);

  const values = form.watch();
  const firstName = values.name.trim().split(/\s+/)[0] || "";

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
    if (ok) {
      const nextStep = Math.min(step + 1, STEPS.length - 1);
      setStep(nextStep);
      analytics.onboardingStepViewed(nextStep + 1);
    }
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
      analytics.onboardingCompleted(data.fitnessGoal);
      toast({
        title: "You're all set",
        description: "Your daily targets are ready.",
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

  const titles = [
    firstName ? `Hey ${firstName}` : "Welcome to Nourish",
    "Your measurements",
    "Choose your goal",
  ];
  const subtitles = [
    "Tell us a bit about you so home feels personal.",
    "We’ll use these to estimate your daily calories.",
    "Pick one focus — you can change targets later.",
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[image:var(--hero-glow)]" />
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-[var(--mesh-a)] blur-3xl" />
        <div className="absolute -right-16 bottom-24 h-56 w-56 rounded-full bg-[var(--mesh-b)] blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 sm:px-6">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-sm font-medium tracking-[0.14em] text-primary">
            nourish
          </p>
          <div className="flex items-center gap-1.5" aria-label="Progress">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === step
                    ? "w-6 bg-primary"
                    : i < step
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted-foreground/25"
                )}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduceMotion ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -14 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
            className="flex flex-1 flex-col"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Step {step + 1} · {STEPS[step]}
            </p>
            <h1 className="mt-2 font-display text-[1.9rem] font-medium leading-tight tracking-tight sm:text-[2.15rem]">
              {titles[step]}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {subtitles[step]}
            </p>

            <SurfaceCard elevated className="mt-6 flex-1">
              {step === 0 ? (
                <div className="space-y-5">
                  <FormField
                    label="Your name"
                    htmlFor="name"
                    error={form.formState.errors.name?.message}
                  >
                    <Input
                      id="name"
                      placeholder="e.g. Alex"
                      autoComplete="name"
                      className="h-12 rounded-2xl"
                      {...form.register("name")}
                    />
                  </FormField>

                  <FormField
                    label="Age"
                    htmlFor="age"
                    error={form.formState.errors.age?.message}
                  >
                    <Input
                      id="age"
                      type="number"
                      inputMode="numeric"
                      className="h-12 rounded-2xl"
                      {...form.register("age")}
                    />
                  </FormField>

                  <div>
                    <p className="mb-2 text-sm font-medium">Gender</p>
                    <div className="grid grid-cols-3 gap-2">
                      {GENDERS.map((g) => {
                        const active = values.gender === g.value;
                        return (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() =>
                              form.setValue("gender", g.value, {
                                shouldValidate: true,
                              })
                            }
                            className={cn(
                              "h-11 rounded-2xl border text-sm font-semibold transition-all",
                              active
                                ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                                : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            )}
                          >
                            {g.label}
                          </button>
                        );
                      })}
                    </div>
                    {form.formState.errors.gender?.message ? (
                      <p className="mt-1.5 text-xs text-destructive">
                        {form.formState.errors.gender.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-sm font-medium">Units</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { value: "metric" as const, label: "Metric", hint: "kg & cm" },
                          {
                            value: "imperial" as const,
                            label: "Imperial",
                            hint: "lb & in",
                          },
                        ]
                      ).map((u) => {
                        const active = values.unit === u.value;
                        return (
                          <button
                            key={u.value}
                            type="button"
                            onClick={() => form.setValue("unit", u.value)}
                            className={cn(
                              "rounded-2xl border px-4 py-3 text-left transition-all",
                              active
                                ? "border-primary bg-primary/10"
                                : "border-border/70 bg-background/60 hover:bg-muted/40"
                            )}
                          >
                            <span className="block text-sm font-bold">
                              {u.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {u.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      label={values.unit === "metric" ? "Weight (kg)" : "Weight (lb)"}
                      htmlFor="weight"
                      error={form.formState.errors.weight?.message}
                    >
                      <Input
                        id="weight"
                        type="number"
                        inputMode="decimal"
                        className="h-12 rounded-2xl tabular-nums"
                        {...form.register("weight")}
                      />
                    </FormField>
                    <FormField
                      label={values.unit === "metric" ? "Height (cm)" : "Height (in)"}
                      htmlFor="height"
                      error={form.formState.errors.height?.message}
                    >
                      <Input
                        id="height"
                        type="number"
                        inputMode="decimal"
                        className="h-12 rounded-2xl tabular-nums"
                        {...form.register("height")}
                      />
                    </FormField>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-4">
                  <div className="space-y-2.5">
                    {GOALS.map((goal) => {
                      const Icon = goal.icon;
                      const active = values.fitnessGoal === goal.value;
                      return (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() =>
                            form.setValue("fitnessGoal", goal.value, {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all",
                            active
                              ? "border-primary bg-primary/10 shadow-[var(--shadow-sm)]"
                              : "border-border/70 bg-background/50 hover:bg-muted/40"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-primary"
                            )}
                          >
                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold tracking-tight">
                              {goal.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {goal.description}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "h-4 w-4 shrink-0 rounded-full border-2",
                              active
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {previewMacros ? (
                    <div className="rounded-2xl bg-gradient-to-br from-primary to-[hsl(152_50%_28%)] p-4 text-primary-foreground shadow-[var(--shadow-glow)]">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">
                        Suggested daily target
                      </p>
                      <p className="mt-1 font-display text-3xl font-medium tabular-nums">
                        {previewMacros.calories}{" "}
                        <span className="text-base font-sans text-white/80">
                          kcal
                        </span>
                      </p>
                      <p className="mt-2 text-xs tabular-nums text-white/80">
                        P {previewMacros.protein}g · C {previewMacros.carbs}g · F{" "}
                        {previewMacros.fat}g
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </SurfaceCard>
          </motion.div>
        </AnimatePresence>

        {/* Footer actions */}
        <div className="mt-5 flex gap-3">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 flex-1 rounded-2xl"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              size="lg"
              className="h-12 flex-[1.4] rounded-2xl"
              onClick={next}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="h-12 flex-[1.4] rounded-2xl"
              disabled={saving}
              onClick={finish}
            >
              {saving ? "Saving…" : "Start tracking"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
