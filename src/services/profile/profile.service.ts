"use client";

import { STORAGE_KEYS } from "@/constants/storage";
import { readJson, writeJson } from "@/lib/storage/browser-storage";
import type { SavedDietChart, UserProfile } from "@/types/domain";

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
};

export const profileService = {
  get(): UserProfile | null {
    return readJson<UserProfile>(STORAGE_KEYS.userProfile);
  },

  hasCompletedOnboarding(): boolean {
    const profile = this.get();
    return Boolean(profile?.name);
  },

  save(profile: UserProfile): UserProfile {
    writeJson(STORAGE_KEYS.userProfile, profile);
    return profile;
  },

  update(partial: Partial<UserProfile>): UserProfile {
    const current = this.get() ?? EMPTY_PROFILE;
    const next = { ...current, ...partial };
    return this.save(next);
  },

  saveDietChart(name: string, dietChart: Record<string, unknown>): UserProfile {
    const current = this.get() ?? EMPTY_PROFILE;
    const chart: SavedDietChart = {
      id: `${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      dietChart,
    };
    const savedDietCharts = [...(current.savedDietCharts ?? []), chart];
    return this.save({ ...current, savedDietCharts });
  },
};
