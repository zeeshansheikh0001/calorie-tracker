
'use server';
/**
 * @fileOverview AI flow to generate a personalized Indian diet plan as a list of daily food items.
 *
 * - generateIndianDietChart - A function that generates the Indian diet plan.
 * - GenerateIndianDietChartInput - The input type for the function.
 * - GenerateIndianDietChartOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const indianDietPreferenceEnum = z.enum([
  "vegetarian", 
  "non_vegetarian", 
  "eggetarian", 
  "vegan", 
  "jain", 
  "gluten_free", 
  "dairy_free", 
  "nut_free", 
  "low_carb", 
  "keto", 
  "paleo"
]).describe('The primary dietary preference for the Indian diet plan.');

const indianDietChartInputSchema = z.object({
  age: z.number().min(1).max(120).optional().describe('User age in years. Use average adult (e.g., 30) if not provided.'),
  gender: z.enum(["male", "female", "other"]).optional().describe('User gender. Assume a balanced approach if not provided.'),
  weight: z.number().min(1).max(500).optional().describe('User weight in kg. Use average if not provided (e.g., male 70kg, female 60kg).'),
  height: z.number().min(1).max(300).optional().describe('User height in cm. Use average if not provided (e.g., male 170cm, female 160cm).'),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active",
  ]).default("moderately_active").describe('User activity level. Default to moderately_active.'),
  fitnessGoal: z.enum([
    "weight_loss",
    "maintain_weight",
    "muscle_gain",
    "general_health",
  ]).default("general_health").describe('User fitness goal. Default to general_health.'),
  dietaryPreference: indianDietPreferenceEnum.describe('The primary dietary preference.'),
  allergies: z.array(z.string()).optional().describe('List of food allergies to avoid.'),
  medicalConditions: z.array(z.string()).optional().describe('List of medical conditions to consider.'),
  // Duration is no longer directly used by the prompt for daily list, but kept for potential future use or context
  duration: z.enum(["daily"]).default("daily").describe('The plan duration, always "daily" for this specific output format.'), 
});

export type GenerateIndianDietChartInput = z.infer<typeof indianDietChartInputSchema>;

const indianDietChartOutputSchema = z.object({
  dietTitle: z.string().describe("A suitable title for the generated diet plan (e.g., 'Budget-Friendly Vegetarian Indian Day Plan', 'High-Protein Non-Vegetarian Indian Diet')."),
  dailyFoodItems: z.array(
    z.object({
      name: z.string().describe("Name of the food item (e.g., 'Whole Wheat Roti', 'Dal (Mixed Lentils)', 'Seasonal Vegetable Curry', 'Grilled Chicken Breast', 'Apple')."),
      quantity: z.string().describe("Approximate total quantity for the entire day (e.g., '4 medium rotis', '1.5 cups cooked dal', '200g chicken', '1 medium apple', '1 bowl mixed salad'). Be specific with units like cups, grams, pieces etc."),
      notes: z.string().optional().describe("Optional notes like preparation hints, alternatives, or time of consumption if particularly relevant (e.g., 'Cook with minimal oil', 'Can be eaten as a mid-morning snack', 'Replace with paneer for vegetarian option').")
    })
  ).min(5).describe("A list of at least 5-10 core food items and their approximate total quantities for the entire day. Should be budget-friendly and commonly available in India. Ensure variety covering grains, proteins, vegetables, fruits, and dairy/alternatives as per dietary preference."),
  estimatedDailyCalories: z.number().int().describe("Approximate total daily calorie intake from the suggested food items. Round to nearest 10."),
  estimatedDailyProtein: z.number().int().describe("Approximate total daily protein intake in grams. Round to nearest gram."),
  estimatedDailyFat: z.number().int().describe("Approximate total daily fat intake in grams. Round to nearest gram."),
  estimatedDailyCarbs: z.number().int().describe("Approximate total daily carbohydrate intake in grams. Round to nearest gram."),
  generalTips: z.array(z.string()).max(3).optional().describe("Up to 3 general healthy eating tips relevant to the Indian context or the specific diet type. (e.g., 'Include a variety of colorful vegetables.', 'Stay hydrated by drinking plenty of water.')."),
  hydrationRecommendation: z.string().optional().describe("A general daily water intake recommendation (e.g., 'Aim for 2-3 liters of water per day.')."),
  disclaimer: z.string().default("This is a general diet suggestion. Individual nutritional needs may vary. Consult with a nutritionist or doctor for personalized advice, especially if you have any medical conditions.").describe("A brief disclaimer.")
});

export type GenerateIndianDietChartOutput = z.infer<typeof indianDietChartOutputSchema>;

export async function generateIndianDietChart(input: GenerateIndianDietChartInput): Promise<GenerateIndianDietChartOutput> {
  const prompt = ai.definePrompt({
    name: 'generateIndianDietChartPrompt',
    input: {schema: indianDietChartInputSchema},
    output: {schema: indianDietChartOutputSchema},
    prompt: `Create a full-day Indian diet plan based on the user's details and preferences. The plan should focus on affordable and commonly available ingredients in a typical Indian kitchen. It must be a list of total food items and their approximate quantities for the entire day, NOT divided into meals (breakfast, lunch, dinner).

User Details:
- Age: {{{age}}}{{#unless age}}Not specified (assume average adult){{/unless}}
- Gender: {{{gender}}}{{#unless gender}}Not specified{{/unless}}
- Weight: {{{weight}}} kg{{#unless weight}} (Not specified){{/unless}}
- Height: {{{height}}} cm{{#unless height}} (Not specified){{/unless}}
- Activity Level: {{{activityLevel}}}
- Fitness Goal: {{{fitnessGoal}}}
- Dietary Preference: {{{dietaryPreference}}}
{{#if allergies~}}
- Allergies to avoid: {{#each allergies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{else~}}
- Allergies: None specified.
{{/if~}}
{{#if medicalConditions~}}
- Medical Conditions to consider: {{#each medicalConditions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{else~}}
- Medical Conditions: None specified.
{{/if~}}

Instructions:
1.  **Output Format**: Adhere strictly to the 'indianDietChartOutputSchema'.
2.  **Diet Title**: Create a descriptive title for the plan.
3.  **Daily Food Items (Key Requirement)**:
    *   Provide a list of 5-10 core food items for the ENTIRE DAY.
    *   For each item, specify its name and approximate total quantity for the day (e.g., "Whole Wheat Roti", "4 medium rotis"; "Mixed Dal", "1.5 cups cooked"; "Seasonal Sabzi (e.g., Bhindi)", "2 cups cooked"; "Curd/Yogurt", "1 cup"; "Apple", "1 medium").
    *   Include a variety of food groups: grains (rice, roti), lentils/legumes (dal, chana), seasonal vegetables, fruits, dairy/alternatives (curd, paneer, tofu if vegan), and protein sources (eggs, chicken, fish if non-vegetarian/eggetarian, or plant-based proteins like chickpeas, soy chunks for others).
    *   Ingredients should be commonly available in Indian kitchens and budget-friendly.
    *   Optional: Add brief notes for items if necessary (e.g., "Cook with minimal oil", "As a snack").
4.  **Estimated Daily Nutrition**: Calculate and provide the approximate total daily calories (rounded to nearest 10), protein (grams, rounded), fat (grams, rounded), and carbs (grams, rounded) for the entire list of food items. This should be a sum for the day.
5.  **Personalization**:
    *   If user details (age, gender, weight, height) are provided, tailor the quantities and total calories to suit an adult with those characteristics and the specified activity level and fitness goal.
    *   If user details are NOT provided, assume an 'average adult' (e.g., 30 years old, male 70kg 170cm / female 60kg 160cm) with 'moderate physical activity' and 'general health' goal.
    *   Crucially, the plan MUST strictly adhere to the specified 'dietaryPreference'. For example:
        *   'vegetarian': No meat, fish, eggs. Include dairy.
        *   'non_vegetarian': Can include meat, fish, eggs, dairy.
        *   'eggetarian': No meat, fish. Can include eggs and dairy.
        *   'vegan': No meat, fish, eggs, dairy, honey. Use plant-based alternatives.
        *   'jain': No onion, garlic, root vegetables. Strict vegetarian.
        *   'gluten_free': Avoid wheat, barley, rye. Use alternatives like rice, millets, quinoa.
        *   'dairy_free': Avoid milk, curd, paneer, ghee. Use dairy-free alternatives.
        *   'nut_free': Avoid all nuts and nut-based products.
        *   'low_carb': Emphasize protein, fats, and fiber-rich vegetables; limit grains and sugary fruits.
        *   'keto': Very high fat, moderate protein, very low carb. Focus on items like paneer, cheese, eggs, meat (if non-veg), non-starchy vegetables, healthy fats.
        *   'paleo': Focus on lean meats, fish, fruits, vegetables, nuts, seeds. Avoid grains, legumes, dairy, processed foods.
    *   Consider specified 'allergies' and 'medicalConditions' by avoiding problematic ingredients.
6.  **General Tips**: Provide 1-3 general healthy eating tips.
7.  **Hydration**: Provide a general water intake recommendation.
8.  **Disclaimer**: Include the default disclaimer.

Example for 'dailyFoodItems' entry:
{ "name": "Brown Rice", "quantity": "1 cup (cooked measure for the day)", "notes": "Can be split across lunch and dinner." }
{ "name": "Moong Dal", "quantity": "1.5 cups (cooked measure for the day)", "notes": "Cook with simple spices." }

Ensure the response is a valid JSON object matching the output schema.
`,
  });

  const indianDietChartFlow = ai.defineFlow(
    {
      name: 'generateIndianDietChartFlow',
      inputSchema: indianDietChartInputSchema,
      outputSchema: indianDietChartOutputSchema,
    },
    async (flowInput) => {
      // If certain optional fields are not provided, AI will use defaults based on prompt.
      const {output} = await prompt(flowInput);
      if (!output) {
        throw new Error("AI failed to generate an Indian diet chart.");
      }
      return output;
    }
  );
  
  return indianDietChartFlow(input);
}

    