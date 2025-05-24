
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

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

const userId = "defaultUser"; // Placeholder

export function useReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSettings(DEFAULT_REMINDER_SETTINGS);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const settingsRef = doc(db, "users", userId, "reminders", "settings");

    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as ReminderSettings);
      } else {
        setSettings(DEFAULT_REMINDER_SETTINGS);
        setDoc(settingsRef, DEFAULT_REMINDER_SETTINGS).catch(error => {
          console.error("Error saving default reminder settings:", error);
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reminder settings:", error);
      setSettings(DEFAULT_REMINDER_SETTINGS);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateReminderSettings = useCallback(async (newSettings: Partial<ReminderSettings>) => {
    if (!userId) {
      console.error("User ID not available. Cannot update reminder settings.");
      return;
    }
    const settingsRef = doc(db, "users", userId, "reminders", "settings");
    try {
      const currentSettingsSnap = await getDoc(settingsRef);
      const currentSettings = currentSettingsSnap.exists() ? currentSettingsSnap.data() as ReminderSettings : DEFAULT_REMINDER_SETTINGS;
      const updatedSettingsData = { ...currentSettings, ...newSettings };
      await setDoc(settingsRef, updatedSettingsData, { merge: true });
      // setSettings(updatedSettingsData); // Handled by onSnapshot
    } catch (error) {
      console.error("Error updating reminder settings:", error);
      throw error;
    }
  }, []);

  return { settings, updateReminderSettings, isLoading };
}
