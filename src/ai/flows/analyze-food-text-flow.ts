
'use server';
/**
 * @fileOverview Analyzes a text description of food to estimate calorie count, nutritional information, and health benefits.
 * Supports Google Gemini (Genkit) or OpenAI via AI_PROVIDER env (openai = use OPENAI_API_KEY).
 */

import {ai, GEMINI_MODEL_FALLBACKS} from '@/ai/genkit';
import {analyzeFoodTextWithNvidia, getNvidiaRuntimeConfig, isNvidiaConfigured, NvidiaError} from '@/ai/providers/nvidia';
import {z} from 'genkit';
import OpenAI from 'openai';

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

const GEMINI_API_KEY_ENV_NAMES = ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENAI_API_KEY'] as const;

function getGeminiApiKey(): string | undefined {
  for (const name of GEMINI_API_KEY_ENV_NAMES) {
    const value = process.env[name];
    if (value && value.trim()) return value;
  }
  return undefined;
}

function getOpenAIApiKey(): string | undefined {
  const v = process.env.OPENAI_API_KEY;
  return v?.trim() || undefined;
}

function getAiProvider(): 'gemini' | 'openai' {
  const p = process.env.AI_PROVIDER?.toLowerCase()?.trim();
  if (p === 'openai' && getOpenAIApiKey()) return 'openai';
  return 'gemini';
}

const NUTRITION_SYSTEM_PROMPT = `You are an expert nutritionist and a highly precise nutritional calculator. Your primary goal is to provide the most accurate possible estimates for the food described.

Respond with ONLY a valid JSON object (no markdown, no code fence). The JSON must have these exact keys:
calorieEstimate (number), proteinEstimate (number), fatEstimate (number), saturatedFatEstimate (number, optional), carbEstimate (number), fiberEstimate (number, optional), sugarEstimate (number, optional), cholesterolEstimate (number, optional), sodiumEstimate (number, optional), estimatedQuantityNote (string), commonIngredientsInfluence (string, optional), healthBenefits (array of strings), healthierTips (string, optional), estimationDisclaimer (string, optional).

Rules: If the user specifies a quantity (e.g. 150g salmon), base all estimates on that. If not, assume a standard portion (e.g. 100g for meats, 1 medium for fruit). estimatedQuantityNote must clearly state the quantity. For vague descriptions set all numbers to 0 and set estimatedQuantityNote to "Unable to determine quantity or provide accurate estimates due to vague description."`;

async function analyzeFoodTextWithOpenAI(input: AnalyzeFoodTextInput): Promise<AnalyzeFoodTextOutput> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: NUTRITION_SYSTEM_PROMPT },
      { role: 'user', content: `Food description: ${input.description}` },
    ],
    temperature: 0.2,
  });
  const raw = res.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('OpenAI returned no content.');
  const json = raw.replace(/^```json\s*|\s*```$/g, '').trim();
  const parsed = JSON.parse(json) as Record<string, unknown>;
  return {
    calorieEstimate: Number(parsed.calorieEstimate) || 0,
    proteinEstimate: Number(parsed.proteinEstimate) || 0,
    fatEstimate: Number(parsed.fatEstimate) || 0,
    saturatedFatEstimate: parsed.saturatedFatEstimate != null ? Number(parsed.saturatedFatEstimate) : undefined,
    carbEstimate: Number(parsed.carbEstimate) || 0,
    fiberEstimate: parsed.fiberEstimate != null ? Number(parsed.fiberEstimate) : undefined,
    sugarEstimate: parsed.sugarEstimate != null ? Number(parsed.sugarEstimate) : undefined,
    cholesterolEstimate: parsed.cholesterolEstimate != null ? Number(parsed.cholesterolEstimate) : undefined,
    sodiumEstimate: parsed.sodiumEstimate != null ? Number(parsed.sodiumEstimate) : undefined,
    estimatedQuantityNote: String(parsed.estimatedQuantityNote ?? ''),
    commonIngredientsInfluence: parsed.commonIngredientsInfluence != null ? String(parsed.commonIngredientsInfluence) : undefined,
    healthBenefits: Array.isArray(parsed.healthBenefits) ? parsed.healthBenefits.map(String) : [],
    healthierTips: parsed.healthierTips != null ? String(parsed.healthierTips) : undefined,
    estimationDisclaimer: parsed.estimationDisclaimer != null ? String(parsed.estimationDisclaimer) : undefined,
  };
}

function coerceNutritionOutput(parsed: Record<string, unknown>): AnalyzeFoodTextOutput {
  return {
    calorieEstimate: Number(parsed.calorieEstimate) || 0,
    proteinEstimate: Number(parsed.proteinEstimate) || 0,
    fatEstimate: Number(parsed.fatEstimate) || 0,
    saturatedFatEstimate: parsed.saturatedFatEstimate != null ? Number(parsed.saturatedFatEstimate) : undefined,
    carbEstimate: Number(parsed.carbEstimate) || 0,
    fiberEstimate: parsed.fiberEstimate != null ? Number(parsed.fiberEstimate) : undefined,
    sugarEstimate: parsed.sugarEstimate != null ? Number(parsed.sugarEstimate) : undefined,
    cholesterolEstimate: parsed.cholesterolEstimate != null ? Number(parsed.cholesterolEstimate) : undefined,
    sodiumEstimate: parsed.sodiumEstimate != null ? Number(parsed.sodiumEstimate) : undefined,
    estimatedQuantityNote: String(parsed.estimatedQuantityNote ?? ''),
    commonIngredientsInfluence: parsed.commonIngredientsInfluence != null ? String(parsed.commonIngredientsInfluence) : undefined,
    healthBenefits: Array.isArray(parsed.healthBenefits) ? parsed.healthBenefits.map(String) : [],
    healthierTips: parsed.healthierTips != null ? String(parsed.healthierTips) : undefined,
    estimationDisclaimer: parsed.estimationDisclaimer != null ? String(parsed.estimationDisclaimer) : undefined,
  };
}

async function analyzeFoodTextUsingNvidia(input: AnalyzeFoodTextInput): Promise<AnalyzeFoodTextOutput> {
  const parsed = await analyzeFoodTextWithNvidia({
    description: input.description,
    systemPrompt: NUTRITION_SYSTEM_PROMPT,
  });
  return coerceNutritionOutput(parsed);
}

function getStatusCode(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const maybeStatus = (err as {status?: unknown}).status;
  return typeof maybeStatus === 'number' ? maybeStatus : undefined;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function isGeminiModelNotFoundError(err: unknown): boolean {
  const status = getStatusCode(err);
  const message = getErrorMessage(err).toLowerCase();
  if (status !== 404) return false;
  return (
    message.includes('model') ||
    message.includes('models/') ||
    message.includes('generatecontent') ||
    message.includes('not found')
  );
}

function isGeminiQuotaOrRateLimitError(err: unknown): boolean {
  const status = getStatusCode(err);
  const message = getErrorMessage(err).toLowerCase();
  return status === 429 || message.includes('quota') || message.includes('rate limit');
}

function shouldTryNextModel(err: unknown): boolean {
  return isGeminiModelNotFoundError(err) || isGeminiQuotaOrRateLimitError(err);
}

function isGeminiAuthOrConfigError(err: unknown): boolean {
  const status = getStatusCode(err);
  const message = getErrorMessage(err).toLowerCase();
  return status === 401 || status === 403 || message.includes('permission denied') || message.includes('api key');
}

function toUserFacingGeminiError(err: unknown): Error {
  if (err instanceof NvidiaError) {
    if (err.statusCode === 401 || err.statusCode === 403) {
      return new Error(
        'NVIDIA rejected the request (auth/model access). Verify NVIDIA_API_KEY and NVIDIA_TEXT_MODEL permissions.'
      );
    }
    return new Error('AI is temporarily unavailable. Please try again later.');
  }

  const status = getStatusCode(err);
  const message = getErrorMessage(err).toLowerCase();

  if (isGeminiModelNotFoundError(err)) {
    return new Error('Configured Gemini model unavailable; server model config needs update.');
  }

  if (status === 401 || status === 403 || message.includes('permission denied') || message.includes('api key')) {
    return new Error('Gemini key invalid/disabled.');
  }

  if (isGeminiQuotaOrRateLimitError(err)) {
    return new Error('Gemini quota/rate limit reached.');
  }

  if (status === 400) return new Error('AI is temporarily unavailable. Please try again later.');

  if (err instanceof Error) return err;
  return new Error('AI estimation failed due to an unexpected server error.');
}

async function runAnalyzePromptWithModel(
  input: AnalyzeFoodTextInput,
  model: string
): Promise<AnalyzeFoodTextOutput> {
  const {output} = await prompt(input, {model});
  if (!output) {
    throw new Error('AI model returned an empty response.');
  }
  return output;
}

export async function analyzeFoodText(input: AnalyzeFoodTextInput): Promise<AnalyzeFoodTextOutput> {
  const provider = getAiProvider();
  if (provider === 'openai') return analyzeFoodTextWithOpenAI(input);
  if (!getGeminiApiKey()) {
    if (isNvidiaConfigured()) {
      try {
        return await analyzeFoodTextUsingNvidia(input);
      } catch (nvidiaError) {
        throw toUserFacingGeminiError(nvidiaError);
      }
    }
    throw new Error('AI is not configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY), or configure NVIDIA_API_KEY. Then redeploy.');
  }
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
2.  **Mandatory \`estimatedQuantityNote\`**: This field is CRUCIAL for user understanding. You MUST clearly state the quantity for which your nutritional estimate is provided.
    *   If the user specified a quantity (e.g., "150g salmon"), your note should be like: "Estimates are for your specified quantity of 150g salmon."
    *   If you assumed a quantity for a general item (e.g., user typed "salmon" and you assumed 100g), your note should be like: "Estimates based on an assumed quantity of 100g raw salmon." or "Estimates for 1 medium apple (approx. 150g)."
    *   If the description is too vague for any quantity assumption, state that in the note: "Unable to determine quantity or provide accurate estimates due to vague description."
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
    const [primaryModel, fallbackModel] = GEMINI_MODEL_FALLBACKS;
    const modelCandidates =
      fallbackModel && fallbackModel !== primaryModel
        ? [primaryModel, fallbackModel]
        : [primaryModel];
    let lastError: unknown;

    for (const model of modelCandidates) {
      try {
        return await runAnalyzePromptWithModel(input, model);
      } catch (err) {
        lastError = err;
        if (!shouldTryNextModel(err)) break;
      }
    }

    if (lastError && (shouldTryNextModel(lastError) || isGeminiAuthOrConfigError(lastError)) && isNvidiaConfigured()) {
      const nvidia = getNvidiaRuntimeConfig();
      console.info('[AI][text] attempting NVIDIA fallback', {
        geminiError: getErrorMessage(lastError),
        nvidiaBaseUrl: nvidia.baseUrl,
        nvidiaTextModel: nvidia.textModel,
      });
      try {
        return await analyzeFoodTextUsingNvidia(input);
      } catch (nvidiaError) {
        console.error('[AI][text] NVIDIA fallback failed', {
          error: getErrorMessage(nvidiaError),
        });
        if (getGeminiApiKey()) {
          try {
            const [primaryModel] = GEMINI_MODEL_FALLBACKS;
            console.info('[AI][text] retrying Gemini primary after NVIDIA failure', {
              model: primaryModel,
            });
            return await runAnalyzePromptWithModel(input, primaryModel);
          } catch {
            // Surface the most recent fallback failure below.
          }
        }
        lastError = nvidiaError;
      }
    }

    throw toUserFacingGeminiError(lastError);
  }
);

