
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FoodEntry, DailyLogEntry } from '@/types';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY_PREFIX = 'dailyLog_';

function getStorageKeyForDate(date: Date): string {
  return `${LOCAL_STORAGE_KEY_PREFIX}${format(date, 'yyyy-MM-dd')}`;
}

export function useDailyLog() {
  const [currentSelectedDateInternal, setCurrentSelectedDateInternal] = useState<Date | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLogEntry | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set the initial date only on the client side after mount
    setCurrentSelectedDateInternal(new Date());
  }, []);

  const loadLogForDate = useCallback((dateToLoad: Date) => {
    setIsLoading(true);
    try {
      const storageKey = getStorageKeyForDate(dateToLoad);
      const storedLog = localStorage.getItem(storageKey);
      if (storedLog) {
        const parsedLog: { summary: DailyLogEntry; entries: FoodEntry[] } = JSON.parse(storedLog);
        setDailyLog(parsedLog.summary);
        setFoodEntries(parsedLog.entries);
      } else {
        // Initialize new log for the selected date
        const formattedDate = format(dateToLoad, 'yyyy-MM-dd');
        const newLogSummary: DailyLogEntry = {
          date: formattedDate,
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
      console.error("Failed to load daily log from localStorage for date:", format(dateToLoad, 'yyyy-MM-dd'), error);
      const formattedDate = format(dateToLoad, 'yyyy-MM-dd');
      setDailyLog({ date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 });
      setFoodEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentSelectedDateInternal) {
      loadLogForDate(currentSelectedDateInternal);
    }
  }, [currentSelectedDateInternal, loadLogForDate]);

  const selectDateForLog = useCallback((newDate: Date) => {
    setCurrentSelectedDateInternal(newDate);
  }, []);

  const addFoodEntry = useCallback((newEntry: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    if (!currentSelectedDateInternal) return; // Guard against null date

    setFoodEntries((prevEntries) => {
      const entryWithMeta: FoodEntry = {
        ...newEntry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      const updatedEntries = [...prevEntries, entryWithMeta];

      setDailyLog((prevSummary) => {
        const summaryForDate = prevSummary && prevSummary.date === format(currentSelectedDateInternal, 'yyyy-MM-dd')
          ? prevSummary
          : { date: format(currentSelectedDateInternal, 'yyyy-MM-dd'), calories: 0, protein: 0, fat: 0, carbs: 0 };
        
        const updatedSummary: DailyLogEntry = {
          ...summaryForDate,
          calories: summaryForDate.calories + newEntry.calories,
          protein: summaryForDate.protein + newEntry.protein,
          fat: summaryForDate.fat + newEntry.fat,
          carbs: summaryForDate.carbs + newEntry.carbs,
        };
        
        try {
          localStorage.setItem(getStorageKeyForDate(currentSelectedDateInternal), JSON.stringify({ summary: updatedSummary, entries: updatedEntries }));
        } catch (error) {
          console.error("Failed to save daily log to localStorage", error);
        }
        return updatedSummary;
      });
      return updatedEntries;
    });
  }, [currentSelectedDateInternal]);

  const deleteFoodEntry = useCallback((entryId: string) => {
    if (!currentSelectedDateInternal) return; // Guard against null date

    setFoodEntries((prevEntries) => {
      const entryToDelete = prevEntries.find(entry => entry.id === entryId);
      if (!entryToDelete) return prevEntries;

      const updatedEntries = prevEntries.filter(entry => entry.id !== entryId);
      
      const summaryForDate = dailyLog && dailyLog.date === format(currentSelectedDateInternal, 'yyyy-MM-dd')
        ? dailyLog
        : { date: format(currentSelectedDateInternal, 'yyyy-MM-dd'), calories: 0, protein: 0, fat: 0, carbs: 0 };


      const newSummary: DailyLogEntry = {
        date: summaryForDate.date,
        calories: Math.round(updatedEntries.reduce((sum, entry) => sum + entry.calories, 0)),
        protein: Math.round(updatedEntries.reduce((sum, entry) => sum + entry.protein, 0)),
        fat: Math.round(updatedEntries.reduce((sum, entry) => sum + entry.fat, 0)),
        carbs: Math.round(updatedEntries.reduce((sum, entry) => sum + entry.carbs, 0)),
      };

      setDailyLog(newSummary);

      try {
        localStorage.setItem(getStorageKeyForDate(currentSelectedDateInternal), JSON.stringify({ summary: newSummary, entries: updatedEntries }));
        setTimeout(() => {
          toast({
            title: "Meal Deleted",
            description: "The meal has been removed from your log.",
          });
        }, 0);
      } catch (error) {
        console.error("Failed to save daily log to localStorage after delete", error);
        setTimeout(() => {
          toast({
            title: "Error Deleting Meal",
            description: "Could not update the log after deletion.",
            variant: "destructive",
          });
        }, 0);
      }
      return updatedEntries;
    });
  }, [dailyLog, currentSelectedDateInternal, toast]);


  const clearLogForDate = useCallback((dateToClear: Date) => {
    const formattedDate = format(dateToClear, 'yyyy-MM-dd');
    const initialLog: DailyLogEntry = { date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 };
    
    try {
      localStorage.setItem(getStorageKeyForDate(dateToClear), JSON.stringify({ summary: initialLog, entries: [] }));
      if (currentSelectedDateInternal && format(dateToClear, 'yyyy-MM-dd') === format(currentSelectedDateInternal, 'yyyy-MM-dd')) {
        // If clearing the currently selected date's log
         setDailyLog(initialLog);
         setFoodEntries([]);
      }
    } catch (error) {
      console.error("Failed to clear daily log in localStorage", error);
    }
  }, [currentSelectedDateInternal]);

  const getLogDataForDate = useCallback((dateToFetch: Date): { summary: DailyLogEntry | null; entries: FoodEntry[] } => {
    try {
      const storageKey = getStorageKeyForDate(dateToFetch);
      const storedLog = localStorage.getItem(storageKey);
      if (storedLog) {
        const parsedLog: { summary: DailyLogEntry; entries: FoodEntry[] } = JSON.parse(storedLog);
        return parsedLog;
      } else {
        // If no log exists for the date, return an empty state for that date
        const formattedDate = format(dateToFetch, 'yyyy-MM-dd');
        return {
          summary: { date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 },
          entries: []
        };
      }
    } catch (error) {
      console.error("Failed to fetch log data from localStorage for date:", format(dateToFetch, 'yyyy-MM-dd'), error);
      const formattedDate = format(dateToFetch, 'yyyy-MM-dd');
      return {
        summary: { date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 },
        entries: []
      };
    }
  }, []);

  return { 
    dailyLog, 
    foodEntries, 
    addFoodEntry, 
    deleteFoodEntry, 
    clearLog: clearLogForDate,
    isLoading, 
    currentSelectedDate: currentSelectedDateInternal, 
    selectDateForLog, 
    refreshLog: () => { if (currentSelectedDateInternal) loadLogForDate(currentSelectedDateInternal); },
    getLogDataForDate
  };
}
