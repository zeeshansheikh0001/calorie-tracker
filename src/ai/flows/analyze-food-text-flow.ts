
'use server';
/**
 * @fileOverview Analyzes a text description of food to estimate calorie count, nutritional information, and health benefits.
 *
 * - analyzeFoodText - A function that handles the food text analysis process.
 * - AnalyzeFoodTextInput - The input type for the analyzeFoodText function.
 * - AnalyzeFoodTextOutput - The return type for the analyzeFoodText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodTextInputSchema = z.object({
  description: z
    .string()
    .describe('A text description of the food item or meal (e.g., "100g chicken breast with rice and broccoli", "an apple", "2 slices of pizza").'),
});
export type AnalyzeFoodTextInput = z.infer<typeof AnalyzeFoodTextInputSchema>;

const AnalyzeFoodTextOutputSchema = z.object({
  calorieEstimate: z
    .number()
    .describe('Highly accurate estimated calorie count of the described meal. Strive for the highest possible precision.'),
  proteinEstimate: z
    .number()
    .describe('Highly accurate estimated protein content of the described meal, in grams. Strive for the highest possible precision.'),
  fatEstimate: z.number().describe('Highly accurate estimated fat content of the described meal, in grams. Strive for the highest possible precision.'),
  carbEstimate: z
    .number()
    .describe('Highly accurate estimated carbohydrate content of the described meal, in grams. Strive for the highest possible precision.'),
  estimatedQuantityNote: z
    .string()
    .describe("A clear statement of the quantity for which the nutritional estimate is provided (e.g., 'Estimates for 100g raw beef.', 'Estimates for 1 medium apple (approx. 150g).'). This is crucial for user understanding."),
  healthBenefits: z
    .string()
    .describe('A brief summary of the potential health benefits of the described food item. Keep it concise, 1-2 sentences. If no specific benefits are known or the item is generally unhealthy, state that or provide neutral information.'),
});
export type AnalyzeFoodTextOutput = z.infer<typeof AnalyzeFoodTextOutputSchema>;

export async function analyzeFoodText(input: AnalyzeFoodTextInput): Promise<AnalyzeFoodTextOutput> {
  return analyzeFoodTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodTextPrompt',
  input: {schema: AnalyzeFoodTextInputSchema},
  output: {schema: AnalyzeFoodTextOutputSchema},
  prompt: `You are an expert nutritionist. Based on the following food description, provide a highly accurate estimate of its calorie count, protein (in grams), fat (in grams), and carbohydrates (in grams).

Food Description: {{{description}}}

IMPORTANT:
1.  If the user specifies a quantity in their description (e.g., "150g salmon", "2 eggs"), base your nutritional estimates on THAT specific quantity.
2.  If the user does NOT specify a quantity (e.g., "salmon", "an egg", "pizza"):
    *   For single, common ingredients (like "beef", "apple", "chicken breast"), assume a standard reference quantity (e.g., 100g for meats/grains, 1 medium for fruits/vegetables unless it's clearly something like "a handful of berries").
    *   For dishes (like "pizza", "pasta with meatballs"), assume a typical single serving size.
3.  You MUST clearly state the quantity for which your nutritional estimate is provided in the 'estimatedQuantityNote' field. For example: "Estimates for 100g raw lean beef.", "Estimates for 1 medium apple (approx. 150g).", "Estimates for 1 serving (approx. 2 cups cooked) of pasta with 3 meatballs."
4.  Also, provide a brief, concise (1-2 sentences) summary of the potential health benefits of the described food item in the 'healthBenefits' field. If the item is generally considered unhealthy or no specific benefits are widely known, state that or provide neutral dietary information.

Provide your response as a JSON object matching the output schema. Strive for the highest possible precision in your nutritional estimations.
If the description is too vague to make a reasonable estimate (e.g., "food", "a snack"), set all nutritional estimates to 0, set estimatedQuantityNote to "Unable to determine quantity due to vague description.", and health benefits to "Unable to determine health benefits due to vague description.".
`,
});

const analyzeFoodTextFlow = ai.defineFlow(
  {
    name: 'analyzeFoodTextFlow',
    inputSchema: AnalyzeFoodTextInputSchema,
    outputSchema: AnalyzeFoodTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
