export type FitnessGoal =
  | "muscle_gain"
  | "weight_loss"
  | "get_fit"
  | "overall_health"
  | "stamina";

export type UnitSystem = "metric" | "imperial";

export function calculateBmr(params: {
  weight: number;
  height: number;
  age: number;
  gender: string;
  unit: UnitSystem;
}): number {
  let weightKg = params.weight;
  let heightCm = params.height;

  if (params.unit === "imperial") {
    weightKg = params.weight * 0.453592;
    heightCm = params.height * 2.54;
  }

  const base =
    10 * weightKg + 6.25 * heightCm - 5 * params.age;
  return params.gender === "male" ? base + 5 : base - 161;
}

export function calculateMacros(
  bmr: number,
  fitnessGoal: FitnessGoal
): { calories: number; protein: number; fat: number; carbs: number } {
  let activityMultiplier = 1.4;
  let proteinPercentage = 0.3;
  let fatPercentage = 0.25;
  let carbsPercentage = 0.45;

  switch (fitnessGoal) {
    case "muscle_gain":
      activityMultiplier = 1.6;
      proteinPercentage = 0.35;
      fatPercentage = 0.25;
      carbsPercentage = 0.4;
      break;
    case "weight_loss":
      activityMultiplier = 1.3;
      proteinPercentage = 0.35;
      fatPercentage = 0.3;
      carbsPercentage = 0.35;
      break;
    case "get_fit":
      activityMultiplier = 1.5;
      break;
    case "stamina":
      activityMultiplier = 1.6;
      proteinPercentage = 0.25;
      fatPercentage = 0.25;
      carbsPercentage = 0.5;
      break;
    default:
      break;
  }

  const calories = Math.round(bmr * activityMultiplier);
  return {
    calories,
    protein: Math.round((calories * proteinPercentage) / 4),
    fat: Math.round((calories * fatPercentage) / 9),
    carbs: Math.round((calories * carbsPercentage) / 4),
  };
}
