"use server";

/**
 * Analyzes a text description of food using NVIDIA text model.
 */

import { z } from "zod";
import { nvidiaGenerateJson } from "@/ai/nvidia";

const AnalyzeFoodTextInputSchema = z.object({
  description: z
    .string()
    .describe(
      'Food description (e.g. "100g chicken breast with rice and broccoli").'
    ),
});
export type AnalyzeFoodTextInput = z.infer<typeof AnalyzeFoodTextInputSchema>;

const AnalyzeFoodTextOutputSchema = z.object({
  calorieEstimate: z.number(),
  proteinEstimate: z.number(),
  fatEstimate: z.number(),
  saturatedFatEstimate: z.number().optional(),
  carbEstimate: z.number(),
  fiberEstimate: z.number().optional(),
  sugarEstimate: z.number().optional(),
  cholesterolEstimate: z.number().optional(),
  sodiumEstimate: z.number().optional(),
  estimatedQuantityNote: z.string(),
  commonIngredientsInfluence: z.string().optional(),
  healthBenefits: z.array(z.string()),
  healthierTips: z.string().optional(),
  estimationDisclaimer: z.string().optional(),
});
export type AnalyzeFoodTextOutput = z.infer<typeof AnalyzeFoodTextOutputSchema>;

export async function analyzeFoodText(
  input: AnalyzeFoodTextInput
): Promise<AnalyzeFoodTextOutput> {
  const { description } = AnalyzeFoodTextInputSchema.parse(input);

  return nvidiaGenerateJson({
    schema: AnalyzeFoodTextOutputSchema,
    system:
      "You are an expert nutritionist and highly precise nutritional calculator.",
    user: `Based on this food description, estimate nutrition with high accuracy.

Food Description: ${description}

Rules:
1. If quantity is specified, use it. Otherwise assume a standard serving and say so in estimatedQuantityNote.
2. Numeric fields: calorieEstimate, proteinEstimate, fatEstimate, carbEstimate required. Optional nutrients default to 0 if unknown.
3. healthBenefits: 2-4 short strings (or empty array).
4. Include estimationDisclaimer about approximate values.
5. If too vague, set numbers to 0 and explain in estimatedQuantityNote.

Return JSON matching the schema exactly.`,
  });
}
