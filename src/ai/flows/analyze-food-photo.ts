"use server";

/**
 * Analyzes a photo of food using NVIDIA vision (Nemotron Nano VL).
 */

import { z } from "zod";
import { nvidiaGenerateJson } from "@/ai/nvidia";

const AnalyzeFoodPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the meal as a data URI (data:<mimetype>;base64,...)."
    ),
});
export type AnalyzeFoodPhotoInput = z.infer<typeof AnalyzeFoodPhotoInputSchema>;

const AnalyzeFoodPhotoOutputSchema = z.object({
  isFoodItem: z.boolean(),
  calorieEstimate: z.number(),
  proteinEstimate: z.number(),
  fatEstimate: z.number(),
  carbEstimate: z.number(),
  ingredients: z.array(z.string()),
  estimatedQuantityNote: z.string(),
});
export type AnalyzeFoodPhotoOutput = z.infer<
  typeof AnalyzeFoodPhotoOutputSchema
>;

export async function analyzeFoodPhoto(
  input: AnalyzeFoodPhotoInput
): Promise<AnalyzeFoodPhotoOutput> {
  const { photoDataUri } = AnalyzeFoodPhotoInputSchema.parse(input);

  return nvidiaGenerateJson({
    schema: AnalyzeFoodPhotoOutputSchema,
    imageDataUri: photoDataUri,
    system:
      "You are an expert nutritionist and precise nutritional calculator for food photos.",
    user: `Analyze the provided food photo with the highest possible precision.

First, determine if the image contains a food item.

If it IS food:
- isFoodItem = true
- Visually estimate portion size
- Provide accurate calorieEstimate, proteinEstimate, fatEstimate, carbEstimate (grams)
- estimatedQuantityNote: clear statement of the portion used
- ingredients: common dish/food names (e.g. "Avocado Toast"), not every raw micro-ingredient

If it is NOT food:
- isFoodItem = false
- all numeric estimates = 0
- ingredients = []
- estimatedQuantityNote = "Not a food item."

Return JSON with keys:
isFoodItem, calorieEstimate, proteinEstimate, fatEstimate, carbEstimate, ingredients, estimatedQuantityNote`,
  });
}
