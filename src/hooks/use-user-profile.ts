
"use client";

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Guest User",
  email: "", // Email is not displayed on homepage header, but good to have a default
  avatarUrl: "https://placehold.co/100x100.png", // Default placeholder
};

const LOCAL_STORAGE_KEY = 'userProfile';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProfile) {
        const parsedProfile: UserProfile = JSON.parse(storedProfile);
        setUserProfile({
          name: parsedProfile.name || DEFAULT_USER_PROFILE.name,
          email: parsedProfile.email || DEFAULT_USER_PROFILE.email,
          avatarUrl: parsedProfile.avatarUrl || DEFAULT_USER_PROFILE.avatarUrl,
        });
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

  return { userProfile, isLoading };
}
