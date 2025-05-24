'use server';
/**
 * @fileOverview AI flow to summarize a user's daily food log, compare with goals, and provide suggestions.
 *
 * - summarizeDailyLog - A function that generates the daily food log summary.
 * - SummarizeDailyLogInput - The input type for the function.
 * - SummarizeDailyLogOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FoodEntryShort, Goal } from '@/types';

const FoodEntryShortSchema = z.object({
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
});

const UserGoalsSchema = z.object({
  calories: z.number().min(0).describe('Target daily calorie intake (kcal).'),
  protein: z.number().min(0).describe('Target daily protein intake (grams).'),
  fat: z.number().min(0).describe('Target daily fat intake (grams).'),
  carb: z.number().min(0).describe('Target daily carbohydrate intake (grams).'), // Corrected from carbGoal
});

const SummarizeDailyLogInputSchema = z.object({
  foodEntries: z.array(FoodEntryShortSchema).describe('A list of food items consumed by the user on a specific day.'),
  userGoals: UserGoalsSchema.describe("The user's nutritional goals for the day."),
  date: z.string().describe("The date for which the summary is being generated, in YYYY-MM-DD format or human-readable like 'Today' or 'May 23, 2025'.")
});
export type SummarizeDailyLogInput = z.infer<typeof SummarizeDailyLogInputSchema>;

const SummarizeDailyLogOutputSchema = z.object({
  date: z.string().describe("The date for which the summary is provided, matching the input date format."),
  overallAssessment: z.string().describe("A brief, encouraging overall assessment of the day's intake. (e.g., 'Good progress today!' or 'Room for improvement on...')"),
  consumedItemsSummary: z.string().describe("A concise textual summary of the main food items consumed. (e.g., 'You had oatmeal for breakfast, a chicken salad for lunch, and salmon for dinner, along with an apple snack.'). Do not list every single item if many, but summarize the types of meals."),
  nutritionalAnalysis: z.string().describe("Analysis of total calorie and macronutrient intake compared to goals. Highlight areas of significant over/under consumption. (e.g., 'Your calorie intake was slightly above your goal. Protein was on target, but carbs were high. Fat intake was well within limits.')."),
  actionableSuggestions: z.array(z.string()).min(2).max(4).describe("2-4 personalized, actionable suggestions for improvement based on the day's intake and goals. Each suggestion should be a separate string in the array. (e.g., ['Consider reducing carb portions at dinner.', 'Incorporate more leafy greens for fiber.', 'Swap sugary snacks for fruit.'])")
});
export type SummarizeDailyLogOutput = z.infer<typeof SummarizeDailyLogOutputSchema>;


export async function summarizeDailyLog(input: SummarizeDailyLogInput): Promise<SummarizeDailyLogOutput> {
  return summarizeDailyLogFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDailyLogPrompt',
  input: { schema: SummarizeDailyLogInputSchema },
  output: { schema: SummarizeDailyLogOutputSchema },
  prompt: `You are an expert AI Nutritionist and Health Coach. Your task is to analyze a user's food log for a specific date, compare it against their nutritional goals, and provide a concise, insightful, and actionable summary.

User's Food Log for {{date}}:
{{#if foodEntries.length}}
{{#each foodEntries}}
- {{name}}: {{calories}} kcal, {{protein}}g Protein, {{fat}}g Fat, {{carbs}}g Carbs
{{/each}}
{{else}}
- No food items logged for this day.
{{/if}}

User's Nutritional Goals:
- Calories: {{userGoals.calories}} kcal
- Protein: {{userGoals.protein}} g
- Fat: {{userGoals.fat}} g
- Carbohydrates: {{userGoals.carb}} g

Instructions:
1.  **Date**: Ensure the output 'date' field matches the input '{{date}}'.
2.  **Overall Assessment**: Provide a brief, encouraging overall assessment of the day's intake (1-2 sentences).
3.  **Consumed Items Summary**: Concisely summarize the main types of food items or meals consumed. Avoid just re-listing every single item if the list is long; group or generalize where appropriate (e.g., "Included a mix of fruits, lean proteins, and whole grains."). If no items are logged, state that.
4.  **Nutritional Analysis**:
    *   Calculate the total consumed calories, protein, fat, and carbohydrates from the foodEntries.
    *   Compare these totals against the user's goals.
    *   Provide a textual analysis highlighting if they were under, over, or on target for calories and each macronutrient. Mention specific numbers or percentages if it adds clarity, but keep it readable.
5.  **Actionable Suggestions**:
    *   Generate 2-4 distinct, personalized, and actionable suggestions for improvement.
    *   These suggestions should be based on the day's specific intake and how it aligns (or doesn't) with their goals.
    *   Examples: "Consider adding a protein source to your breakfast to help meet your protein goal.", "If you're feeling hungry, try incorporating more fiber-rich vegetables.", "You were a bit high on carbs; perhaps opt for a smaller portion of rice next time."
    *   If intake is well-balanced, suggestions can be about maintaining good habits or exploring variety.
    *   If no food was logged, suggestions can be about the benefits of tracking or simple tips for starting.

Provide your response as a JSON object matching the output schema. Be empathetic and encouraging in your tone.
`,
});

const summarizeDailyLogFlow = ai.defineFlow(
  {
    name: 'summarizeDailyLogFlow',
    inputSchema: SummarizeDailyLogInputSchema,
    outputSchema: SummarizeDailyLogOutputSchema,
  },
  async (input) => {
    // Handle case where foodEntries might be undefined or null from client
    const safeInput = {
      ...input,
      foodEntries: input.foodEntries || [],
    };
    const { output } = await prompt(safeInput);
    if (!output) {
      throw new Error("AI failed to generate a daily log summary.");
    }
    return output;
  }
);
