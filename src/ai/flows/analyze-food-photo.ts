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
  calorieEstimate: z
    .number()
    .describe('Estimated calorie count of the meal.'),
  proteinEstimate: z
    .number()
    .describe('Estimated protein content of the meal, in grams.'),
  fatEstimate: z.number().describe('Estimated fat content of the meal, in grams.'),
  carbEstimate: z
    .number()
    .describe('Estimated carbohydrate content of the meal, in grams.'),
  ingredients: z
    .string()
    .array()
    .describe('List of ingredients identified in the meal.'),
});
export type AnalyzeFoodPhotoOutput = z.infer<typeof AnalyzeFoodPhotoOutputSchema>;

export async function analyzeFoodPhoto(input: AnalyzeFoodPhotoInput): Promise<AnalyzeFoodPhotoOutput> {
  return analyzeFoodPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodPhotoPrompt',
  input: {schema: AnalyzeFoodPhotoInputSchema},
  output: {schema: AnalyzeFoodPhotoOutputSchema},
  prompt: `You are a nutrition expert. Analyze the provided image of a meal and estimate its nutritional information.

Analyze the following photo: {{media url=photoDataUri}}

Output a JSON object containing the estimated calorie count, protein content (in grams), fat content (in grams), carbohydrate content (in grams), and a list of ingredients identified in the meal.

Format your response as a JSON object:
{
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
