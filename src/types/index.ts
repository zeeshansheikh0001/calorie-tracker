export interface Goal {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  timestamp: number; // Unix timestamp
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  // foodEntries: FoodEntry[]; // Optional: if storing individual food items
}
