import type { DailyLogEntry, FoodEntry, Goal } from "@/types/domain";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

/** How close intake is to goal — peaking at 100% when within ±10%. */
export function adherenceScore(value: number, goal: number): number {
  if (goal <= 0) return 0;
  const ratio = value / goal;
  if (ratio <= 0) return 0;
  if (ratio <= 1) return clamp(ratio * 100);
  // Overshoot soft-penalize
  const over = ratio - 1;
  return clamp(100 - over * 120);
}

export function proteinScore(protein: number, goal: number): number {
  return adherenceScore(protein, goal);
}

export function calorieScore(calories: number, goal: number): number {
  return adherenceScore(calories, goal);
}

export function healthScore(input: {
  log: DailyLogEntry;
  goals: Goal;
  mealCount: number;
  waterMl: number;
  waterGoalMl: number;
}): number {
  const cal = calorieScore(input.log.calories, input.goals.calories);
  const pro = proteinScore(input.log.protein, input.goals.protein);
  const carbs = adherenceScore(input.log.carbs, input.goals.carbs);
  const fat = adherenceScore(input.log.fat, input.goals.fat);
  const meals = clamp(input.mealCount * 25);
  const water =
    input.waterGoalMl > 0
      ? clamp((input.waterMl / input.waterGoalMl) * 100)
      : 0;

  return Math.round(
    cal * 0.3 + pro * 0.3 + carbs * 0.1 + fat * 0.1 + meals * 0.1 + water * 0.1
  );
}

export type CoachInsight = {
  id: string;
  tone: "celebrate" | "nudge" | "tip" | "streak";
  message: string;
};

export function buildCoachInsights(input: {
  name: string;
  log: DailyLogEntry;
  goals: Goal;
  mealCount: number;
  streak: number;
  weekLogs: DailyLogEntry[];
  waterMl: number;
  waterGoalMl: number;
}): CoachInsight[] {
  const insights: CoachInsight[] = [];
  const first = input.name?.split(" ")[0] || "there";
  const proteinLeft = Math.max(0, Math.round(input.goals.protein - input.log.protein));
  const carbsLeft = Math.max(0, Math.round(input.goals.carbs - input.log.carbs));
  const calLeft = Math.max(0, Math.round(input.goals.calories - input.log.calories));
  const waterLeft = Math.max(0, input.waterGoalMl - input.waterMl);

  const weekScores = input.weekLogs.map((d) =>
    calorieScore(d.calories, input.goals.calories)
  );
  const todayScore = calorieScore(input.log.calories, input.goals.calories);
  const bestWeek = Math.max(...weekScores, 0);
  const isBestDay =
    input.log.calories > 0 && todayScore >= bestWeek && todayScore >= 70;

  if (input.mealCount === 0) {
    insights.push({
      id: "empty",
      tone: "tip",
      message: `Good morning, ${first}. Snap or describe your first meal — I'll handle the macros.`,
    });
  }

  if (proteinLeft > 0 && proteinLeft <= 40 && input.mealCount > 0) {
    insights.push({
      id: "protein-close",
      tone: "nudge",
      message: `You're only ${proteinLeft}g away from your protein goal.`,
    });
  } else if (proteinLeft > 40) {
    insights.push({
      id: "protein-gap",
      tone: "tip",
      message: `Add a protein-forward snack — you still need about ${proteinLeft}g.`,
    });
  } else if (input.log.protein >= input.goals.protein && input.mealCount > 0) {
    insights.push({
      id: "protein-hit",
      tone: "celebrate",
      message: "Protein goal crushed. Your muscles will thank you tonight.",
    });
  }

  if (isBestDay) {
    insights.push({
      id: "best-day",
      tone: "celebrate",
      message: "Great job — today is shaping up as your healthiest day this week.",
    });
  }

  if (carbsLeft > 0 && carbsLeft <= 50) {
    insights.push({
      id: "carb-close",
      tone: "tip",
      message: `Eat one banana or a small bowl of oats to reach your carb target (~${carbsLeft}g left).`,
    });
  }

  if (calLeft > 0 && calLeft < 250 && input.mealCount > 0) {
    insights.push({
      id: "cal-close",
      tone: "nudge",
      message: `Only ${calLeft} kcal left in your day — keep snacks light.`,
    });
  }

  if (input.log.calories > input.goals.calories * 1.1) {
    insights.push({
      id: "cal-over",
      tone: "tip",
      message: "Skip sugary drinks today — you're already past your calorie target.",
    });
  }

  if (waterLeft > 0 && waterLeft <= 500) {
    insights.push({
      id: "water-close",
      tone: "nudge",
      message: `Almost there — ${waterLeft}ml of water to hit today's hydration goal.`,
    });
  } else if (input.waterMl === 0) {
    insights.push({
      id: "water-start",
      tone: "tip",
      message: "Start with a glass of water. Hydration sharpens every other score.",
    });
  }

  if (input.streak >= 3) {
    insights.push({
      id: "streak",
      tone: "streak",
      message: `${input.streak}-day streak. Consistency is your superpower.`,
    });
  }

  return insights.slice(0, 4);
}

export type MealSuggestion = {
  id: string;
  title: string;
  reason: string;
  macros: string;
};

export function recommendMeals(input: {
  log: DailyLogEntry;
  goals: Goal;
}): MealSuggestion[] {
  const proteinLeft = input.goals.protein - input.log.protein;
  const carbsLeft = input.goals.carbs - input.log.carbs;
  const calLeft = input.goals.calories - input.log.calories;
  const suggestions: MealSuggestion[] = [];

  if (proteinLeft > 25) {
    suggestions.push({
      id: "greek-yogurt",
      title: "Greek yogurt bowl",
      reason: "High protein, low effort",
      macros: "~180 kcal · 20g protein",
    });
    suggestions.push({
      id: "egg-toast",
      title: "Eggs on toast",
      reason: "Closes your protein gap fast",
      macros: "~320 kcal · 22g protein",
    });
  }

  if (carbsLeft > 40 && calLeft > 200) {
    suggestions.push({
      id: "oats",
      title: "Warm oat porridge",
      reason: "Steady energy for the afternoon",
      macros: "~280 kcal · 45g carbs",
    });
  }

  if (calLeft > 400 && proteinLeft <= 25) {
    suggestions.push({
      id: "salad",
      title: "Chickpea salad",
      reason: "Balanced without blowing calories",
      macros: "~350 kcal · balanced macros",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "herbal-tea",
      title: "Herbal tea + fruit",
      reason: "Gentle close to your day",
      macros: "~80 kcal",
    });
  }

  return suggestions.slice(0, 3);
}

export function estimateXp(input: {
  mealCount: number;
  healthScore: number;
  streak: number;
  waterHit: boolean;
}): number {
  return (
    input.mealCount * 25 +
    Math.round(input.healthScore * 0.5) +
    input.streak * 10 +
    (input.waterHit ? 40 : 0)
  );
}

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export function evaluateAchievements(input: {
  streak: number;
  mealCount: number;
  healthScore: number;
  totalMealsLogged: number;
  waterHit: boolean;
}): Achievement[] {
  return [
    {
      id: "first-log",
      title: "First bite",
      description: "Log your first meal",
      unlocked: input.totalMealsLogged >= 1 || input.mealCount >= 1,
    },
    {
      id: "streak-3",
      title: "On a roll",
      description: "3-day logging streak",
      unlocked: input.streak >= 3,
    },
    {
      id: "streak-7",
      title: "Week warrior",
      description: "7-day logging streak",
      unlocked: input.streak >= 7,
    },
    {
      id: "protein-day",
      title: "Protein pro",
      description: "Hit a health score of 80+",
      unlocked: input.healthScore >= 80,
    },
    {
      id: "hydrated",
      title: "Well watered",
      description: "Reach your water goal",
      unlocked: input.waterHit,
    },
    {
      id: "three-meals",
      title: "Full plate",
      description: "Log 3 meals in a day",
      unlocked: input.mealCount >= 3,
    },
  ];
}

export function mealTimeLabel(timestamp: number): string {
  const hour = new Date(timestamp).getHours();
  if (hour < 11) return "Breakfast";
  if (hour < 15) return "Lunch";
  if (hour < 18) return "Snack";
  return "Dinner";
}

export function sortMealsTimeline(entries: FoodEntry[]): FoodEntry[] {
  return [...entries].sort((a, b) => a.timestamp - b.timestamp);
}
