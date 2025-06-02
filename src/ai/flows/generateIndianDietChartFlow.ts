
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
  dietaryPreferences: z.array(z.string()).describe('List of dietary preferences (e.g., vegetarian, vegan, gluten-free). Focus on making it an Indian diet. This is a CRITICAL input; the generated plan MUST strictly follow these preferences.'),
  allergies: z.array(z.string()).optional().describe('List of food allergies. The plan MUST NOT include these allergens.'),
  medicalConditions: z.array(z.string()).optional().describe('List of medical conditions to consider (e.g., diabetes, hypertension). Adapt the plan accordingly.'),
  duration: z.enum(["daily", "weekly"]).describe('Duration of the diet plan (daily or weekly).'),
});

export type GenerateIndianDietChartInput = z.infer<typeof indianDietChartInputSchema>;

// Output schema to produce a meal-by-meal plan
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
- Dietary Preferences: {{#if dietaryPreferences.length}}{{#each dietaryPreferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified (assume balanced omnivore Indian diet unless specified otherwise in common sense, e.g. Jain implies vegetarian){{/if}}
- Allergies: {{#if allergies.length}}{{#each allergies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
- Medical Conditions: {{#if medicalConditions.length}}{{#each medicalConditions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
- Plan Duration: {{{duration}}}

CRITICAL INSTRUCTIONS - Adherence to Dietary Preferences:
The user's 'Dietary Preferences' are the MOST IMPORTANT constraints. The generated plan MUST STRICTLY adhere to ALL specified preferences. If a common Indian food item conflicts with a preference, find a suitable Indian alternative that fits the preference.

Detailed Dietary Preference Guidelines (Indian Context):
1.  'Vegetarian': ABSOLUTELY NO meat, fish, or eggs. MUST include dairy (milk, curd, paneer, ghee), lentils, legumes, vegetables, fruits, grains. Many Indian dishes are naturally vegetarian.
2.  'Non-Vegetarian': Can include chicken, fish, mutton, eggs, and dairy. Prioritize lean meats and common Indian preparations (e.g., chicken curry, fish fry, egg bhurji).
3.  'Eggetarian': ABSOLUTELY NO meat or fish. CAN include eggs (e.g., egg curry, boiled eggs, omelettes) and dairy products. Base meals around eggs, dairy, lentils, vegetables, and grains.
4.  'Vegan': ABSOLUTELY NO animal products – no meat, fish, eggs, dairy (milk, paneer, ghee, curd), or honey. MUST use plant-based alternatives like tofu/tempeh (for paneer), plant-based milks (soy, almond, coconut), lentils, legumes, vegetables, fruits, grains. Many South Indian dishes (like idli, dosa without ghee, sambar) and North Indian lentil/vegetable dishes can be adapted.
5.  'Jain': EXTREMELY STRICT. ABSOLUTELY NO onion, garlic, ginger, root vegetables (potatoes, carrots, beets, etc.). Strict vegetarian (no meat, fish, eggs). Focus on allowed vegetables (gourds, cabbage, cauliflower, tomatoes, peas, beans), fruits, lentils (like moong dal), grains (rice, wheat). Use asafoetida (hing) instead of onion/garlic.
6.  'Gluten-Free': ABSOLUTELY NO wheat (roti, naan, paratha, suji/semolina, daliya), barley, or rye. MUST use gluten-free grains like rice (all varieties), millets (jowar, bajra, ragi, foxtail millet/kangni), quinoa, amaranth (rajgira), buckwheat (kuttu). Ensure items like poha, upma are made from gluten-free grains (e.g., rice poha, millet upma). Besan (gram flour) is gluten-free.
7.  'Dairy-Free': ABSOLUTELY NO milk, curd (yogurt), paneer, cheese, ghee, butter, mawa/khoya. Use plant-based milks, coconut milk/cream for gravies, oils instead of ghee. Tofu can replace paneer. Many traditional Indian dishes can be made dairy-free.
8.  'Nut-Free': ABSOLUTELY NO peanuts, almonds, cashews, walnuts, pistachios, or any other tree nuts or nut-based products (nut butters, nut pastes in gravies). Check ingredient lists carefully for hidden nuts. Use seeds like sunflower, pumpkin, sesame (if allowed) cautiously.
9.  'Low Carb': SIGNIFICANTLY REDUCE grains (rice, roti, bread), starchy vegetables (potatoes, sweet potatoes), sugary fruits, and sweets. EMPHASIZE protein (paneer, tofu, chicken, fish, eggs, some dals in moderation), non-starchy vegetables (leafy greens, cauliflower, brinjal, bhindi, capsicum), and healthy fats (ghee if not dairy-free, coconut oil, mustard oil, avocados). Indian dishes like paneer tikka, baingan bharta, vegetable stir-fries, egg bhurji, and low-carb "roti" alternatives (e.g., almond flour roti if nuts allowed, or coconut flour roti) are suitable.
10. 'Keto': VERY HIGH FAT, MODERATE PROTEIN, EXTREMELY LOW CARB (typically under 20-30g net carbs per day). FOCUS on high-fat dairy (paneer, cheese, cream, butter, ghee - if not dairy-free), eggs, meats (chicken, fish), non-starchy vegetables (spinach, cauliflower, cabbage, bell peppers), avocados, coconut oil, olive oil. Indian dishes include paneer/chicken tikka (no sugary marinades), egg bhurji with extra butter/oil, fish fried in coconut oil, vegetable sabzis cooked in ample fat, bulletproof coffee/tea. STRICTLY AVOID all grains, sugars, most fruits, starchy vegetables, and lentils/legumes.
11. 'Paleo': FOCUS on lean meats (chicken, fish), eggs, fruits, vegetables (especially non-starchy), nuts and seeds (if not nut-free). ABSOLUTELY NO grains (rice, wheat, millets, oats), legumes (dals, chana, rajma), dairy products, processed foods, refined sugars, or refined vegetable oils. Adapt Indian cooking using allowed ingredients: vegetable curries without lentils, meat/fish preparations with simple spices and healthy fats like coconut oil or ghee.

General Instructions (after applying dietary preferences):
1.  Output Format: Adhere strictly to the 'indianDietChartOutputSchema'. The plan MUST be meal-by-meal (Breakfast, Lunch, Dinner, and 1-2 light Snacks per day).
2.  Authentic & Affordable Indian Cuisine:
    *   All meals MUST be authentically Indian and mostly home-cooked.
    *   Focus on budget-friendly and commonly available ingredients found in a typical Indian kitchen.
    *   Specifically include ingredients like rice, roti (whole wheat, or alternatives for gluten-free), dal (various lentils like moong, masoor, toor), seasonal vegetables (e.g., bhindi, gobi, lauki, palak, carrots, beans, methi), curd (yogurt, or alternatives for dairy-free/vegan), sprouts, poha, upma, and basic fruits (e.g., banana, apple, guava, papaya, seasonal local fruits).
    *   Use simple spices and common Indian cooking methods. Ensure variety.
3.  Health & Balance: Ensure the diet is nutritionally balanced according to the user's profile and fitness goal, AFTER satisfying all dietary preferences.
    *   First, estimate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation:
        *   Men: BMR = (10 * weight) + (6.25 * height) - (5 * age) + 5
        *   Women: BMR = (10 * weight) + (6.25 * height) - (5 * age) - 161
    *   Adjust for activity level (Sedentary: BMR * 1.2; Lightly active: BMR * 1.375; Moderately active: BMR * 1.55; Very active: BMR * 1.725; Extra active: BMR * 1.9).
    *   Adjust for fitness goal (Weight loss: subtract ~500 kcal; Muscle gain: add ~300-500 kcal; Maintain: no change). This calculated value will be 'dailyCalories'.
4.  Meal Details (Crucial for each meal):
    *   'type': Specify Breakfast, Lunch, Dinner, or Snack.
    *   'name': A descriptive Indian name for the meal.
    *   'ingredients': List key Indian ingredients.
    *   'calories': Provide an approximate calorie count FOR THIS SPECIFIC MEAL. The sum of meal calories for a day should be close to the overall 'dailyCalories' target for that day.
    *   'nutrients': Provide protein, carbs, fats in grams for THIS MEAL. Fiber is optional but good to include.
    *   'preparationSteps': Optional, 1-2 brief, simple preparation steps if helpful.
5.  Plan Duration:
    *   If 'duration' is "daily", provide a plan for 1 day.
    *   If 'duration' is "weekly", provide a plan for 7 distinct days. The 'day' field in 'mealPlan' array objects should be populated. Ensure variety.
6.  Allergies & Medical Conditions: AVOID all specified 'allergies'. CONSIDER 'medicalConditions' (e.g., for diabetes, suggest low GI foods, whole grains, and limit sugar; for hypertension, suggest low sodium options) AFTER meeting dietary preferences.
7.  Macronutrient Breakdown: Provide overall daily 'protein', 'carbs', 'fats' in grams for the 'macroBreakdown' object for an average day.
8.  Nutrition Tips: Offer 2-5 practical tips relevant to Indian eating habits and user's goals.
9.  Hydration: Recommend daily water intake.

Ensure the response is a valid JSON object matching the output schema. Be thorough and provide realistic, actionable advice.
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
    
