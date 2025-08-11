import { useCallback } from 'react';
import { InAppReviewService } from '@/lib/in-app-review';

export function useInAppReview() {
  const requestReview = useCallback(async () => {
    return await InAppReviewService.requestReview();
  }, []);

  const triggerAfterAction = useCallback(async (action: 'meal_logged' | 'goal_achieved' | 'streak_milestone') => {
    await InAppReviewService.triggerReviewAfterPositiveAction(action);
  }, []);

  const checkAvailability = useCallback(async () => {
    return await InAppReviewService.isAvailable();
  }, []);

  return {
    requestReview,
    triggerAfterAction,
    checkAvailability
  };
}