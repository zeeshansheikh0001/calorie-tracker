
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FoodEntry, DailyLogEntry } from '@/types';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY_PREFIX = 'dailyLog_';

function getTodayStorageKey(): string {
  return `${LOCAL_STORAGE_KEY_PREFIX}${format(new Date(), 'yyyy-MM-dd')}`;
}

export function useDailyLog() {
  const [dailyLog, setDailyLog] = useState<DailyLogEntry | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadTodaysLog = useCallback(() => {
    setIsLoading(true);
    try {
      const storageKey = getTodayStorageKey();
      const storedLog = localStorage.getItem(storageKey);
      if (storedLog) {
        const parsedLog: { summary: DailyLogEntry; entries: FoodEntry[] } = JSON.parse(storedLog);
        setDailyLog(parsedLog.summary);
        setFoodEntries(parsedLog.entries);
      } else {
        // Initialize new log for today
        const todayDate = format(new Date(), 'yyyy-MM-dd');
        const newLogSummary: DailyLogEntry = {
          date: todayDate,
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
        };
        setDailyLog(newLogSummary);
        setFoodEntries([]);
        localStorage.setItem(storageKey, JSON.stringify({ summary: newLogSummary, entries: [] }));
      }
    } catch (error) {
      console.error("Failed to load daily log from localStorage", error);
      // Fallback to empty log
      const todayDate = format(new Date(), 'yyyy-MM-dd');
      setDailyLog({ date: todayDate, calories: 0, protein: 0, fat: 0, carbs: 0 });
      setFoodEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodaysLog();
  }, [loadTodaysLog]);

  const addFoodEntry = useCallback((newEntry: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    setFoodEntries((prevEntries) => {
      const entryWithMeta: FoodEntry = {
        ...newEntry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      const updatedEntries = [...prevEntries, entryWithMeta];

      setDailyLog((prevSummary) => {
        if (!prevSummary) return null; // Should not happen if initialized
        const updatedSummary: DailyLogEntry = {
          ...prevSummary,
          calories: prevSummary.calories + newEntry.calories,
          protein: prevSummary.protein + newEntry.protein,
          fat: prevSummary.fat + newEntry.fat,
          carbs: prevSummary.carbs + newEntry.carbs,
        };
        
        try {
          localStorage.setItem(getTodayStorageKey(), JSON.stringify({ summary: updatedSummary, entries: updatedEntries }));
        } catch (error) {
          console.error("Failed to save daily log to localStorage", error);
        }
        return updatedSummary;
      });
      return updatedEntries;
    });
  }, []);

  const deleteFoodEntry = useCallback((entryId: string) => {
    setFoodEntries((prevEntries) => {
      const updatedEntries = prevEntries.filter(entry => entry.id !== entryId);

      const newSummary: DailyLogEntry = {
        date: dailyLog!.date, // dailyLog is guaranteed to be initialized by loadTodaysLog
        calories: updatedEntries.reduce((sum, entry) => sum + entry.calories, 0),
        protein: updatedEntries.reduce((sum, entry) => sum + entry.protein, 0),
        fat: updatedEntries.reduce((sum, entry) => sum + entry.fat, 0),
        carbs: updatedEntries.reduce((sum, entry) => sum + entry.carbs, 0),
      };

      setDailyLog(newSummary);

      try {
        localStorage.setItem(getTodayStorageKey(), JSON.stringify({ summary: newSummary, entries: updatedEntries }));
        toast({
          title: "Meal Deleted",
          description: "The meal has been removed from your log.",
        });
      } catch (error) {
        console.error("Failed to save daily log to localStorage after delete", error);
        toast({
          title: "Error Deleting Meal",
          description: "Could not update the log after deletion.",
          variant: "destructive",
        });
      }
      return updatedEntries;
    });
  }, [dailyLog, toast]);


  const clearTodaysLog = useCallback(() => {
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const initialLog: DailyLogEntry = { date: todayDate, calories: 0, protein: 0, fat: 0, carbs: 0 };
    setDailyLog(initialLog);
    setFoodEntries([]);
    try {
      localStorage.setItem(getTodayStorageKey(), JSON.stringify({ summary: initialLog, entries: [] }));
    } catch (error) {
      console.error("Failed to clear daily log in localStorage", error);
    }
  }, []);

  return { dailyLog, foodEntries, addFoodEntry, deleteFoodEntry, clearTodaysLog, isLoading, refreshLog: loadTodaysLog };
}
