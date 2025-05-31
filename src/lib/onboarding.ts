"use client";

/**
 * Checks if the user needs to complete onboarding
 * @returns {boolean} true if user needs onboarding, false otherwise
 */
export function needsOnboarding(): boolean {
  // Only run on the client side
  if (typeof window === 'undefined') return false;
  
  // Check if user profile exists in localStorage
  const userProfile = localStorage.getItem('userProfile');
  return !userProfile;
}

/**
 * Marks that a user has seen the onboarding by setting an empty profile
 * This is used for testing/development to bypass onboarding
 */
export function skipOnboarding(): void {
  if (typeof window === 'undefined') return;
  
  // Only if the profile doesn't already exist
  if (!localStorage.getItem('userProfile')) {
    localStorage.setItem('userProfile', JSON.stringify({
      name: "Test User",
      age: 30,
      gender: "other",
      calories: 2200,
      protein: 160,
      fat: 70,
      carbs: 280,
    }));
  }
}

/**
 * Clears the user profile from localStorage
 * This is used for testing/development to force onboarding
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userProfile');
} 