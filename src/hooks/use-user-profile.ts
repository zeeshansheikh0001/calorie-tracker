"use client";

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Guest User",
  email: "", 
  avatarUrl: "https://placehold.co/100x100.png",
};

const LOCAL_STORAGE_KEY = 'userProfile';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      // First check for userProfile from profile edit
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      // Then check for onboarding profile data
      const onboardingProfile = localStorage.getItem('userProfile');
      
      if (storedProfile) {
        const parsedProfile: UserProfile = JSON.parse(storedProfile);
        setUserProfile({
          name: parsedProfile.name || DEFAULT_USER_PROFILE.name,
          email: parsedProfile.email || DEFAULT_USER_PROFILE.email,
          avatarUrl: parsedProfile.avatarUrl || DEFAULT_USER_PROFILE.avatarUrl,
          age: parsedProfile.age,
          gender: parsedProfile.gender,
        });
      } else if (onboardingProfile) {
        // If no regular profile exists but onboarding data does, use that
        const parsedOnboardingData = JSON.parse(onboardingProfile);
        setUserProfile({
          name: parsedOnboardingData.name || DEFAULT_USER_PROFILE.name,
          email: DEFAULT_USER_PROFILE.email, // Onboarding doesn't collect email
          avatarUrl: DEFAULT_USER_PROFILE.avatarUrl,
          age: parsedOnboardingData.age,
          gender: parsedOnboardingData.gender,
        });
        
        // Save this data to the regular profile storage to consolidate
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          name: parsedOnboardingData.name,
          email: DEFAULT_USER_PROFILE.email,
          avatarUrl: DEFAULT_USER_PROFILE.avatarUrl,
          age: parsedOnboardingData.age,
          gender: parsedOnboardingData.gender,
        }));
      } else {
        setUserProfile(DEFAULT_USER_PROFILE);
      }
    } catch (error) {
      console.error("Failed to load user profile from localStorage", error);
      setUserProfile(DEFAULT_USER_PROFILE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // This function is not directly used by the profile page to update,
  // as saving happens in profile/edit/page.tsx.
  // However, it's good practice to have an update function if this hook were to be used elsewhere for updates.
  const updateUserProfile = (newProfile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
      const updatedProfile = { ...prevProfile, ...newProfile };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));
      } catch (error) {
        console.error("Failed to save user profile to localStorage", error);
      }
      return updatedProfile;
    });
  };


  return { userProfile, isLoading, updateUserProfile };
}
