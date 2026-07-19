"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { analyzeFoodText } from "@/ai/flows/analyze-food-text-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { SurfaceCard } from "@/components/ui/surface-card";
import { NutritionResultCard } from "@/features/tracker/components/nutrition-result-card";
import {
  formatLogDate,
} from "@/services/calorie/daily-log.service";
import { useAddFoodEntry } from "@/features/calorie/hooks/use-daily-log-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  description: z.string().min(2, "Describe your meal"),
});

type FormValues = z.infer<typeof schema>;

type Estimate = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
};

export function ManualLogScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const dateKey = formatLogDate(new Date());
  const addEntry = useAddFoodEntry(dateKey);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: "" },
  });

  const onEstimate = form.handleSubmit(async ({ description }) => {
    setEstimating(true);
    setError(null);
    setEstimate(null);
    try {
      const result = await analyzeFoodText({ description });
      setEstimate({
        name: description.trim(),
        calories: result.calorieEstimate,
        protein: result.proteinEstimate,
        carbs: result.carbEstimate,
        fat: result.fatEstimate,
        note: result.estimatedQuantityNote,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "AI estimation failed.";
      setError(message);
      toast({
        title: "Estimation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setEstimating(false);
    }
  });

  const onSave = () => {
    if (!estimate) return;
    addEntry.mutate(estimate, {
      onSuccess: () => {
        toast({ title: "Meal logged", description: estimate.name });
        router.push("/");
      },
      onError: () => {
        toast({
          title: "Couldn't save meal",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6">
      <div className="mb-7 flex items-start gap-3">
        <Button asChild size="icon" variant="outline" className="rounded-xl">
          <Link href="/" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Log food
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Describe meal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us what you ate — AI fills in the macros.
          </p>
        </div>
      </div>

      <SurfaceCard elevated className="space-y-4">
        <FormField
          label="What did you eat?"
          htmlFor="description"
          error={form.formState.errors.description?.message}
          hint='Example: "2 eggs with toast and avocado"'
        >
          <Textarea
            id="description"
            rows={5}
            placeholder="Meal description…"
            {...form.register("description")}
          />
        </FormField>
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={estimating}
          onClick={onEstimate}
        >
          {estimating ? (
            <>
              <Loader2 className="animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Sparkles /> Estimate nutrition
            </>
          )}
        </Button>
        {error ? (
          <p
            className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </SurfaceCard>

      {estimate ? (
        <div className="mt-4 space-y-3">
          <NutritionResultCard {...estimate} />
          <FormField label="Display name" htmlFor="meal-name">
            <Input
              id="meal-name"
              value={estimate.name}
              onChange={(e) =>
                setEstimate((prev) =>
                  prev ? { ...prev, name: e.target.value } : prev
                )
              }
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => setEstimate(null)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={addEntry.isPending}
              onClick={onSave}
            >
              {addEntry.isPending ? "Saving…" : "Log meal"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
