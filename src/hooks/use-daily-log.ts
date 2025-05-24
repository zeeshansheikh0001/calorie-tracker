
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FoodEntry, DailyLogEntry } from '@/types';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const getLocalStorageKey = (base: string, date: Date) => `${base}_${format(date, 'yyyy-MM-dd')}`;

export function useDailyLog() {
  const [currentSelectedDateInternal, setCurrentSelectedDateInternal] = useState<Date | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLogEntry | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize to today on client side to avoid hydration mismatch
    setCurrentSelectedDateInternal(new Date());
  }, []);

  const loadLogForDate = useCallback((dateToLoad: Date) => {
    setIsLoading(true);
    try {
      const summaryKey = getLocalStorageKey('dailyLog', dateToLoad);
      const entriesKey = getLocalStorageKey('foodEntries', dateToLoad);

      const storedSummary = localStorage.getItem(summaryKey);
      const storedEntries = localStorage.getItem(entriesKey);

      if (storedSummary) {
        setDailyLog(JSON.parse(storedSummary));
      } else {
        setDailyLog({ date: format(dateToLoad, 'yyyy-MM-dd'), calories: 0, protein: 0, fat: 0, carbs: 0 });
      }

      if (storedEntries) {
        setFoodEntries(JSON.parse(storedEntries).sort((a: FoodEntry, b: FoodEntry) => a.timestamp - b.timestamp));
      } else {
        setFoodEntries([]);
      }
    } catch (error) {
      console.error("Failed to load daily log from localStorage", error);
      const formattedDate = format(dateToLoad, 'yyyy-MM-dd');
      setDailyLog({ date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 });
      setFoodEntries([]);
      toast({
        title: "Error Loading Log",
        description: "Could not fetch data for the selected date.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentSelectedDateInternal) {
      loadLogForDate(currentSelectedDateInternal);
    }
  }, [currentSelectedDateInternal, loadLogForDate]);

  const selectDateForLog = useCallback((newDate: Date) => {
    setCurrentSelectedDateInternal(newDate);
  }, []);

  const addFoodEntry = useCallback((newEntryData: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    if (!currentSelectedDateInternal) {
      toast({ title: "Error", description: "No date selected to log food.", variant: "destructive" });
      return;
    }
    
    const newId = Date.now().toString(); // Simple ID for localStorage
    const entryWithMeta: FoodEntry = {
      ...newEntryData,
      id: newId,
      timestamp: Date.now(),
    };

    setFoodEntries(prevEntries => {
      const updatedEntries = [...prevEntries, entryWithMeta].sort((a, b) => a.timestamp - b.timestamp);
      try {
        localStorage.setItem(getLocalStorageKey('foodEntries', currentSelectedDateInternal), JSON.stringify(updatedEntries));
      } catch (error) {
        console.error("Failed to save food entries to localStorage", error);
      }
      return updatedEntries;
    });

    setDailyLog(prevLog => {
      const currentSummary = prevLog || { date: format(currentSelectedDateInternal, 'yyyy-MM-dd'), calories: 0, protein: 0, fat: 0, carbs: 0 };
      const updatedSummary: DailyLogEntry = {
        ...currentSummary,
        calories: currentSummary.calories + newEntryData.calories,
        protein: currentSummary.protein + newEntryData.protein,
        fat: currentSummary.fat + newEntryData.fat,
        carbs: currentSummary.carbs + newEntryData.carbs,
      };
      try {
        localStorage.setItem(getLocalStorageKey('dailyLog', currentSelectedDateInternal), JSON.stringify(updatedSummary));
      } catch (error) {
        console.error("Failed to save daily log summary to localStorage", error);
      }
      return updatedSummary;
    });

  }, [currentSelectedDateInternal, toast]);

  const deleteFoodEntry = useCallback(async (entryId: string) => {
    if (!currentSelectedDateInternal) {
      toast({ title: "Error", description: "No date selected for deletion.", variant: "destructive" });
      return;
    }

    const entryToDelete = foodEntries.find(entry => entry.id === entryId);
    if (!entryToDelete) {
      console.warn("Entry to delete not found in local state:", entryId);
      return;
    }
    
    setFoodEntries(prevEntries => {
      const updatedEntries = prevEntries.filter(entry => entry.id !== entryId);
      try {
        localStorage.setItem(getLocalStorageKey('foodEntries', currentSelectedDateInternal), JSON.stringify(updatedEntries));
      } catch (error) {
        console.error("Failed to save food entries to localStorage after deletion", error);
      }
      return updatedEntries;
    });

    setDailyLog(prevLog => {
      if (!prevLog) return null; // Should not happen if an entry was deleted
      const updatedSummary: DailyLogEntry = {
        ...prevLog,
        calories: Math.max(0, prevLog.calories - entryToDelete.calories),
        protein: Math.max(0, prevLog.protein - entryToDelete.protein),
        fat: Math.max(0, prevLog.fat - entryToDelete.fat),
        carbs: Math.max(0, prevLog.carbs - entryToDelete.carbs),
      };
      try {
        localStorage.setItem(getLocalStorageKey('dailyLog', currentSelectedDateInternal), JSON.stringify(updatedSummary));
      } catch (error) {
        console.error("Failed to save daily log summary to localStorage after deletion", error);
      }
      return updatedSummary;
    });
    
    setTimeout(() => {
        toast({
          title: "Meal Deleted",
          description: "The meal has been removed from your log.",
        });
      }, 0);

  }, [currentSelectedDateInternal, foodEntries, toast]);

  const getLogDataForDate = useCallback((dateToFetch: Date): { summary: DailyLogEntry | null; entries: FoodEntry[] } => {
    // This function is now synchronous as it reads from localStorage
    try {
      const summaryKey = getLocalStorageKey('dailyLog', dateToFetch);
      const entriesKey = getLocalStorageKey('foodEntries', dateToFetch);

      const storedSummary = localStorage.getItem(summaryKey);
      const storedEntries = localStorage.getItem(entriesKey);

      let summary: DailyLogEntry | null = null;
      if (storedSummary) {
        summary = JSON.parse(storedSummary);
      } else {
         summary = { 
          date: format(dateToFetch, 'yyyy-MM-dd'), 
          calories: 0, protein: 0, fat: 0, carbs: 0 
        };
      }

      let entries: FoodEntry[] = [];
      if (storedEntries) {
        entries = JSON.parse(storedEntries).sort((a: FoodEntry, b: FoodEntry) => a.timestamp - b.timestamp);
      }
      
      return { summary, entries };

    } catch (error) {
      console.error("Failed to fetch log data from localStorage for date:", format(dateToFetch, 'yyyy-MM-dd'), error);
      const formattedDate = format(dateToFetch, 'yyyy-MM-dd');
      toast({ 
        title: "Error Fetching Log Data",
        description: `Could not retrieve log for ${formattedDate}.`,
        variant: "destructive",
      });
      return {
        summary: { date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 },
        entries: []
      };
    }
  }, [toast]); 


  return { 
    dailyLog, 
    foodEntries, 
    addFoodEntry, 
    deleteFoodEntry, 
    isLoading, 
    currentSelectedDate: currentSelectedDateInternal, 
    selectDateForLog, 
    getLogDataForDate
  };
}
