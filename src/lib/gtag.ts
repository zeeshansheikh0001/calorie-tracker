// Types for Google Analytics
export interface GTagEvent {
  action: string;
  category: string;
  label: string;
  value?: number;
}

// Google Analytics Measurement ID
export const GA_TRACKING_ID = 'G-P3WL0JM7FM';

// Page view tracking
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Custom event tracking
export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Commonly used events for the Calorie Tracker app
export const trackAddMeal = (mealType: string) => {
  event({
    action: 'add_meal',
    category: 'Meal Tracking',
    label: mealType,
  });
};

export const trackGoalUpdate = (goalType: string) => {
  event({
    action: 'update_goal',
    category: 'Goals',
    label: goalType,
  });
};

export const trackSearch = (query: string) => {
  event({
    action: 'search',
    category: 'Food Search',
    label: query,
  });
};

export const trackThemeChange = (theme: string) => {
  event({
    action: 'change_theme',
    category: 'User Preferences',
    label: theme,
  });
}; 