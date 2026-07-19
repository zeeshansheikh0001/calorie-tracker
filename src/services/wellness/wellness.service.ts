"use client";

import { STORAGE_KEYS } from "@/constants/storage";
import { readJson, writeJson } from "@/lib/storage/browser-storage";
import { dailyLogService, formatLogDate } from "@/services/calorie/daily-log.service";

export type WaterLog = {
  date: string;
  ml: number;
  goalMl: number;
};

export type WeightEntry = {
  date: string;
  kg: number;
};

export type SleepLog = {
  date: string;
  hours: number;
};

export type ActivityLog = {
  date: string;
  minutes: number;
  steps: number;
};

export type WellnessMeta = {
  xp: number;
  level: number;
  unlockedAchievementIds: string[];
};

const DEFAULT_WATER_GOAL = 2500;
const DEFAULT_META: WellnessMeta = {
  xp: 0,
  level: 1,
  unlockedAchievementIds: [],
};

function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 500) + 1);
}

export const wellnessService = {
  getWater(date: string): WaterLog {
    return (
      readJson<WaterLog>(STORAGE_KEYS.water(date)) ?? {
        date,
        ml: 0,
        goalMl: DEFAULT_WATER_GOAL,
      }
    );
  },

  addWater(date: string, amountMl: number): WaterLog {
    const current = this.getWater(date);
    const next: WaterLog = {
      ...current,
      date,
      ml: Math.max(0, current.ml + amountMl),
    };
    writeJson(STORAGE_KEYS.water(date), next);
    return next;
  },

  setWaterGoal(date: string, goalMl: number): WaterLog {
    const current = this.getWater(date);
    const next = { ...current, goalMl };
    writeJson(STORAGE_KEYS.water(date), next);
    return next;
  },

  getWeightHistory(): WeightEntry[] {
    return readJson<WeightEntry[]>(STORAGE_KEYS.weightHistory) ?? [];
  },

  logWeight(kg: number, date = formatLogDate(new Date())): WeightEntry[] {
    const history = this.getWeightHistory().filter((w) => w.date !== date);
    const next = [...history, { date, kg }].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    writeJson(STORAGE_KEYS.weightHistory, next);
    return next;
  },

  getSleep(date: string): SleepLog {
    return (
      readJson<SleepLog>(STORAGE_KEYS.sleep(date)) ?? { date, hours: 0 }
    );
  },

  setSleep(date: string, hours: number): SleepLog {
    const next = { date, hours: Math.max(0, Math.min(14, hours)) };
    writeJson(STORAGE_KEYS.sleep(date), next);
    return next;
  },

  getActivity(date: string): ActivityLog {
    const stored = readJson<ActivityLog>(STORAGE_KEYS.activity(date));
    return {
      date,
      minutes: stored?.minutes ?? 0,
      steps: stored?.steps ?? 0,
    };
  },

  addActivity(date: string, minutes: number, steps = 0): ActivityLog {
    const current = this.getActivity(date);
    const next = {
      date,
      minutes: Math.max(0, current.minutes + minutes),
      steps: Math.max(0, current.steps + steps),
    };
    writeJson(STORAGE_KEYS.activity(date), next);
    return next;
  },

  addSteps(date: string, steps: number): ActivityLog {
    return this.addActivity(date, Math.round(steps / 100), steps);
  },

  getMeta(): WellnessMeta {
    const meta = readJson<WellnessMeta>(STORAGE_KEYS.wellnessMeta) ?? {
      ...DEFAULT_META,
    };
    return { ...meta, level: levelFromXp(meta.xp) };
  },

  syncXp(xp: number, newlyUnlocked: string[]): WellnessMeta {
    const meta = this.getMeta();
    const unlocked = new Set([
      ...meta.unlockedAchievementIds,
      ...newlyUnlocked,
    ]);
    const next: WellnessMeta = {
      xp: Math.max(meta.xp, xp),
      level: levelFromXp(Math.max(meta.xp, xp)),
      unlockedAchievementIds: [...unlocked],
    };
    writeJson(STORAGE_KEYS.wellnessMeta, next);
    return next;
  },

  /** Consecutive days ending today (or yesterday if today empty) with ≥1 meal. */
  getStreak(endDate = new Date()): number {
    let streak = 0;
    const cursor = new Date(endDate);
    // If today has no meals yet, start from yesterday so streak doesn't break mid-day
    const todayKey = formatLogDate(cursor);
    if (dailyLogService.getEntries(todayKey).length === 0) {
      cursor.setDate(cursor.getDate() - 1);
    }
    for (let i = 0; i < 365; i += 1) {
      const key = formatLogDate(cursor);
      if (dailyLogService.getEntries(key).length === 0) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },

  countTotalMeals(days = 60): number {
    let total = 0;
    const end = new Date();
    for (let i = 0; i < days; i += 1) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      total += dailyLogService.getEntries(formatLogDate(d)).length;
    }
    return total;
  },
};
