import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const PRIMARY_GEMINI_MODEL = 'googleai/gemini-2.0-flash';
export const FALLBACK_GEMINI_MODEL = 'googleai/gemini-2.0-flash-lite';
export const GEMINI_MODEL_FALLBACKS = [PRIMARY_GEMINI_MODEL, FALLBACK_GEMINI_MODEL] as const;

/**
 * Genkit AI with Google Gemini. For production (e.g. Vercel), set one of:
 * - GEMINI_API_KEY
 * - GOOGLE_API_KEY
 * - GOOGLE_GENAI_API_KEY
 * in Project Settings → Environment Variables.
 */
// Prefer 1.5-flash: separate free-tier quota from 2.0-flash; use 'googleai/gemini-2.0-flash' if you need 2.0
export const ai = genkit({
  plugins: [googleAI()],
  model: PRIMARY_GEMINI_MODEL,
});
