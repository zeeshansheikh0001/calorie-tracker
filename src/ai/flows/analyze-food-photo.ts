
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
    .describe('MUST BE HIGHLY ACCURATE. Estimated calorie count of the meal. Strive for the highest possible precision. Set to 0 if not a food item.'),
  proteinEstimate: z
    .number()
    .describe('MUST BE HIGHLY ACCURATE. Estimated protein content of the meal, in grams. Strive for the highest possible precision. Set to 0 if not a food item.'),
  fatEstimate: z.number().describe('MUST BE HIGHLY ACCURATE. Estimated fat content of the meal, in grams. Strive for the highest possible precision. Set to 0 if not a food item.'),
  carbEstimate: z
    .number()
    .describe('MUST BE HIGHLY ACCURATE. Estimated carbohydrate content of the meal, in grams. Strive for the highest possible precision. Set to 0 if not a food item.'),
  ingredients: z // This field will now store dish names
    .string()
    .array()
    .describe('List of common names of the primary food item(s) or dish(es) identified (e.g., "Pizza", "Chicken Biryani"). Empty array if not a food item or if names cannot be determined.'),
  estimatedQuantityNote: z
    .string()
    .describe("A clear statement of the visually estimated quantity for which the nutritional estimate is provided (e.g., 'Approximate estimates for approx. 150g of chicken as shown.', 'Estimates for 1 medium apple depicted.'). Empty if not a food item or quantity cannot be reasonably estimated from the photo.")
});
export type AnalyzeFoodPhotoOutput = z.infer<typeof AnalyzeFoodPhotoOutputSchema>;

export async function analyzeFoodPhoto(input: AnalyzeFoodPhotoInput): Promise<AnalyzeFoodPhotoOutput> {
  return analyzeFoodPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodPhotoPrompt',
  input: {schema: AnalyzeFoodPhotoInputSchema},
  output: {schema: AnalyzeFoodPhotoOutputSchema},
  prompt: `You are an expert nutritionist and a highly precise nutritional calculator. Your primary goal is to provide the most accurate and consistent possible estimates for the food shown in the image. When re-analyzing an image that appears identical or very similar to a previous one, strive for maximal consistency in your estimations.

Analyze the provided image with the HIGHEST POSSIBLE PRECISION. Your estimations for calories, protein, fat, and carbohydrates MUST be as accurate as your knowledge allows.

First, determine if the image contains a food item.

If the image IS a food item:
- Set 'isFoodItem' to true.
- Perform a careful visual estimation of the quantity or portion size of the food item(s) shown (e.g., "approx. 150g", "1 cup", "2 slices"). This visual estimation is critical for accurate results.
- Based SOLELY on this visually estimated quantity and your extensive nutritional knowledge, provide **highly accurate and consistent numerical estimates** for its nutritional information (calorie count, protein, fat, carbohydrates in grams). Do not generalize; aim for specific values.
- Populate the 'estimatedQuantityNote' field with a clear statement about the visually estimated quantity used for the nutritional estimation (e.g., "Approximate estimates for approx. 150g of chicken as shown in the image.", "Nutritional details for the single medium apple depicted.").
- Identify the common name(s) of the primary food item(s) or dish(es) in the meal (e.g., "Pizza", "Chicken Biryani", "Apple Pie"). List these in the 'ingredients' array. If it's a single dish, provide its name as a single element array. If multiple distinct dishes are clearly visible, list their common names. Avoid listing individual raw ingredients unless it's a very simple, unmixed food like "Apple". If no specific dish name can be determined, provide a general category like "Mixed Salad" or "Fruit Bowl".

If the image IS NOT a food item:
- Set 'isFoodItem' to false.
- Set 'calorieEstimate', 'proteinEstimate', 'fatEstimate', and 'carbEstimate' to 0.
- Set 'ingredients' to an empty array.
- Set 'estimatedQuantityNote' to "Not a food item." or an empty string.

Analyze the following photo: {{media url=photoDataUri}}

Format your response as a JSON object:
{
  "isFoodItem": boolean,
  "calorieEstimate": number,  // Strive for highest precision
  "proteinEstimate": number, // Strive for highest precision
  "fatEstimate": number,     // Strive for highest precision
  "carbEstimate": number,    // Strive for highest precision
  "ingredients": string[],
  "estimatedQuantityNote": string
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

