
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Guest User",
  email: "",
  avatarUrl: "https://placehold.co/100x100.png",
};

const userId = "defaultUser"; // Placeholder for actual user ID from Firebase Auth

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUserProfile(DEFAULT_USER_PROFILE);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const profileRef = doc(db, "users", userId, "profile", "data"); // Using "data" as sub-doc for simplicity

    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        // No profile exists, set default and optionally save it
        setUserProfile(DEFAULT_USER_PROFILE);
        setDoc(profileRef, DEFAULT_USER_PROFILE).catch(error => {
          console.error("Error saving default user profile to Firestore:", error);
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching user profile from Firestore:", error);
      setUserProfile(DEFAULT_USER_PROFILE);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []); // Removed userId from dependency array as it's constant for now

  const updateUserProfile = useCallback(async (updatedProfileData: Partial<UserProfile>) => {
    if (!userId) {
      console.error("User ID is not available. Cannot update profile.");
      return;
    }
    const profileRef = doc(db, "users", userId, "profile", "data");
    try {
      // Merge with existing data if only partial update is provided
      const currentProfileSnap = await getDoc(profileRef);
      const currentProfile = currentProfileSnap.exists() ? currentProfileSnap.data() as UserProfile : DEFAULT_USER_PROFILE;
      const newProfile = { ...currentProfile, ...updatedProfileData };
      await setDoc(profileRef, newProfile);
      // setUserProfile(newProfile); // State updated by onSnapshot
    } catch (error) {
      console.error("Error updating user profile in Firestore:", error);
      throw error; // Re-throw to be caught by calling function if needed
    }
  }, []); // Removed userId from dependency array

  return { userProfile, updateUserProfile, isLoading };
}
