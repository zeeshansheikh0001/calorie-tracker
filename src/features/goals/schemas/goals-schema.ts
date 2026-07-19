import { z } from "zod";

export const goalsSchema = z.object({
  calories: z.coerce.number().min(800).max(6000),
  protein: z.coerce.number().min(20).max(400),
  carbs: z.coerce.number().min(20).max(800),
  fat: z.coerce.number().min(10).max(300),
});

export type GoalsFormValues = z.infer<typeof goalsSchema>;
