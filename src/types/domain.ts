/**
 * Domain types — no imports from server AI modules.
 * Diet chart payloads stay loosely typed until AI schemas are shared via a neutral package.
 */

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
  timestamp: number;
}

export interface FoodEntryShort {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DailyLogEntry {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type Gender = "male" | "female" | "other";

export interface SavedDietChart {
  id: string;
  name: string;
  createdAt: string;
  /** Opaque AI diet-chart payload */
  dietChart: Record<string, unknown>;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: Gender;
  heightUnit?: "cm" | "ft";
  weightUnit?: "kg" | "lbs";
  savedDietCharts?: SavedDietChart[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  imageHint?: string;
  readMoreLink: string;
  author?:
    | string
    | {
        name: string;
        role: string;
        imageUrl: string;
      };
  authorRole?: string;
  authorImage?: string;
  publishDate?: string;
  category?: string;
  content?: string;
}

export interface ReminderSettings {
  logMeals: boolean;
  logMealsTime: string;
  drinkWater: boolean;
  drinkWaterFrequency: string;
  weighIn: boolean;
  weighInDay: string;
  weighInTime: string;
}

export type MacroKey = "calories" | "protein" | "carbs" | "fat";
