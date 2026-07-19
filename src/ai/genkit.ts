/**
 * Legacy Genkit bootstrap kept for `genkit:dev` tooling only.
 * App AI flows use NVIDIA NIM via `src/ai/nvidia.ts`.
 */
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.0-flash-lite",
});
