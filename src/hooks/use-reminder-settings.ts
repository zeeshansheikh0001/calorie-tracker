
"use client";

import { useState, useEffect, useCallback } from 'react';

export interface ReminderSettings {
  logMeals: boolean;
  logMealsTime: string;
  drinkWater: boolean;
  drinkWaterFrequency: string; 
  weighIn: boolean;
  weighInDay: string; 
  weighInTime: string;
}

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  logMeals: true,
  logMealsTime: "19:00",
  drinkWater: false,
  drinkWaterFrequency: "every_2_hours",
  weighIn: false,
  weighInDay: "monday",
  weighInTime: "08:00",
};

const LOCAL_STORAGE_KEY = 'reminderSettings';

export function useReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(DEFAULT_REMINDER_SETTINGS);
      }
    } catch (error) {
      console.error("Failed to load reminder settings from localStorage", error);
      setSettings(DEFAULT_REMINDER_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<ReminderSettings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSettings));
      } catch (error) {
        console.error("Failed to save reminder settings to localStorage", error);
      }
      return updatedSettings;
    });
  }, []);

  return { settings, updateSettings, isLoading };
}
