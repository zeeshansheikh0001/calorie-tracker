
'use server';

/**
 * @fileOverview Analyzes a photo of food to estimate calorie count and nutritional information.
 *
 * - analyzeFoodPhoto - A function that handles the food photo analysis process.
 * - AnalyzeFoodPhotoInput - The input type for the analyzeFoodPhoto function.
 * - AnalyzeFoodPhotoOutput - The return type for the analyzeFoodPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFoodPhotoInput = z.infer<typeof AnalyzeFoodPhotoInputSchema>;

const AnalyzeFoodPhotoOutputSchema = z.object({
  isFoodItem: z
    .boolean()
    .describe('Indicates if the image is determined to be a food item.'),
  calorieEstimate: z
    .number()
    .describe('Estimated calorie count of the meal. Set to 0 if not a food item.'),
  proteinEstimate: z
    .number()
    .describe('Estimated protein content of the meal, in grams. Set to 0 if not a food item.'),
  fatEstimate: z.number().describe('Estimated fat content of the meal, in grams. Set to 0 if not a food item.'),
  carbEstimate: z
    .number()
    .describe('Estimated carbohydrate content of the meal, in grams. Set to 0 if not a food item.'),
  ingredients: z
    .string()
    .array()
    .describe('List of ingredients identified in the meal. Empty array if not a food item.'),
});
export type AnalyzeFoodPhotoOutput = z.infer<typeof AnalyzeFoodPhotoOutputSchema>;

export async function analyzeFoodPhoto(input: AnalyzeFoodPhotoInput): Promise<AnalyzeFoodPhotoOutput> {
  return analyzeFoodPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodPhotoPrompt',
  input: {schema: AnalyzeFoodPhotoInputSchema},
  output: {schema: AnalyzeFoodPhotoOutputSchema},
  prompt: `You are a nutrition expert. Analyze the provided image.
First, determine if the image contains a food item.

If the image IS a food item:
- Set 'isFoodItem' to true.
- Estimate its nutritional information (calorie count, protein, fat, carbohydrates in grams).
- Identify the ingredients in the meal.

If the image IS NOT a food item:
- Set 'isFoodItem' to false.
- Set 'calorieEstimate', 'proteinEstimate', 'fatEstimate', and 'carbEstimate' to 0.
- Set 'ingredients' to an empty array.

Analyze the following photo: {{media url=photoDataUri}}

Format your response as a JSON object:
{
  "isFoodItem": boolean,
  "calorieEstimate": number,
  "proteinEstimate": number,
  "fatEstimate": number,
  "carbEstimate": number,
  "ingredients": string[]
}`,
});

const analyzeFoodPhotoFlow = ai.defineFlow(
  {
    name: 'analyzeFoodPhotoFlow',
    inputSchema: AnalyzeFoodPhotoInputSchema,
    outputSchema: AnalyzeFoodPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

