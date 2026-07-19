/** localStorage keys — keep stable to avoid wiping user data during migration */
export const STORAGE_KEYS = {
  userProfile: "userProfile",
  userGoals: "userGoals",
  dailyLog: (date: string) => `dailyLog_${date}`,
  foodEntries: (date: string) => `foodEntries_${date}`,
  water: (date: string) => `wellness_water_${date}`,
  sleep: (date: string) => `wellness_sleep_${date}`,
  activity: (date: string) => `wellness_activity_${date}`,
  weightHistory: "wellness_weight_history",
  wellnessMeta: "wellness_meta",
} as const;

export const QUERY_KEYS = {
  profile: ["profile"] as const,
  goals: ["goals"] as const,
  dailyLog: (date: string) => ["dailyLog", date] as const,
  foodEntries: (date: string) => ["foodEntries", date] as const,
  weekLogs: (endDate: string) => ["weekLogs", endDate] as const,
  water: (date: string) => ["water", date] as const,
  sleep: (date: string) => ["sleep", date] as const,
  activity: (date: string) => ["activity", date] as const,
  weightHistory: ["weightHistory"] as const,
  wellnessMeta: ["wellnessMeta"] as const,
  streak: ["streak"] as const,
} as const;

export const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  fat: 70,
  carbs: 250,
} as const;
