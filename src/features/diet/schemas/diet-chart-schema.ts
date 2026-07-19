import { z } from "zod";

export const dietChartFormSchema = z.object({
  age: z.coerce.number().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  weight: z.coerce.number().min(30).max(300),
  height: z.coerce.number().min(100).max(250),
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
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  duration: z.enum(["daily", "weekly"]),
});

export type DietChartFormValues = z.infer<typeof dietChartFormSchema>;
