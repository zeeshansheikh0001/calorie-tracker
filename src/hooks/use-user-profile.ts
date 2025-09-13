"use client";

import { useState, useEffect } from 'react';
import type { UserProfile, SavedDietChart } from '@/types';
import { generateId } from '@/lib/utils';

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Guest User",
  email: "", 
  avatarUrl: "https://placehold.co/100x100.png",
  savedDietCharts: [],
};

const LOCAL_STORAGE_KEY = 'userProfile';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load profile from localStorage
  const loadProfile = () => {
    try {
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (storedProfile) {
        const parsedProfile: UserProfile = JSON.parse(storedProfile);
        setUserProfile({
          name: parsedProfile.name || DEFAULT_USER_PROFILE.name,
          email: parsedProfile.email || DEFAULT_USER_PROFILE.email,
          avatarUrl: parsedProfile.avatarUrl || DEFAULT_USER_PROFILE.avatarUrl,
          age: parsedProfile.age,
          gender: parsedProfile.gender,
          height: parsedProfile.height,
          weight: parsedProfile.weight,
          heightUnit: parsedProfile.heightUnit,
          weightUnit: parsedProfile.weightUnit,
          savedDietCharts: parsedProfile.savedDietCharts || [],
        });
      } else {
        setUserProfile(DEFAULT_USER_PROFILE);
      }
    } catch (error) {
      console.error("Failed to load user profile from localStorage", error);
      setUserProfile(DEFAULT_USER_PROFILE);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadProfile();
    setIsLoading(false);

    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        loadProfile();
      }
    };

    // Listen for custom events from the same tab
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const updateUserProfile = (newProfile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
      const updatedProfile = { ...prevProfile, ...newProfile };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } catch (error) {
        console.error("Failed to save user profile to localStorage", error);
      }
      return updatedProfile;
    });
  };

  const saveDietChart = (name: string, dietChart: any) => {
    setUserProfile(prevProfile => {
      const savedDietCharts = [...(prevProfile.savedDietCharts || [])];
      
      const newDietChart: SavedDietChart = {
        id: generateId(),
        name,
        createdAt: new Date().toISOString(),
        dietChart,
      };
      
      savedDietCharts.push(newDietChart);
      
      const updatedProfile = { 
        ...prevProfile, 
        savedDietCharts 
      };
      
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } catch (error) {
        console.error("Failed to save diet chart to localStorage", error);
      }
      
      return updatedProfile;
    });
  };

  return { userProfile, isLoading, updateUserProfile, saveDietChart };
}
