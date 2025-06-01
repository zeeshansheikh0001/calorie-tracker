
'use server';
/**
 * @fileOverview AI flow to generate a personalized Indian diet chart, meal by meal.
 *
 * - generateIndianDietChart - A function that generates the Indian diet plan.
 * - GenerateIndianDietChartInput - The input type for the function.
 * - GenerateIndianDietChartOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema to match the form data from /app/diet-chart/page.tsx
const indianDietChartInputSchema = z.object({
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
  ]).describe('User activity level.'),
  fitnessGoal: z.enum([
    "weight_loss",
    "maintain_weight",
    "muscle_gain",
    "general_health",
  ]).describe('User fitness goal.'),
  dietaryPreferences: z.array(z.string()).describe('List of dietary preferences (e.g., vegetarian, vegan, gluten-free). Focus on making it an Indian diet.'),
  allergies: z.array(z.string()).optional().describe('List of food allergies.'),
  medicalConditions: z.array(z.string()).optional().describe('List of medical conditions to consider.'),
  duration: z.enum(["daily", "weekly"]).describe('Duration of the diet plan (daily or weekly).'),
});

export type GenerateIndianDietChartInput = z.infer<typeof indianDietChartInputSchema>;

// Output schema to produce a meal-by-meal plan, similar to the original generic diet chart
const indianDietChartOutputSchema = z.object({
  dailyCalories: z.number().describe('Recommended daily calorie intake for the Indian diet.'),
  macroBreakdown: z.object({
    protein: z.number().describe('Daily protein intake in grams.'),
    carbs: z.number().describe('Daily carbohydrate intake in grams.'),
    fats: z.number().describe('Daily fat intake in grams.'),
  }).describe('Macronutrient breakdown for the Indian diet.'),
  mealPlan: z.array(
    z.object({
      day: z.string().optional().describe('Day of the week (for weekly plans, e.g., "Monday", "Day 1").'),
      meals: z.array(
        z.object({
          type: z.enum(["breakfast", "lunch", "snack", "dinner"]).describe('Type of meal (e.g., Breakfast).'),
          name: z.string().describe('Name of the Indian meal (e.g., "Masala Oats", "Dal Tadka with Brown Rice", "Sprout Salad", "Vegetable Pulao").'),
          ingredients: z.array(z.string()).describe('List of main Indian ingredients (e.g., "Rolled Oats", "Mixed Vegetables", "Turmeric", "Moong Dal", "Basmati Rice").'),
          calories: z.number().int().describe('Approximate calories in the meal.'),
          nutrients: z.object({
            protein: z.number().describe('Protein content in grams.'),
            carbs: z.number().describe('Carbohydrate content in grams.'),
            fats: z.number().describe('Fat content in grams.'),
            fiber: z.number().optional().describe('Fiber content in grams (optional).'),
          }).describe('Nutritional information for the meal.'),
          preparationSteps: z.array(z.string()).optional().describe('Optional brief preparation steps for the Indian meal.'),
        })
      ).min(3).describe('At least 3-4 meals for the day (Breakfast, Lunch, Dinner, optional Snack), focusing on Indian cuisine.'),
    })
  ).min(1).describe('Complete meal plan. For "daily" duration, provide 1 day. For "weekly", provide 7 days.'),
  nutritionTips: z.array(z.string()).min(2).max(5).describe('2-5 nutritional tips relevant to an Indian diet and the user\'s goals.'),
  hydrationRecommendation: z.string().describe('Daily water intake recommendation (e.g., "2-3 liters of water per day").'),
});

export type GenerateIndianDietChartOutput = z.infer<typeof indianDietChartOutputSchema>;

export async function generateIndianDietChart(input: GenerateIndianDietChartInput): Promise<GenerateIndianDietChartOutput> {
  const prompt = ai.definePrompt({
    name: 'generateIndianDietChartMealByMealPrompt',
    input: {schema: indianDietChartInputSchema},
    output: {schema: indianDietChartOutputSchema},
    prompt: `You are an expert Indian nutritionist and dietitian. Your task is to create a personalized, meal-by-meal Indian diet plan that is healthy, balanced, budget-friendly, and uses commonly available Indian kitchen ingredients.

User Details:
- Age: {{{age}}} years
- Gender: {{{gender}}}
- Weight: {{{weight}}} kg
- Height: {{{height}}} cm
- Activity Level: {{{activityLevel}}}
- Fitness Goal: {{{fitnessGoal}}}
- Dietary Preferences: {{#if dietaryPreferences.length}}{{join dietaryPreferences ", "}}{{else}}None specified (assume balanced omnivore Indian diet unless specified otherwise in common sense, e.g. Jain implies vegetarian){{/if}}
- Allergies: {{#if allergies.length}}{{join allergies ", "}}{{else}}None specified{{/if}}
- Medical Conditions: {{#if medicalConditions.length}}{{join medicalConditions ", "}}{{else}}None specified{{/if}}
- Plan Duration: {{{duration}}}

Instructions:
1.  **Output Format**: Adhere strictly to the 'indianDietChartOutputSchema'. The plan MUST be meal-by-meal (Breakfast, Lunch, Dinner, and 1-2 light Snacks).
2.  **Indian Cuisine Focus**: All meals must be authentically Indian, using common household ingredients like dal, rice, roti (whole wheat), seasonal vegetables (e.g., bhindi, gobi, lauki, palak), fruits, curd/yogurt, paneer, and simple spices. Ensure variety.
3.  **Budget-Friendly & Availability**: Prioritize ingredients that are affordable and easily available in a typical Indian market.
4.  **Health & Balance**: Ensure the diet is nutritionally balanced according to the user's profile and fitness goal.
    *   First, estimate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation:
        *   Men: BMR = (10 * weight) + (6.25 * height) - (5 * age) + 5
        *   Women: BMR = (10 * weight) + (6.25 * height) - (5 * age) - 161
    *   Adjust for activity level (Sedentary: BMR * 1.2; Lightly active: BMR * 1.375; Moderately active: BMR * 1.55; Very active: BMR * 1.725; Extra active: BMR * 1.9).
    *   Adjust for fitness goal (Weight loss: subtract ~500 kcal; Muscle gain: add ~300-500 kcal; Maintain: no change). This calculated value will be 'dailyCalories'.
5.  **Meal Details**: For each meal:
    *   `type`: Specify Breakfast, Lunch, Dinner, or Snack.
    *   `name`: A descriptive Indian name for the meal (e.g., "Moong Dal Cheela with Mint Chutney", "Chicken Curry with 2 Rotis and Salad").
    *   `ingredients`: List key ingredients (e.g., "Moong dal, Besan, Onion, Tomato, Spices", "Chicken breast, Onion-tomato gravy, Whole wheat flour").
    *   `calories`: Provide an approximate calorie count for the meal. The sum of meal calories should be close to the `dailyCalories` target.
    *   `nutrients`: Provide protein, carbs, fats in grams. Fiber is optional.
    *   `preparationSteps`: Optional, 1-2 brief steps if helpful.
6.  **Plan Duration**:
    *   If `duration` is "daily", provide a plan for 1 day.
    *   If `duration` is "weekly", provide a plan for 7 distinct days (e.g., Day 1, Day 2... or Monday, Tuesday...). The `day` field in `mealPlan` array objects should be populated.
7.  **Dietary Preferences & Restrictions**:
    *   Strictly adhere to `dietaryPreferences`. Examples:
        *   Vegetarian: No meat, fish, eggs. Include dairy, paneer, lentils.
        *   Non-Vegetarian: Can include chicken, fish, eggs, mutton (use lean options).
        *   Vegan: No animal products (meat, dairy, eggs, honey). Use tofu, lentils, plant-based milk.
        *   Jain: No onion, garlic, root vegetables. Strict vegetarian.
        *   Gluten-Free: Avoid wheat, barley, rye. Use rice, millets, jowar, bajra.
    *   Avoid all `allergies`.
    *   Consider `medicalConditions` (e.g., for diabetes, suggest low GI foods; for hypertension, low sodium).
8.  **Macronutrient Breakdown**: Provide overall daily `protein`, `carbs`, `fats` in grams for the `macroBreakdown` object.
9.  **Nutrition Tips**: Offer 2-5 practical tips relevant to Indian eating habits and the user's goals.
10. **Hydration**: Recommend daily water intake.

Example for a meal:
{
  "type": "lunch",
  "name": "Rajma Chawal with Cucumber Raita",
  "ingredients": ["Rajma (Kidney Beans)", "Basmati Rice", "Onion", "Tomato", "Ginger-Garlic Paste", "Spices", "Cucumber", "Curd (Yogurt)"],
  "calories": 450,
  "nutrients": {"protein": 15, "carbs": 70, "fats": 10, "fiber": 12},
  "preparationSteps": ["Cook rajma with onion-tomato gravy.", "Serve with steamed rice and cucumber raita."]
}

Ensure the response is a valid JSON object matching the output schema.
`,
  });

  const indianDietChartFlow = ai.defineFlow(
    {
      name: 'generateIndianDietChartMealByMealFlow', // Renamed flow
      inputSchema: indianDietChartInputSchema,
      outputSchema: indianDietChartOutputSchema,
    },
    async (flowInput) => {
      const {output} = await prompt(flowInput);
      if (!output) {
        throw new Error("AI failed to generate an Indian diet chart.");
      }
      return output;
    }
  );
  
  return indianDietChartFlow(input);
}
    
