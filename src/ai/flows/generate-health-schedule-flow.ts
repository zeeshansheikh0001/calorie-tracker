
'use server';
/**
 * @fileOverview AI flow to generate a personalized daily health schedule.
 *
 * - generateHealthSchedule - A function that generates the health schedule.
 * - GenerateHealthScheduleInput - The input type for the function.
 * - GenerateHealthScheduleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateHealthScheduleInputSchema = z.object({
  calorieGoal: z.number().min(0).describe('Target daily calorie intake (kcal).'),
  proteinGoal: z.number().min(0).describe('Target daily protein intake (grams).'),
  fatGoal: z.number().min(0).describe('Target daily fat intake (grams).'),
  carbGoal: z.number().min(0).describe('Target daily carbohydrate intake (grams).'),
  weightGoalType: z
    .enum(['lose_weight', 'maintain_weight', 'gain_muscle', 'general_health'])
    .describe('User\'s primary weight or health goal (e.g., "lose_weight", "maintain_weight", "gain_muscle", "general_health").'),
  activityLevel: z
    .enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'])
    .describe('User\'s general daily activity level (e.g., "sedentary", "lightly_active").'),
  dietaryPreferences: z
    .string()
    .array()
    .optional()
    .describe('List of dietary preferences or restrictions (e.g., ["vegetarian", "gluten-free", "no_dairy"]). Can be empty.'),
  primaryFocus: z
    .string()
    .optional()
    .describe('Optional: User\'s primary fitness or health focus, e.g., "strength_training", "endurance", "stress_reduction", "improved_sleep".'),
  sleepHoursGoal: z.number().min(0).max(16).optional().describe('Optional: Target hours of sleep per night.'),
  workoutDays: z.string().array().optional().describe('Optional: Preferred days for workouts (e.g., ["Monday", "Wednesday", "Friday"]).'),
});
export type GenerateHealthScheduleInput = z.infer<typeof GenerateHealthScheduleInputSchema>;

export const GenerateHealthScheduleOutputSchema = z.object({
  dailyScheduleTitle: z.string().describe('A catchy and personalized title for the daily health plan (e.g., "Your Personalized Vitality Plan for Today!").'),
  introduction: z.string().optional().describe("A brief introductory or motivational message for the user's schedule."),
  mealTimingsAndPortions: z
    .array(
      z.object({
        time: z.string().describe('Suggested time for the meal (e.g., "8:00 AM - 9:00 AM", "Around 1 PM").'),
        mealType: z.string().describe('Type of meal (e.g., "Breakfast", "Lunch", "Dinner", "Snack").'),
        suggestion: z.string().describe('Specific meal suggestion with portion ideas and an approximate calorie count. (e.g., "Oatmeal with berries, chia seeds, and a sprinkle of almonds. Aim for ~350-450 kcal.").'),
      })
    )
    .describe('An array of 3-5 meal/snack suggestions with timings, specific food ideas, portion guidance, and rough calorie estimates aligned with overall goals.'),
  workoutSuggestion: z
    .object({
      time: z.string().optional().describe('Suggested time for the workout (e.g., "6:00 PM - 7:00 PM", "Morning before breakfast").'),
      workoutType: z.string().describe('General type of workout (e.g., "Full Body Strength Training", "Cardio Session", "Active Recovery & Yoga").'),
      description: z.string().describe('A brief description of the workout including example exercises or focus areas, duration, and intensity. Tailor to activity level and goals. (e.g., "Focus on compound movements like squats, push-ups, rows. 3 sets of 10-12 reps. Aim for 45-60 minutes. Modify intensity based on your activity level.").'),
      notes: z.string().optional().describe("Optional notes or tips for the workout."),
    })
    .describe('A tailored workout suggestion including type, description, and approximate timing if relevant.'),
  hydrationReminder: z.object({
    target: z.string().describe("Recommended daily water intake target (e.g., '2.5 - 3.5 liters', '8-10 glasses')."),
    tips: z.string().array().describe("Actionable tips for staying hydrated (e.g., 'Sip water consistently throughout the day.', 'Carry a water bottle.').")
  }).describe('Guidance on daily water intake and tips to achieve it.'),
  sleepSuggestion: z.object({
      target: z.string().describe("Recommended sleep duration (e.g., '7-9 hours of quality sleep.')."),
      bedtimeRoutineTip: z.string().optional().describe("A tip for a better bedtime routine (e.g., 'Wind down an hour before bed: read a book or meditate. Avoid screens.').")
  }).describe('Recommendations for sleep duration and quality.'),
  nutrientBalanceTip: z
    .string()
    .describe('A specific, actionable tip for improving nutrient balance based on the provided goals (e.g., "Ensure your meals include a variety of colorful vegetables for micronutrients.", "Prioritize lean protein sources at each meal to support muscle gain.").'),
  generalNotes: z
    .string()
    .optional()
    .describe('Any other general advice, motivational note, or disclaimer about the plan being a suggestion. (e.g., "Remember, consistency is key! Listen to your body and adjust as needed. This plan is a suggestion, consult with a professional for medical advice.").'),
});
export type GenerateHealthScheduleOutput = z.infer<typeof GenerateHealthScheduleOutputSchema>;

export async function generateHealthSchedule(input: GenerateHealthScheduleInput): Promise<GenerateHealthScheduleOutput> {
  return generateHealthScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHealthSchedulePrompt',
  input: {schema: GenerateHealthScheduleInputSchema},
  output: {schema: GenerateHealthScheduleOutputSchema},
  prompt: `You are an expert AI Health and Fitness Coach. Your goal is to generate a personalized, actionable, and encouraging daily health schedule based on the user's provided inputs. The user does NOT provide their meal logs for this task; generate the plan based on their stated goals and preferences.

User Inputs:
- Daily Calorie Goal: {{{calorieGoal}}} kcal
- Daily Protein Goal: {{{proteinGoal}}} g
- Daily Fat Goal: {{{fatGoal}}} g
- Daily Carb Goal: {{{carbGoal}}} g
- Weight/Health Goal: {{{weightGoalType}}}
- Activity Level: {{{activityLevel}}}
{{#if dietaryPreferences~}}
- Dietary Preferences/Restrictions: {{#each dietaryPreferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{else~}}
- Dietary Preferences/Restrictions: None specified.
{{/if~}}
{{#if primaryFocus~}}
- Primary Fitness/Health Focus: {{{primaryFocus}}}
{{/if~}}
{{#if sleepHoursGoal~}}
- Target Sleep Hours: {{{sleepHoursGoal}}} hours
{{/if~}}
{{#if workoutDays~}}
- Preferred Workout Days: {{#each workoutDays}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if~}}

Based on these inputs, create a comprehensive and inspiring daily health schedule. Ensure meal suggestions are practical, align with macro and calorie goals (provide rough estimates for meals), and respect dietary preferences. Workout suggestions should be appropriate for the user's activity level and goals.

Output Format:
Provide the output as a JSON object matching the GenerateHealthScheduleOutput schema.
- \`dailyScheduleTitle\`: Create a positive and personalized title.
- \`introduction\`: A short, encouraging intro.
- \`mealTimingsAndPortions\`: Suggest 3 main meals and 1-2 optional snacks. For each:
    - \`time\`: Suggest a flexible time (e.g., "Morning", "Around 1 PM", "Evening").
    - \`mealType\`: e.g., "Breakfast", "Lunch", "Dinner", "Snack".
    - \`suggestion\`: Provide specific food ideas, portion guidance, and a rough calorie estimate for the meal (e.g., "Grilled chicken salad with mixed greens, quinoa, and a light vinaigrette. Aim for ~400-500 kcal, high in protein.").
- \`workoutSuggestion\`:
    - \`time\`: Suggest a flexible time for the workout.
    - \`workoutType\`: e.g., "Strength Training", "Cardio", "Yoga".
    - \`description\`: Detail the workout, considering the user's activity level and primary focus.
    - \`notes\`: Add any relevant tips.
- \`hydrationReminder\`:
    - \`target\`: Recommended daily water intake.
    - \`tips\`: Actionable hydration tips.
- \`sleepSuggestion\`:
    - \`target\`: Recommended sleep duration.
    - \`bedtimeRoutineTip\`: A helpful tip for better sleep.
- \`nutrientBalanceTip\`: A specific tip to improve overall nutrient intake related to their goals.
- \`generalNotes\`: A concluding motivational remark or disclaimer.

Strive for helpful, specific, and encouraging advice. If dietary preferences conflict with general advice (e.g., high protein for vegetarian), make reasonable alternative suggestions.
`,
});

const generateHealthScheduleFlow = ai.defineFlow(
  {
    name: 'generateHealthScheduleFlow',
    inputSchema: GenerateHealthScheduleInputSchema,
    outputSchema: GenerateHealthScheduleOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    // Basic validation or transformation can happen here if needed
    if (!output) {
      throw new Error("AI failed to generate a schedule.");
    }
    return output;
  }
);
