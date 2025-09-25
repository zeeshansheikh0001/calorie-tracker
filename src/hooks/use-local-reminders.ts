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

const defaultReminders: ReminderSettings = {
  logMeals: true,
  logMealsTime: "19:00",
  drinkWater: false,
  drinkWaterFrequency: "every_2_hours",
  weighIn: false,
  weighInDay: "monday",
  weighInTime: "08:00",
};

const STORAGE_KEY = 'calorie-tracker-reminders';
const TIMEOUTS_KEY = 'calorie-tracker-notification-timeouts';

export function useLocalReminders() {
  const [reminders, setReminders] = useState<ReminderSettings>(defaultReminders);
  const [isLoading, setIsLoading] = useState(true);

  // Load reminders from localStorage on mount
  useEffect(() => {
    const loadReminders = () => {
      try {
        const savedReminders = localStorage.getItem(STORAGE_KEY);
        if (savedReminders) {
          const parsed = JSON.parse(savedReminders);
          setReminders(parsed);
          scheduleLocalNotifications(parsed);
        }
      } catch (error) {
        console.error('Error loading reminders from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReminders();
  }, []);

  // Save reminders to localStorage and schedule notifications
  const saveReminders = useCallback((newReminders: ReminderSettings) => {
    try {
      setReminders(newReminders);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newReminders));
      scheduleLocalNotifications(newReminders);
    } catch (error) {
      console.error('Error saving reminders to localStorage:', error);
    }
  }, []);

  // Schedule notifications using setTimeout
  const scheduleLocalNotifications = useCallback((settings: ReminderSettings) => {
    // Clear existing notifications
    const existingTimeouts = JSON.parse(localStorage.getItem(TIMEOUTS_KEY) || '[]');
    existingTimeouts.forEach((id: number) => clearTimeout(id));

    const timeouts: number[] = [];

    // Schedule meal reminder
    if (settings.logMeals && settings.logMealsTime) {
      const timeoutId = scheduleTimeBasedNotification(
        settings.logMealsTime,
        '🍽️ Time to log your meal!',
        'Don\'t forget to log your meal for today to stay on track.',
        'meal_reminder'
      );
      if (timeoutId) timeouts.push(timeoutId);
    }

    // Schedule water reminders
    if (settings.drinkWater && settings.drinkWaterFrequency) {
      const frequencyHours = parseInt(settings.drinkWaterFrequency.replace('every_', '').replace('_hours', ''));
      const timeoutId = scheduleRecurringNotification(
        frequencyHours,
        '💧 Stay Hydrated!',
        'Time to drink some water and keep your body refreshed.',
        'water_reminder'
      );
      if (timeoutId) timeouts.push(timeoutId);
    }

    // Schedule weigh-in reminder
    if (settings.weighIn && settings.weighInDay && settings.weighInTime) {
      const timeoutId = scheduleWeeklyNotification(
        settings.weighInDay,
        settings.weighInTime,
        '⚖️ Weekly Weigh-In Reminder!',
        'Time to track your progress and see how far you\'ve come.',
        'weigh_in_reminder'
      );
      if (timeoutId) timeouts.push(timeoutId);
    }

    localStorage.setItem(TIMEOUTS_KEY, JSON.stringify(timeouts));
  }, []);

  return {
    reminders,
    saveReminders,
    isLoading
  };
}

// Helper functions for scheduling notifications
function scheduleTimeBasedNotification(time: string, title: string, body: string, type: string): number | null {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  return setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, { 
        body, 
        icon: '/favicon/android-chrome-192x192.png',
        tag: type
      });
    }
  }, delay) as unknown as number;
}

function scheduleRecurringNotification(frequencyHours: number, title: string, body: string, type: string): number | null {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);

  const delay = nextHour.getTime() - now.getTime();

  return setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, { 
        body, 
        icon: '/favicon/android-chrome-192x192.png',
        tag: type
      });
    }
    
    // Schedule the next occurrence
    scheduleRecurringNotification(frequencyHours, title, body, type);
  }, delay) as unknown as number;
}

function scheduleWeeklyNotification(day: string, time: string, title: string, body: string, type: string): number | null {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();
  
  const dayMap: { [key: string]: number } = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  
  const targetDay = dayMap[day.toLowerCase()];
  const currentDay = now.getDay();
  
  scheduledTime.setHours(hours, minutes, 0, 0);
  scheduledTime.setDate(now.getDate() + (targetDay - currentDay + 7) % 7);
  
  const delay = scheduledTime.getTime() - now.getTime();

  return setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, { 
        body, 
        icon: '/favicon/android-chrome-192x192.png',
        tag: type
      });
    }
    
    // Schedule for next week
    scheduleWeeklyNotification(day, time, title, body, type);
  }, delay) as unknown as number;
}
