import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2, "Enter your name").max(40),
  age: z.coerce.number().min(13, "Must be at least 13").max(100),
  gender: z.enum(["male", "female", "other"]),
  unit: z.enum(["metric", "imperial"]),
  weight: z.coerce.number().min(25, "Enter a valid weight").max(400),
  height: z.coerce.number().min(100, "Enter a valid height").max(250),
  fitnessGoal: z.enum([
    "muscle_gain",
    "weight_loss",
    "get_fit",
    "overall_health",
    "stamina",
  ]),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
