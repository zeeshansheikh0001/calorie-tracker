import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * Genkit AI with Google Gemini. For production (e.g. Vercel), set one of:
 * - GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENAI_API_KEY
 * Optional: AI_MODEL overrides the model (e.g. gemini-2.5-flash, gemini-2.0-flash-lite).
 * Use gemini-2.0-flash (default) — gemini-1.5-flash can 404 on some API versions.
 */
const geminiModel = process.env.AI_MODEL?.trim() || 'gemini-2.0-flash';
export const ai = genkit({
  plugins: [googleAI()],
  model: `googleai/${geminiModel}`,
});
