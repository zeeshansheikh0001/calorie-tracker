
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FoodEntry, DailyLogEntry } from '@/types';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase'; // Firestore instance
import { doc, getDoc, setDoc, collection, getDocs, writeBatch, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';

// Placeholder for actual user ID - replace with Firebase Auth user.uid
const userId = "defaultUser"; 

const getFoodEntriesCollectionRef = (date: Date) => 
  collection(db, `users/${userId}/dailyLogs/${format(date, 'yyyy-MM-dd')}/foodEntries`);

const getDailyLogDocRef = (date: Date) => 
  doc(db, `users/${userId}/dailyLogs/${format(date, 'yyyy-MM-dd')}`);


export function useDailyLog() {
  const [currentSelectedDateInternal, setCurrentSelectedDateInternal] = useState<Date | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLogEntry | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentSelectedDateInternal(new Date());
  }, []);

  const loadLogForDate = useCallback(async (dateToLoad: Date) => {
    setIsLoading(true);
    try {
      const dailyLogRef = getDailyLogDocRef(dateToLoad);
      const dailyLogSnap = await getDoc(dailyLogRef);

      let currentSummary: DailyLogEntry;
      if (dailyLogSnap.exists()) {
        currentSummary = dailyLogSnap.data() as DailyLogEntry;
      } else {
        currentSummary = { 
          date: format(dateToLoad, 'yyyy-MM-dd'), 
          calories: 0, protein: 0, fat: 0, carbs: 0 
        };
        // Optionally save the initial empty log summary
        // await setDoc(dailyLogRef, currentSummary);
      }
      setDailyLog(currentSummary);

      const foodEntriesColRef = getFoodEntriesCollectionRef(dateToLoad);
      const q = query(foodEntriesColRef, orderBy("timestamp", "asc"));
      const foodEntriesSnap = await getDocs(q);
      const loadedEntries = foodEntriesSnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as FoodEntry));
      setFoodEntries(loadedEntries);

    } catch (error) {
      console.error("Failed to load daily log from Firestore for date:", format(dateToLoad, 'yyyy-MM-dd'), error);
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
  }, [toast]); // Added toast to dependencies

  useEffect(() => {
    if (currentSelectedDateInternal) {
      loadLogForDate(currentSelectedDateInternal);
    }
  }, [currentSelectedDateInternal, loadLogForDate]);

  const selectDateForLog = useCallback((newDate: Date) => {
    setCurrentSelectedDateInternal(newDate);
  }, []);

  const addFoodEntry = useCallback(async (newEntryData: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    if (!currentSelectedDateInternal) {
      toast({ title: "Error", description: "No date selected to log food.", variant: "destructive" });
      return;
    }
    
    const newId = doc(collection(db, "_")).id; // Generate a new Firestore ID
    const entryWithMeta: FoodEntry = {
      ...newEntryData,
      id: newId,
      timestamp: Timestamp.now().toMillis(), // Use Firestore Timestamp
    };

    const dailyLogRef = getDailyLogDocRef(currentSelectedDateInternal);
    const foodEntryRef = doc(getFoodEntriesCollectionRef(currentSelectedDateInternal), newId);

    try {
      const batch = writeBatch(db);
      batch.set(foodEntryRef, entryWithMeta);

      // Update summary
      const dailyLogSnap = await getDoc(dailyLogRef);
      let currentSummary: DailyLogEntry;
      if (dailyLogSnap.exists()) {
        currentSummary = dailyLogSnap.data() as DailyLogEntry;
      } else {
        currentSummary = { 
          date: format(currentSelectedDateInternal, 'yyyy-MM-dd'), 
          calories: 0, protein: 0, fat: 0, carbs: 0 
        };
      }
      
      const updatedSummary: DailyLogEntry = {
        ...currentSummary,
        calories: currentSummary.calories + newEntryData.calories,
        protein: currentSummary.protein + newEntryData.protein,
        fat: currentSummary.fat + newEntryData.fat,
        carbs: currentSummary.carbs + newEntryData.carbs,
      };
      batch.set(dailyLogRef, updatedSummary, { merge: true }); // Merge true to create if not exists or update

      await batch.commit();

      // Optimistically update local state or re-fetch
      setFoodEntries(prev => [...prev, entryWithMeta].sort((a, b) => a.timestamp - b.timestamp));
      setDailyLog(updatedSummary);

    } catch (error) {
      console.error("Failed to save food entry to Firestore", error);
      toast({
        title: "Logging Failed",
        description: "Could not save your meal. Please try again.",
        variant: "destructive"
      });
    }
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
    
    const dailyLogRef = getDailyLogDocRef(currentSelectedDateInternal);
    const foodEntryRef = doc(getFoodEntriesCollectionRef(currentSelectedDateInternal), entryId);

    try {
      const batch = writeBatch(db);
      batch.delete(foodEntryRef);

      // Update summary
      const dailyLogSnap = await getDoc(dailyLogRef);
      if (dailyLogSnap.exists()) {
        let currentSummary = dailyLogSnap.data() as DailyLogEntry;
        const updatedSummary: DailyLogEntry = {
          ...currentSummary,
          calories: Math.max(0, currentSummary.calories - entryToDelete.calories),
          protein: Math.max(0, currentSummary.protein - entryToDelete.protein),
          fat: Math.max(0, currentSummary.fat - entryToDelete.fat),
          carbs: Math.max(0, currentSummary.carbs - entryToDelete.carbs),
        };
        batch.set(dailyLogRef, updatedSummary); 
        setDailyLog(updatedSummary);
      } else {
         // Should not happen if entry existed, but handle defensively
        const formattedDate = format(currentSelectedDateInternal, 'yyyy-MM-dd');
        const emptySummary = { date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 };
        batch.set(dailyLogRef, emptySummary);
        setDailyLog(emptySummary);
      }
      
      await batch.commit();
      
      setFoodEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      
      setTimeout(() => {
          toast({
            title: "Meal Deleted",
            description: "The meal has been removed from your log.",
          });
        }, 0);

    } catch (error) {
      console.error("Failed to delete food entry from Firestore", error);
      setTimeout(() => {
        toast({
          title: "Error Deleting Meal",
          description: "Could not remove the meal. Please try again.",
          variant: "destructive",
        });
      }, 0);
    }
  }, [currentSelectedDateInternal, foodEntries, toast]);


  const getLogDataForDate = useCallback(async (dateToFetch: Date): Promise<{ summary: DailyLogEntry | null; entries: FoodEntry[] }> => {
    setIsLoading(true); // Optional: set loading state if this function is used for primary display
    try {
      const dailyLogRef = getDailyLogDocRef(dateToFetch);
      const dailyLogSnap = await getDoc(dailyLogRef);

      let summary: DailyLogEntry | null = null;
      if (dailyLogSnap.exists()) {
        summary = dailyLogSnap.data() as DailyLogEntry;
      } else {
         summary = { 
          date: format(dateToFetch, 'yyyy-MM-dd'), 
          calories: 0, protein: 0, fat: 0, carbs: 0 
        };
      }

      const foodEntriesColRef = getFoodEntriesCollectionRef(dateToFetch);
      const q = query(foodEntriesColRef, orderBy("timestamp", "asc"));
      const foodEntriesSnap = await getDocs(q);
      const entries = foodEntriesSnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as FoodEntry));
      
      return { summary, entries };

    } catch (error) {
      console.error("Failed to fetch log data from Firestore for date:", format(dateToFetch, 'yyyy-MM-dd'), error);
      const formattedDate = format(dateToFetch, 'yyyy-MM-dd');
      toast({ // Added toast for error feedback
        title: "Error Fetching Log Data",
        description: `Could not retrieve log for ${formattedDate}.`,
        variant: "destructive",
      });
      return {
        summary: { date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 },
        entries: []
      };
    } finally {
       setIsLoading(false); // Ensure loading is set to false
    }
  }, [toast]); // Added toast to dependencies


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


    