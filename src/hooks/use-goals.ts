
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Goal } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

const DEFAULT_GOALS: Goal = {
  calories: 2000,
  protein: 150,
  fat: 70,
  carbs: 250,
};

const userId = "defaultUser"; // Placeholder for actual user ID from Firebase Auth

export function useGoals() {
  const [goals, setGoals] = useState<Goal>(DEFAULT_GOALS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setGoals(DEFAULT_GOALS);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const goalsRef = doc(db, "users", userId, "goals", "data"); // Using "data" as sub-doc

    const unsubscribe = onSnapshot(goalsRef, (docSnap) => {
      if (docSnap.exists()) {
        setGoals(docSnap.data() as Goal);
      } else {
        setGoals(DEFAULT_GOALS);
        // Optionally, save default goals to Firestore if they don't exist
        setDoc(goalsRef, DEFAULT_GOALS).catch(error => {
          console.error("Error saving default goals to Firestore:", error);
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching goals from Firestore:", error);
      setGoals(DEFAULT_GOALS);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []); // Removed userId from dependency array

  const updateGoals = useCallback(async (newGoals: Partial<Goal>) => {
    if (!userId) {
      console.error("User ID is not available. Cannot update goals.");
      return;
    }
    const goalsRef = doc(db, "users", userId, "goals", "data");
    try {
       // Merge with existing data if only partial update is provided
      const currentGoalsSnap = await getDoc(goalsRef);
      const currentGoals = currentGoalsSnap.exists() ? currentGoalsSnap.data() as Goal : DEFAULT_GOALS;
      const updatedGoalsData = { ...currentGoals, ...newGoals };
      await setDoc(goalsRef, updatedGoalsData);
      // setGoals(updatedGoalsData); // State updated by onSnapshot
    } catch (error) {
      console.error("Error updating goals in Firestore:", error);
      throw error; // Re-throw to be caught by calling function if needed
    }
  }, []); // Removed userId from dependency array

  return { goals, updateGoals, isLoading };
}
