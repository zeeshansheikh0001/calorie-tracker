"use server";

/**
 * Personalized Indian diet chart via NVIDIA text model.
 */

import { z } from "zod";
import { nvidiaGenerateJson } from "@/ai/nvidia";

const indianDietChartInputSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  weight: z.number().min(1).max(500),
  height: z.number().min(1).max(300),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active",
  ]),
  fitnessGoal: z.enum([
    "weight_loss",
    "maintain_weight",
    "muscle_gain",
    "general_health",
  ]),
  dietaryPreference: z.enum([
    "vegetarian",
    "non_vegetarian",
    "eggetarian",
    "vegan",
    "jain",
    "gluten_free",
    "dairy_free",
    "nut_free",
    "low_carb",
    "keto",
    "paleo",
  ]),
  allergies: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  duration: z.enum(["daily", "weekly"]),
});

export type GenerateIndianDietChartInput = z.infer<
  typeof indianDietChartInputSchema
>;

const indianDietChartOutputSchema = z.object({
  dailyCalories: z.number(),
  macroBreakdown: z.object({
    protein: z.number(),
    carbs: z.number(),
    fats: z.number(),
  }),
  mealPlan: z
    .array(
      z.object({
        day: z.string().optional(),
        meals: z
          .array(
            z.object({
              type: z.enum(["breakfast", "lunch", "snack", "dinner"]),
              name: z.string(),
              recommendedTime: z.string().optional(),
              foodItems: z
                .array(
                  z.object({
                    name: z.string(),
                    quantity: z.string(),
                  })
                )
                .min(1),
              ingredients: z.array(z.string()).optional(),
              calories: z.number().int(),
              nutrients: z.object({
                protein: z.number(),
                carbs: z.number(),
                fats: z.number(),
                fiber: z.number().optional(),
              }),
              preparationSteps: z.array(z.string()).optional(),
            })
          )
          .min(3),
      })
    )
    .min(1),
  nutritionTips: z.array(z.string()).min(2).max(5),
  hydrationRecommendation: z.string(),
});

export type GenerateIndianDietChartOutput = z.infer<
  typeof indianDietChartOutputSchema
>;

export async function generateIndianDietChart(
  input: GenerateIndianDietChartInput
): Promise<GenerateIndianDietChartOutput> {
  const data = indianDietChartInputSchema.parse(input);

  return nvidiaGenerateJson({
    schema: indianDietChartOutputSchema,
    temperature: 0.35,
    system:
      "You are an expert Indian nutritionist. Create realistic home-cookable Indian meal plans. Strictly obey dietaryPreference. Reply with JSON only.",
    user: `Create a personalized Indian diet plan.

User:
- Age ${data.age}, ${data.gender}
- Weight ${data.weight} kg, Height ${data.height} cm
- Activity: ${data.activityLevel}
- Goal: ${data.fitnessGoal}
- Dietary preference (STRICT): ${data.dietaryPreference}
- Allergies: ${(data.allergies || []).join(", ") || "None"}
- Medical: ${(data.medicalConditions || []).join(", ") || "None"}
- Duration: ${data.duration} (${data.duration === "weekly" ? "7 days" : "1 day"})

Requirements:
- Authentic, affordable Indian meals
- mealPlan: 1 day if daily, 7 days if weekly
- Each day: breakfast, lunch, dinner + optional snack
- Each meal: name, recommendedTime, foodItems[{name,quantity}], calories, nutrients
- dailyCalories + macroBreakdown for an average day
- nutritionTips (2-5), hydrationRecommendation

Return valid JSON matching the schema.`,
  });
}
