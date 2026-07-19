"use server";

/**
 * Daily food log summary via NVIDIA text model.
 */

import { z } from "zod";
import { nvidiaGenerateJson } from "@/ai/nvidia";

const FoodEntryShortSchema = z.object({
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
});

const UserGoalsSchema = z.object({
  calories: z.number().min(0),
  protein: z.number().min(0),
  fat: z.number().min(0),
  carb: z.number().min(0),
});

const SummarizeDailyLogInputSchema = z.object({
  foodEntries: z.array(FoodEntryShortSchema),
  userGoals: UserGoalsSchema,
  date: z.string(),
});
export type SummarizeDailyLogInput = z.infer<
  typeof SummarizeDailyLogInputSchema
>;

const SummarizeDailyLogOutputSchema = z.object({
  date: z.string(),
  overallAssessment: z.string(),
  consumedItemsSummary: z.string(),
  nutritionalAnalysis: z.string(),
  actionableSuggestions: z.array(z.string()).min(2).max(4),
});
export type SummarizeDailyLogOutput = z.infer<
  typeof SummarizeDailyLogOutputSchema
>;

export async function summarizeDailyLog(
  input: SummarizeDailyLogInput
): Promise<SummarizeDailyLogOutput> {
  const data = SummarizeDailyLogInputSchema.parse({
    ...input,
    foodEntries: input.foodEntries || [],
  });

  const meals =
    data.foodEntries.length > 0
      ? data.foodEntries
          .map(
            (e) =>
              `- ${e.name}: ${e.calories} kcal, ${e.protein}g P, ${e.fat}g F, ${e.carbs}g C`
          )
          .join("\n")
      : "- No food items logged.";

  return nvidiaGenerateJson({
    schema: SummarizeDailyLogOutputSchema,
    system:
      "You are an expert AI Nutritionist. Be empathetic, concise, and actionable. Reply with JSON only.",
    user: `Summarize this food log for ${data.date}.

Meals:
${meals}

Goals:
- Calories: ${data.userGoals.calories} kcal
- Protein: ${data.userGoals.protein}g
- Fat: ${data.userGoals.fat}g
- Carbs: ${data.userGoals.carb}g

Return JSON:
{
  "date": "${data.date}",
  "overallAssessment": string,
  "consumedItemsSummary": string,
  "nutritionalAnalysis": string,
  "actionableSuggestions": [2-4 strings]
}`,
  });
}
