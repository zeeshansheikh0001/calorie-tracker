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

// Used for AI summary flow input, omitting id and timestamp
export interface FoodEntryShort {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  age?: number;
  gender?: "male" | "female" | "other";
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  imageHint?: string;
  readMoreLink: string; // This will be used to construct the dynamic route
}
