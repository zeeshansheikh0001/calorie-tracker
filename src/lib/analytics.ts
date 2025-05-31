import { trackEvent } from "@/hooks/use-analytics";

// Event categories
const CATEGORIES = {
  FOOD: "food",
  USER: "user",
  GOAL: "goal",
  NAVIGATION: "navigation",
  INTERACTION: "interaction",
};

// Helper functions for common tracking events
export const Analytics = {
  // Food tracking events
  trackFoodAdded: (foodName: string) => {
    trackEvent("food_added", CATEGORIES.FOOD, foodName);
  },
  trackMealLogged: (mealType: string) => {
    trackEvent("meal_logged", CATEGORIES.FOOD, mealType);
  },
  
  // Goal tracking events
  trackGoalCreated: (goalType: string) => {
    trackEvent("goal_created", CATEGORIES.GOAL, goalType);
  },
  trackGoalAchieved: (goalType: string) => {
    trackEvent("goal_achieved", CATEGORIES.GOAL, goalType);
  },
  
  // User events
  trackProfileUpdate: () => {
    trackEvent("profile_updated", CATEGORIES.USER);
  },
  trackOnboardingComplete: () => {
    trackEvent("onboarding_complete", CATEGORIES.USER);
  },
  
  // Navigation events
  trackTabChange: (tabName: string) => {
    trackEvent("tab_change", CATEGORIES.NAVIGATION, tabName);
  },
  
  // Custom event for flexibility
  trackCustomEvent: (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    trackEvent(action, category, label, value);
  },
}; 