"use client";

import { format } from "date-fns";
import { DEFAULT_GOALS, STORAGE_KEYS } from "@/constants/storage";
import { readJson, writeJson } from "@/lib/storage/browser-storage";
import type { DailyLogEntry, FoodEntry, Goal } from "@/types/domain";

function emptyLog(date: string): DailyLogEntry {
  return { date, calories: 0, protein: 0, fat: 0, carbs: 0 };
}

function summarize(date: string, entries: FoodEntry[]): DailyLogEntry {
  return entries.reduce(
    (acc, entry) => ({
      date,
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      fat: acc.fat + entry.fat,
      carbs: acc.carbs + entry.carbs,
    }),
    emptyLog(date)
  );
}

export function formatLogDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export const dailyLogService = {
  getSummary(date: string): DailyLogEntry {
    return readJson<DailyLogEntry>(STORAGE_KEYS.dailyLog(date)) ?? emptyLog(date);
  },

  getEntries(date: string): FoodEntry[] {
    const entries = readJson<FoodEntry[]>(STORAGE_KEYS.foodEntries(date)) ?? [];
    return [...entries].sort((a, b) => a.timestamp - b.timestamp);
  },

  addEntry(
    date: string,
    data: Omit<FoodEntry, "id" | "timestamp">
  ): { entry: FoodEntry; summary: DailyLogEntry } {
    const entry: FoodEntry = {
      ...data,
      id: `${Date.now()}`,
      timestamp: Date.now(),
    };
    const entries = [...this.getEntries(date), entry];
    const summary = summarize(date, entries);
    writeJson(STORAGE_KEYS.foodEntries(date), entries);
    writeJson(STORAGE_KEYS.dailyLog(date), summary);
    return { entry, summary };
  },

  deleteEntry(date: string, entryId: string): DailyLogEntry {
    const entries = this.getEntries(date).filter((e) => e.id !== entryId);
    const summary = summarize(date, entries);
    writeJson(STORAGE_KEYS.foodEntries(date), entries);
    writeJson(STORAGE_KEYS.dailyLog(date), summary);
    return summary;
  },

  getWeekSummaries(endDate: Date, days = 7): DailyLogEntry[] {
    const logs: DailyLogEntry[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - i);
      logs.push(this.getSummary(formatLogDate(d)));
    }
    return logs;
  },
};

export const goalsService = {
  get(): Goal {
    return readJson<Goal>(STORAGE_KEYS.userGoals) ?? { ...DEFAULT_GOALS };
  },

  save(goals: Goal): Goal {
    writeJson(STORAGE_KEYS.userGoals, goals);
    return goals;
  },
};
