import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const configuredModel = process.env.AI_MODEL?.trim();
const defaultPrimaryModel = 'gemini-2.0-flash';

export const PRIMARY_GEMINI_MODEL = `googleai/${configuredModel || defaultPrimaryModel}`;
export const FALLBACK_GEMINI_MODEL = 'googleai/gemini-2.0-flash-lite';
export const GEMINI_MODEL_FALLBACKS = [PRIMARY_GEMINI_MODEL, FALLBACK_GEMINI_MODEL] as const;

/**
 * Genkit AI with Google Gemini. For production (e.g. Vercel), set one of:
 * - GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENAI_API_KEY
 * Optional: AI_MODEL overrides the model (e.g. gemini-2.5-flash, gemini-2.0-flash-lite).
 * Use gemini-2.0-flash (default) — gemini-1.5-flash can 404 on some API versions.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: PRIMARY_GEMINI_MODEL,
});
