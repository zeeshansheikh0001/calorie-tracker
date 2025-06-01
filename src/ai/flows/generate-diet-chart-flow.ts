'use server';
/**
 * @fileOverview AI flow to generate a personalized diet chart.
 *
 * - generateDietChart - A function that generates a personalized diet chart.
 * - GenerateDietChartInput - The input type for the function.
 * - GenerateDietChartOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema definitions - not directly exported from this file
const dietChartInputSchema = z.object({
  age: z.number().min(1).max(120).describe('User age in years.'),
  gender: z.enum(["male", "female", "other"]).describe('User gender.'),
  weight: z.number().min(1).max(500).describe('User weight in kg.'),
  height: z.number().min(1).max(300).describe('User height in cm.'),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active",
  ]).describe('User activity level from sedentary to extra active.'),
  fitnessGoal: z.enum([
    "weight_loss",
    "maintain_weight",
    "muscle_gain",
    "general_health",
  ]).describe('User fitness goal.'),
  dietaryPreferences: z.array(z.string()).describe('List of dietary preferences (e.g., vegetarian, vegan, gluten-free).'),
  allergies: z.array(z.string()).optional().describe('List of food allergies.'),
  medicalConditions: z.array(z.string()).optional().describe('List of medical conditions to consider.'),
  duration: z.enum(["daily", "weekly"]).describe('Duration of the diet plan (daily or weekly).'),
});

// Type definition for input - used by client components
export type GenerateDietChartInput = z.infer<typeof dietChartInputSchema>;

const dietChartOutputSchema = z.object({
  dailyCalories: z.number().describe('Recommended daily calorie intake.'),
  macroBreakdown: z.object({
    protein: z.number().describe('Daily protein intake in grams.'),
    carbs: z.number().describe('Daily carbohydrate intake in grams.'),
    fats: z.number().describe('Daily fat intake in grams.'),
  }).describe('Macronutrient breakdown.'),
  mealPlan: z.array(
    z.object({
      day: z.string().optional().describe('Day of the week (for weekly plans).'),
      meals: z.array(
        z.object({
          type: z.enum(["breakfast", "lunch", "snack", "dinner"]).describe('Type of meal.'),
          name: z.string().describe('Name of the meal.'),
          ingredients: z.array(z.string()).describe('List of ingredients.'),
          calories: z.number().describe('Calories in the meal.'),
          nutrients: z.object({
            protein: z.number().describe('Protein content in grams.'),
            carbs: z.number().describe('Carbohydrate content in grams.'),
            fats: z.number().describe('Fat content in grams.'),
            fiber: z.number().optional().describe('Fiber content in grams.'),
          }).describe('Nutritional information.'),
          preparationSteps: z.array(z.string()).optional().describe('Optional preparation steps.'),
        })
      ).describe('Meals for the day.'),
    })
  ).describe('Complete meal plan.'),
  nutritionTips: z.array(z.string()).describe('Nutritional tips and recommendations.'),
  hydrationRecommendation: z.string().describe('Daily water intake recommendation.'),
});

// Type definition for output - used by client components
export type GenerateDietChartOutput = z.infer<typeof dietChartOutputSchema>;

// The only exported async function - complies with 'use server' directive
export async function generateDietChart(input: GenerateDietChartInput): Promise<GenerateDietChartOutput> {
  const prompt = ai.definePrompt({
    name: 'generateDietChartPrompt',
    input: {schema: dietChartInputSchema},
    output: {schema: dietChartOutputSchema},
    prompt: `You are a certified nutritionist and dietitian with expertise in creating personalized meal plans.
    
  Your task is to create a detailed, personalized diet chart based on the user's information.
  
  User Inputs:
  - Age: {{{age}}} years
  - Gender: {{{gender}}}
  - Weight: {{{weight}}} kg
  - Height: {{{height}}} cm
  - Activity Level: {{{activityLevel}}}
  - Fitness Goal: {{{fitnessGoal}}}
  {{#if dietaryPreferences~}}
  - Dietary Preferences: {{#each dietaryPreferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{else~}}
  - Dietary Preferences: None specified.
  {{/if~}}
  {{#if allergies~}}
  - Allergies: {{#each allergies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{else~}}
  - Allergies: None specified.
  {{/if~}}
  {{#if medicalConditions~}}
  - Medical Conditions: {{#each medicalConditions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{else~}}
  - Medical Conditions: None specified.
  {{/if~}}
  - Duration: {{{duration}}} (daily or weekly plan)
  
  First, calculate their BMR (Basal Metabolic Rate) using the Mifflin-St Jeor equation:
  - For men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  - For women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  
  Then adjust for activity level:
  - Sedentary: BMR × 1.2
  - Lightly active: BMR × 1.375
  - Moderately active: BMR × 1.55
  - Very active: BMR × 1.725
  - Extra active: BMR × 1.9
  
  Finally, adjust for fitness goal:
  - Weight loss: Subtract 500 calories
  - Muscle gain: Add 300-500 calories
  - Maintain weight: Keep the same
  
  Create a comprehensive meal plan with:
  1. Daily calorie target
  2. Macronutrient breakdown (protein, carbs, fats)
  3. Detailed meal plans for each meal (breakfast, lunch, dinner, snacks)
  4. For each meal, include name, ingredients, calories, and nutritional information
  5. Optional preparation steps for more complex meals
  6. Nutritional tips specific to their goals
  7. Hydration recommendations
  
  Ensure all meals respect their dietary preferences, allergies, and medical conditions.
  If they requested a weekly plan, provide a 7-day rotation of different meals.
  If they requested a daily plan, provide a single day detailed meal plan.
  
  The response should be well-structured, scientifically accurate, and personalized to the user's specific needs.`,
  });

  const dietChartFlow = ai.defineFlow(
    {
      name: 'generateDietChartFlow',
      inputSchema: dietChartInputSchema,
      outputSchema: dietChartOutputSchema,
    },
    async (flowInput) => {
      const {output} = await prompt(flowInput);
      if (!output) {
        throw new Error("AI failed to generate a diet chart.");
      }
      return output;
    }
  );
  
  return dietChartFlow(input);
} 