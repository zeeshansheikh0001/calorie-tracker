"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SurfaceCard } from "@/components/ui/surface-card";
import { FormField } from "@/components/forms/form-field";
import {
  useGoalsQuery,
  useSaveGoals,
} from "@/features/profile/hooks/use-profile-query";
import {
  goalsSchema,
  type GoalsFormValues,
} from "@/features/goals/schemas/goals-schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const fields: {
  key: keyof GoalsFormValues;
  label: string;
  min: number;
  max: number;
  unit: string;
}[] = [
  { key: "calories", label: "Calories", min: 800, max: 4000, unit: "kcal" },
  { key: "protein", label: "Protein", min: 40, max: 300, unit: "g" },
  { key: "carbs", label: "Carbs", min: 50, max: 500, unit: "g" },
  { key: "fat", label: "Fat", min: 20, max: 200, unit: "g" },
];

export function GoalsScreen() {
  const { toast } = useToast();
  const { data: goals, isLoading } = useGoalsQuery();
  const saveGoals = useSaveGoals();

  const form = useForm<GoalsFormValues>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 70,
    },
  });

  useEffect(() => {
    if (goals) form.reset(goals);
  }, [goals, form]);

  const onSubmit = form.handleSubmit((values) => {
    saveGoals.mutate(values, {
      onSuccess: () => {
        toast({
          title: "Goals saved",
          description: "Your daily targets were updated.",
        });
      },
      onError: () => {
        toast({
          title: "Couldn't save goals",
          variant: "destructive",
        });
      },
    });
  });

  if (isLoading) {
    return (
      <PageContainer className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-7">
        <p className="font-display text-sm font-medium tracking-[0.08em] text-primary">
          nourish
        </p>
        <h1 className="font-display mt-2 text-[2rem] font-medium tracking-tight">
          Goals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daily targets that power your coaching scores.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <SurfaceCard elevated className="space-y-7">
          {fields.map((field) => {
            const value = form.watch(field.key);
            return (
              <FormField
                key={field.key}
                label={`${field.label}`}
                htmlFor={field.key}
                error={form.formState.errors[field.key]?.message}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      id={field.key}
                      type="number"
                      className="flex-1"
                      {...form.register(field.key)}
                    />
                    <span className="w-12 shrink-0 text-right text-xs font-medium text-muted-foreground">
                      {field.unit}
                    </span>
                  </div>
                  <Slider
                    min={field.min}
                    max={field.max}
                    step={field.key === "calories" ? 50 : 5}
                    value={[Number(value) || field.min]}
                    onValueChange={([v]) =>
                      form.setValue(field.key, v, { shouldValidate: true })
                    }
                    aria-label={field.label}
                  />
                </div>
              </FormField>
            );
          })}
        </SurfaceCard>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={saveGoals.isPending}
        >
          {saveGoals.isPending ? "Saving…" : "Save goals"}
        </Button>
      </form>
    </PageContainer>
  );
}
