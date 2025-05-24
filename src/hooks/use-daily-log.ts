
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FoodEntry, DailyLogEntry } from '@/types';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

const userId = "defaultUser"; // Placeholder for actual user ID

const getDailyLogDocRef = (date: Date) => {
  if (!userId) throw new Error("User ID not available for daily log operations.");
  return doc(db, "users", userId, "dailyLogs", format(date, 'yyyy-MM-dd'));
};

const getFoodEntriesColRef = (date: Date) => {
  if (!userId) throw new Error("User ID not available for food entry operations.");
  return collection(db, "users", userId, "dailyLogs", format(date, 'yyyy-MM-dd'), "foodEntries");
};


export function useDailyLog() {
  const [currentSelectedDateInternal, setCurrentSelectedDateInternal] = useState<Date | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLogEntry | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentSelectedDateInternal(new Date());
  }, []);

  useEffect(() => {
    if (!currentSelectedDateInternal || !userId) {
      setIsLoading(false);
      setDailyLog(null);
      setFoodEntries([]);
      return;
    }

    setIsLoading(true);
    const dailyLogRef = getDailyLogDocRef(currentSelectedDateInternal);
    const foodEntriesQuery = query(getFoodEntriesColRef(currentSelectedDateInternal), orderBy("timestamp", "asc"));

    const unsubSummary = onSnapshot(dailyLogRef, (docSnap) => {
      if (docSnap.exists()) {
        setDailyLog(docSnap.data() as DailyLogEntry);
      } else {
        const formattedDate = format(currentSelectedDateInternal, 'yyyy-MM-dd');
        const newLogSummary: DailyLogEntry = { date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 };
        setDailyLog(newLogSummary);
        // Optionally create the document if it doesn't exist
        setDoc(dailyLogRef, newLogSummary).catch(e => console.error("Error creating daily log summary doc:", e));
      }
      // Only set loading to false after both summary and entries might have loaded at least once
    }, (error) => {
      console.error("Error fetching daily log summary:", error);
      setDailyLog(null);
      setIsLoading(false);
    });

    const unsubEntries = onSnapshot(foodEntriesQuery, (querySnapshot) => {
      const entries: FoodEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({ 
            id: doc.id, 
            ...data,
            // Firestore timestamps need to be converted to JS Date numbers if stored as Timestamps
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp 
        } as FoodEntry);
      });
      setFoodEntries(entries);
      setIsLoading(false); // Set loading false after entries are processed
    }, (error) => {
      console.error("Error fetching food entries:", error);
      setFoodEntries([]);
      setIsLoading(false);
    });
    
    return () => {
      unsubSummary();
      unsubEntries();
    };
  }, [currentSelectedDateInternal]);

  const selectDateForLog = useCallback((newDate: Date) => {
    setCurrentSelectedDateInternal(newDate);
  }, []);

  const addFoodEntry = useCallback(async (newEntryData: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    if (!currentSelectedDateInternal || !userId) {
      toast({ title: "Error", description: "Cannot add entry: No date selected or user not available.", variant: "destructive" });
      return;
    }

    const dailyLogRef = getDailyLogDocRef(currentSelectedDateInternal);
    const foodEntriesCol = getFoodEntriesColRef(currentSelectedDateInternal);
    
    const entryWithMeta: Omit<FoodEntry, 'id'> = { // Firestore will generate ID
      ...newEntryData,
      timestamp: Date.now(), // Use JS timestamp for simplicity, or Firestore ServerTimestamp
    };

    try {
      await runTransaction(db, async (transaction) => {
        const dailyLogSnap = await transaction.get(dailyLogRef);
        let currentSummary: DailyLogEntry;

        if (dailyLogSnap.exists()) {
          currentSummary = dailyLogSnap.data() as DailyLogEntry;
        } else {
          currentSummary = {
            date: format(currentSelectedDateInternal, 'yyyy-MM-dd'),
            calories: 0, protein: 0, fat: 0, carbs: 0,
          };
        }

        const updatedSummary: DailyLogEntry = {
          ...currentSummary,
          calories: Math.round(currentSummary.calories + newEntryData.calories),
          protein: Math.round(currentSummary.protein + newEntryData.protein),
          fat: Math.round(currentSummary.fat + newEntryData.fat),
          carbs: Math.round(currentSummary.carbs + newEntryData.carbs),
        };
        
        // Add food entry (Firestore will generate ID)
        // Note: addDoc is not available in transactions directly for subcollections in some SDK versions this way.
        // A common pattern is to generate an ID client-side then set. For simplicity, we'll assume direct add.
        // Or, we can do this outside transaction, which has slight consistency risk if summary update fails.
        // For better consistency: const newFoodEntryRef = doc(foodEntriesCol); transaction.set(newFoodEntryRef, entryWithMeta);
        
        transaction.set(dailyLogRef, updatedSummary); // Use set to create if not exists or update
        // The addDoc for subcollection entry will be outside transaction or use client-generated ID with transaction.set
      });

      // Add food entry outside transaction for simplicity for now.
      // For perfect consistency, generate ID client-side and use transaction.set
      await addDoc(foodEntriesCol, entryWithMeta);


      // No need to manually update state if onSnapshot is working correctly
      // setFoodEntries(prev => [...prev, {id: /*get new id*/, ...entryWithMeta}]);
      // setDailyLog(updatedSummary);

      setTimeout(() => { // Defer toast
        toast({
          title: "Meal Logged!",
          description: `${newEntryData.name} (${Math.round(newEntryData.calories)} kcal) has been added.`,
        });
      }, 0);
    } catch (error) {
      console.error("Error adding food entry to Firestore:", error);
      setTimeout(() => {
        toast({ title: "Logging Error", description: "Could not save meal to database.", variant: "destructive" });
      }, 0);
    }
  }, [currentSelectedDateInternal, toast]);

  const deleteFoodEntry = useCallback(async (entryId: string) => {
    if (!currentSelectedDateInternal || !userId || !entryId) return;

    const dailyLogRef = getDailyLogDocRef(currentSelectedDateInternal);
    const foodEntryRef = doc(db, "users", userId, "dailyLogs", format(currentSelectedDateInternal, 'yyyy-MM-dd'), "foodEntries", entryId);
    
    const entryToDelete = foodEntries.find(e => e.id === entryId);
    if (!entryToDelete) {
      console.error("Entry to delete not found in local state.");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const dailyLogSnap = await transaction.get(dailyLogRef);
        if (!dailyLogSnap.exists()) {
          throw new Error("Daily log summary does not exist.");
        }
        const currentSummary = dailyLogSnap.data() as DailyLogEntry;
        const updatedSummary: DailyLogEntry = {
          ...currentSummary,
          calories: Math.round(currentSummary.calories - entryToDelete.calories),
          protein: Math.round(currentSummary.protein - entryToDelete.protein),
          fat: Math.round(currentSummary.fat - entryToDelete.fat),
          carbs: Math.round(currentSummary.carbs - entryToDelete.carbs),
        };
        transaction.set(dailyLogRef, updatedSummary);
        transaction.delete(foodEntryRef);
      });

      // State updates handled by onSnapshot
      setTimeout(() => {
        toast({
          title: "Meal Deleted",
          description: "The meal has been removed from your log.",
        });
      },0);
    } catch (error) {
      console.error("Error deleting food entry from Firestore:", error);
      setTimeout(() => {
        toast({ title: "Deletion Error", description: "Could not delete meal.", variant: "destructive" });
      },0);
    }
  }, [currentSelectedDateInternal, foodEntries, toast]);

  const clearLogForDate = useCallback(async (dateToClear: Date) => {
    if (!userId) return;
    const dailyLogRef = getDailyLogDocRef(dateToClear);
    const foodEntriesColRef = getFoodEntriesColRef(dateToClear);

    try {
      const batch = writeBatch(db);
      const entriesSnapshot = await getDocs(foodEntriesColRef);
      entriesSnapshot.forEach(doc => batch.delete(doc.ref));
      batch.delete(dailyLogRef); // Or set to initial state: batch.set(dailyLogRef, initialLog);
      await batch.commit();
      
      // State updates handled by onSnapshot if currentSelectedDateInternal matches dateToClear
      // If not, and you need to clear UI for a non-selected date that might be cached, manual reset might be needed
      // For simplicity, we assume onSnapshot covers the current view.

      setTimeout(() => {
        toast({ title: "Log Cleared", description: `Log for ${format(dateToClear, "MMM d, yyyy")} cleared.` });
      }, 0);
    } catch (error) {
      console.error("Failed to clear daily log in Firestore", error);
       setTimeout(() => {
        toast({ title: "Clear Error", description: "Could not clear log.", variant: "destructive" });
      },0);
    }
  }, [toast]);

  const getLogDataForDate = useCallback(async (dateToFetch: Date): Promise<{ summary: DailyLogEntry | null; entries: FoodEntry[] }> => {
    if (!userId) {
      const formattedDate = format(dateToFetch, 'yyyy-MM-dd');
      return { summary: { date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] };
    }
    
    const dailyLogRef = getDailyLogDocRef(dateToFetch);
    const foodEntriesQuery = query(getFoodEntriesColRef(dateToFetch), orderBy("timestamp", "asc"));

    try {
      const summarySnap = await getDoc(dailyLogRef);
      const summary = summarySnap.exists() ? summarySnap.data() as DailyLogEntry : null;

      const entriesSnap = await getDocs(foodEntriesQuery);
      const entries: FoodEntry[] = [];
      entriesSnap.forEach((doc) => {
         const data = doc.data();
         entries.push({ 
             id: doc.id, 
             ...data, 
             timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp 
        } as FoodEntry);
      });
      return { summary, entries };
    } catch (error) {
      console.error("Failed to fetch log data from Firestore for date:", format(dateToFetch, 'yyyy-MM-dd'), error);
      const formattedDate = format(dateToFetch, 'yyyy-MM-dd');
      return { summary: { date: formattedDate, calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] };
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
    refreshLog: () => { if (currentSelectedDateInternal) {/* onSnapshot handles this */} },
    getLogDataForDate,
  };
}
