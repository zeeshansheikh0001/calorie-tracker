
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
  saturatedFatEstimate: z.number().optional().describe('Estimated saturated fat in grams. Set to 0 if not applicable or unknown.'),
  carbEstimate: z
    .number()
    .describe('Highly accurate estimated carbohydrate content of the described meal, in grams. Strive for the highest possible precision.'),
  fiberEstimate: z.number().optional().describe('Estimated dietary fiber in grams. Set to 0 if not applicable or unknown.'),
  sugarEstimate: z.number().optional().describe('Estimated sugars in grams. Set to 0 if not applicable or unknown.'),
  cholesterolEstimate: z.number().optional().describe('Estimated cholesterol in milligrams. Set to 0 if not applicable or unknown.'),
  sodiumEstimate: z.number().optional().describe('Estimated sodium in milligrams. Set to 0 if not applicable or unknown.'),
  estimatedQuantityNote: z
    .string()
    .describe("A clear statement of the quantity for which the nutritional estimate is provided (e.g., 'Estimates for 100g raw beef.', 'Estimates for 1 medium apple (approx. 150g).'). This is crucial for user understanding."),
  commonIngredientsInfluence: z.string().optional().describe("A brief explanation of how common ingredients in the dish influence its nutritional profile. Empty if not applicable."),
  healthBenefits: z
    .string()
    .array()
    .describe('A list of 2-4 concise, distinct potential health benefits as an array of strings. Empty array if not applicable or generally unhealthy.'),
  healthierTips: z.string().optional().describe("1-2 actionable tips for making a healthier version of the food. Empty if not applicable."),
  estimationDisclaimer: z.string().optional().describe("A brief disclaimer about the nature of the estimation. Empty if not applicable."),
});
export type AnalyzeFoodTextOutput = z.infer<typeof AnalyzeFoodTextOutputSchema>;

export async function analyzeFoodText(input: AnalyzeFoodTextInput): Promise<AnalyzeFoodTextOutput> {
  return analyzeFoodTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodTextPrompt',
  input: {schema: AnalyzeFoodTextInputSchema},
  output: {schema: AnalyzeFoodTextOutputSchema},
  prompt: `You are an expert nutritionist and a highly precise nutritional calculator. Your primary goal is to provide the most accurate possible estimates for the food described.

Based on the following food description, provide a detailed and highly accurate estimate of its nutritional content, including:
- Calorie count (calorieEstimate)
- Protein in grams (proteinEstimate)
- Total fat in grams (fatEstimate)
- Saturated fat in grams (saturatedFatEstimate, if applicable, otherwise 0)
- Carbohydrates in grams (carbEstimate)
- Dietary fiber in grams (fiberEstimate, if applicable, otherwise 0)
- Sugars in grams (sugarEstimate, if applicable, otherwise 0)
- Cholesterol in milligrams (cholesterolEstimate, if applicable, otherwise 0)
- Sodium in milligrams (sodiumEstimate, if applicable, otherwise 0)

Food Description: {{{description}}}

IMPORTANT INSTRUCTIONS:
1.  **Quantity is Key for Accuracy**:
    *   If the user specifies a quantity (e.g., "150g salmon", "2 eggs", "1 cup of rice"), base ALL your nutritional estimates on THAT specific quantity.
    *   If the user does NOT specify a quantity (e.g., "salmon", "an egg", "pizza"):
        *   For single, common ingredients (like "beef", "apple", "chicken breast"), assume a standard reference quantity (e.g., 100g for raw meats/grains, 1 medium for fruits/vegetables unless it's clearly something like "a handful of berries").
        *   For dishes (like "pizza", "pasta with meatballs"), assume a typical single serving size.
        *   Leverage your extensive knowledge of food composition and typical recipes to make the most reasonable assumption for quantity.
2.  **Mandatory \`estimatedQuantityNote\`**: You MUST clearly state the quantity for which your nutritional estimate is provided in the 'estimatedQuantityNote' field. This field is CRUCIAL for user understanding. Examples: "Estimates for 100g raw lean beef.", "Estimates for 1 medium apple (approx. 150g).", "Estimates for 1 serving (approx. 2 cups cooked) of pasta with 3 meatballs."
3.  **UTMOST PRECISION REQUIRED**: All numerical estimations MUST be as precise as possible. Your main function is to calculate these values accurately. If a detailed nutrient (like saturated fat, fiber, etc.) cannot be reasonably estimated or is not applicable, set its value to 0.
4.  **Comprehensive Analysis (Secondary to Precision)**:
    *   \`commonIngredientsInfluence\`: Briefly explain how the main components of the described food (if it's a dish) influence its overall nutritional profile. If not applicable, leave empty.
    *   \`healthBenefits\`: Provide a list of 2-4 concise, distinct potential health benefits as an array of strings. If the item is generally unhealthy or no specific benefits are widely known, provide a neutral statement like ["General source of energy."] or leave the array empty.
    *   \`healthierTips\`: Offer 1-2 actionable tips for making a healthier version of the described food, if applicable. If not applicable, leave empty.
    *   \`estimationDisclaimer\`: Include a brief disclaimer like "Nutritional estimates are approximate and can vary based on specific ingredients and preparation methods."
5.  **Handling Vague Descriptions**: If the description is too vague to make ANY reasonable estimate (e.g., "food", "a snack"), set ALL numerical estimates to 0. Set \`estimatedQuantityNote\` to "Unable to determine quantity or provide accurate estimates due to vague description." Set \`healthBenefits\` to an empty array. Set other text fields (commonIngredientsInfluence, healthierTips, estimationDisclaimer) to an appropriate "Unable to determine..." message or leave them empty.

Provide your response as a JSON object matching the output schema.
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

