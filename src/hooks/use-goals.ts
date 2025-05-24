
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Goal } from '@/types';

const DEFAULT_GOALS: Goal = {
  calories: 2000,
  protein: 150,
  fat: 70,
  carbs: 250,
};

const LOCAL_STORAGE_KEY = 'userGoals';

export function useGoals() {
  const [goals, setGoals] = useState<Goal>(DEFAULT_GOALS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedGoals = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    } catch (error) {
      console.error("Failed to load goals from localStorage", error);
      setGoals(DEFAULT_GOALS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGoals = useCallback((newGoals: Partial<Goal>) => {
    setGoals((prevGoals) => {
      const updatedGoals = { ...prevGoals, ...newGoals };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedGoals));
      } catch (error) {
        console.error("Failed to save goals to localStorage", error);
      }
      return updatedGoals;
    });
  }, []);

  return { goals, updateGoals, isLoading };
}
