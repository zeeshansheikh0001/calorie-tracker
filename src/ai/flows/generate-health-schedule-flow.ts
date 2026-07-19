"use server";

/**
 * Personalized daily health schedule via NVIDIA text model.
 */

import { z } from "zod";
import { nvidiaGenerateJson } from "@/ai/nvidia";

const GenerateHealthScheduleInputSchema = z.object({
  calorieGoal: z.number().min(0),
  proteinGoal: z.number().min(0),
  fatGoal: z.number().min(0),
  carbGoal: z.number().min(0),
  weightGoalType: z.enum([
    "lose_weight",
    "maintain_weight",
    "gain_muscle",
    "general_health",
  ]),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active",
  ]),
  dietaryPreferences: z.array(z.string()).optional(),
  primaryFocus: z.string().optional(),
  sleepHoursGoal: z.number().min(0).max(16).optional(),
  workoutDays: z.array(z.string()).optional(),
});
export type GenerateHealthScheduleInput = z.infer<
  typeof GenerateHealthScheduleInputSchema
>;

const GenerateHealthScheduleOutputSchema = z.object({
  dailyScheduleTitle: z.string(),
  introduction: z.string().optional(),
  mealTimingsAndPortions: z.array(
    z.object({
      time: z.string(),
      mealType: z.string(),
      suggestion: z.string(),
    })
  ),
  workoutSuggestion: z.object({
    time: z.string().optional(),
    workoutType: z.string(),
    description: z.string(),
    notes: z.string().optional(),
  }),
  hydrationReminder: z.object({
    target: z.string(),
    tips: z.array(z.string()),
  }),
  sleepSuggestion: z.object({
    target: z.string(),
    bedtimeRoutineTip: z.string().optional(),
  }),
  nutrientBalanceTip: z.string(),
  generalNotes: z.string().optional(),
});
export type GenerateHealthScheduleOutput = z.infer<
  typeof GenerateHealthScheduleOutputSchema
>;

export async function generateHealthSchedule(
  input: GenerateHealthScheduleInput
): Promise<GenerateHealthScheduleOutput> {
  const data = GenerateHealthScheduleInputSchema.parse(input);

  return nvidiaGenerateJson({
    schema: GenerateHealthScheduleOutputSchema,
    system:
      "You are an expert AI Health and Fitness Coach. Create practical, encouraging daily schedules as JSON.",
    user: `Create a personalized daily health schedule.

Inputs:
- Calorie goal: ${data.calorieGoal} kcal
- Protein: ${data.proteinGoal}g · Fat: ${data.fatGoal}g · Carbs: ${data.carbGoal}g
- Weight goal: ${data.weightGoalType}
- Activity: ${data.activityLevel}
- Dietary preferences: ${(data.dietaryPreferences || []).join(", ") || "None"}
- Primary focus: ${data.primaryFocus || "general"}
- Sleep goal hours: ${data.sleepHoursGoal ?? "not set"}
- Workout days: ${(data.workoutDays || []).join(", ") || "flexible"}

Return JSON with:
dailyScheduleTitle, introduction,
mealTimingsAndPortions (3-5 items: time, mealType, suggestion with rough kcal),
workoutSuggestion { time?, workoutType, description, notes? },
hydrationReminder { target, tips[] },
sleepSuggestion { target, bedtimeRoutineTip? },
nutrientBalanceTip, generalNotes?`,
  });
}
