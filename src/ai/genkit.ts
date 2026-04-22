import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const DEFAULT_GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'] as const;

function toGoogleModelPath(model: string): string {
  return model.startsWith('googleai/') ? model : `googleai/${model}`;
}

function parseModelList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}

const configuredModel = process.env.AI_MODEL?.trim();
const configuredModelCandidates = parseModelList(process.env.AI_MODEL_CANDIDATES);
const defaultModelCandidates = DEFAULT_GEMINI_MODELS.map(toGoogleModelPath);

export const GEMINI_MODEL_CANDIDATES = dedupe([
  ...(configuredModel ? [toGoogleModelPath(configuredModel)] : []),
  ...configuredModelCandidates.map(toGoogleModelPath),
  ...defaultModelCandidates,
]);

/**
 * Genkit AI with Google Gemini. For production (e.g. Vercel), set one of:
 * - GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENAI_API_KEY
 * Optional:
 * - AI_MODEL to set the primary model (e.g. gemini-2.5-flash)
 * - AI_MODEL_CANDIDATES (comma-separated) for retry/fallback order, including Gemma if your key has access.
 * Use gemini-2.0-flash (default) — gemini-1.5-flash can 404 on some API versions.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: GEMINI_MODEL_CANDIDATES[0] || 'googleai/gemini-2.0-flash',
});
