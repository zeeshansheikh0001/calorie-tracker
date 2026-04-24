
'use server';

/**
 * @fileOverview Analyzes a photo of food to estimate calorie count and nutritional information.
 *
 * - analyzeFoodPhoto - A function that handles the food photo analysis process.
 * - AnalyzeFoodPhotoInput - The input type for the analyzeFoodPhoto function.
 * - AnalyzeFoodPhotoOutput - The return type for the analyzeFoodPhoto function.
 */

import {ai} from '@/ai/genkit';
import {analyzeFoodPhotoWithNvidia, getNvidiaRuntimeConfig, isNvidiaConfigured, NvidiaError} from '@/ai/providers/nvidia';
import {z} from 'genkit';

const GEMINI_API_KEY_ENV_NAMES = ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENAI_API_KEY'] as const;

function getGeminiApiKey(): string | undefined {
  for (const name of GEMINI_API_KEY_ENV_NAMES) {
    const value = process.env[name];
    if (value && value.trim()) return value;
  }
  return undefined;
}

function getSafePhotoAnalysisErrorMessage(error: unknown): string {
  if (error instanceof NvidiaError) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return 'NVIDIA rejected the request (auth/model access). Verify NVIDIA_API_KEY and NVIDIA_VISION_MODEL permissions.';
    }
    return 'Unable to analyze the photo right now. Please try again.';
  }

  if (!(error instanceof Error)) {
    return 'Photo analysis failed. Please try again.';
  }

  const msg = error.message;
  if (msg.includes('API_KEY_INVALID') || msg.toLowerCase().includes('api key not valid')) {
    return 'AI provider key is invalid. Update GEMINI_API_KEY (or GOOGLE_API_KEY) and retry.';
  }
  if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
    return 'AI request limit reached. Please try again in a few minutes.';
  }
  if (msg.toLowerCase().includes('model')) {
    return 'Configured AI model is unavailable. Check AI_MODEL configuration.';
  }

  return 'Unable to analyze the photo right now. Please try again.';
}

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

const PHOTO_ANALYSIS_SYSTEM_PROMPT = `You are an expert nutritionist and a highly precise nutritional calculator. Your primary goal is to provide the most accurate and consistent possible estimates for the food shown in the image. When re-analyzing an image that appears identical or very similar to a previous one, strive for maximal consistency in your estimations.

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

Respond with ONLY a valid JSON object with keys:
isFoodItem (boolean), calorieEstimate (number), proteinEstimate (number), fatEstimate (number), carbEstimate (number), ingredients (array of strings), estimatedQuantityNote (string).`;

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const withStatus = error as {status?: unknown};
  return typeof withStatus.status === 'number' ? withStatus.status : undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isGeminiRetryablePhotoError(error: unknown): boolean {
  const status = getStatusCode(error);
  const message = getErrorMessage(error).toLowerCase();
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('timeout') ||
    message.includes('temporar') ||
    message.includes('unavailable')
  );
}

function isGeminiAuthOrConfigPhotoError(error: unknown): boolean {
  const status = getStatusCode(error);
  const message = getErrorMessage(error).toLowerCase();
  return status === 401 || status === 403 || message.includes('permission denied') || message.includes('api key');
}

function coercePhotoOutput(parsed: Record<string, unknown>): AnalyzeFoodPhotoOutput {
  return {
    isFoodItem: Boolean(parsed.isFoodItem),
    calorieEstimate: Number(parsed.calorieEstimate) || 0,
    proteinEstimate: Number(parsed.proteinEstimate) || 0,
    fatEstimate: Number(parsed.fatEstimate) || 0,
    carbEstimate: Number(parsed.carbEstimate) || 0,
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map(String) : [],
    estimatedQuantityNote: String(parsed.estimatedQuantityNote ?? ''),
  };
}

async function analyzeFoodPhotoUsingNvidia(input: AnalyzeFoodPhotoInput): Promise<AnalyzeFoodPhotoOutput> {
  const parsed = await analyzeFoodPhotoWithNvidia({
    photoDataUri: input.photoDataUri,
    systemPrompt: PHOTO_ANALYSIS_SYSTEM_PROMPT,
  });
  return coercePhotoOutput(parsed);
}

export async function analyzeFoodPhoto(input: AnalyzeFoodPhotoInput): Promise<AnalyzeFoodPhotoOutput> {
  if (!getGeminiApiKey()) {
    if (isNvidiaConfigured()) {
      try {
        return await analyzeFoodPhotoUsingNvidia(input);
      } catch (nvidiaError) {
        throw new Error(getSafePhotoAnalysisErrorMessage(nvidiaError));
      }
    }
    throw new Error('AI is not configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY), or configure NVIDIA_API_KEY.');
  }
  return analyzeFoodPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodPhotoPrompt',
  input: {schema: AnalyzeFoodPhotoInputSchema},
  output: {schema: AnalyzeFoodPhotoOutputSchema},
  prompt: `${PHOTO_ANALYSIS_SYSTEM_PROMPT}

Analyze the following photo: {{media url=photoDataUri}}
`,
});

const analyzeFoodPhotoFlow = ai.defineFlow(
  {
    name: 'analyzeFoodPhotoFlow',
    inputSchema: AnalyzeFoodPhotoInputSchema,
    outputSchema: AnalyzeFoodPhotoOutputSchema,
  },
  async input => {
    let geminiError: unknown;
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output returned from AI provider.');
      }
      return output;
    } catch (error) {
      geminiError = error;
      if ((isGeminiRetryablePhotoError(error) || isGeminiAuthOrConfigPhotoError(error)) && isNvidiaConfigured()) {
        const nvidia = getNvidiaRuntimeConfig();
        console.info('[AI][photo] attempting NVIDIA fallback', {
          geminiError: getErrorMessage(error),
          nvidiaBaseUrl: nvidia.baseUrl,
          nvidiaVisionModel: nvidia.visionModel,
        });
        try {
          return await analyzeFoodPhotoUsingNvidia(input);
        } catch (nvidiaError) {
          console.error('[AI][photo] NVIDIA fallback failed', {
            error: getErrorMessage(nvidiaError),
          });
          if (getGeminiApiKey()) {
            try {
              const {output} = await prompt(input);
              if (output) return output;
            } catch {
              // Keep most relevant fallback error.
            }
          }
          console.error('analyzeFoodPhotoFlow failed on Gemini and NVIDIA:', nvidiaError);
          throw new Error(getSafePhotoAnalysisErrorMessage(nvidiaError));
        }
      }
      console.error('analyzeFoodPhotoFlow failed on Gemini:', geminiError);
      throw new Error(getSafePhotoAnalysisErrorMessage(geminiError));
    }
  }
);

