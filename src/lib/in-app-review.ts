import InAppReview from 'react-native-in-app-review';

export class InAppReviewService {
  private static hasRequestedReview = false;
  private static readonly REVIEW_THRESHOLD = 7; // Days after install
  private static readonly USAGE_THRESHOLD = 5; // Number of meals logged

  /**
   * Check if in-app review is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      return await InAppReview.isAvailable();
    } catch (error) {
      console.error('Error checking in-app review availability:', error);
      return false;
    }
  }

  /**
   * Request in-app review with smart timing
   */
  static async requestReview(): Promise<boolean> {
    try {
      // Prevent multiple requests in the same session
      if (this.hasRequestedReview) {
        console.log('Review already requested in this session');
        return false;
      }

      // Check if review is available
      const available = await this.isAvailable();
      if (!available) {
        console.log('In-app review not available on this device');
        return false;
      }

      // Check if conditions are met
      const shouldShow = await this.shouldShowReview();
      if (!shouldShow) {
        console.log('Conditions not met for showing review');
        return false;
      }

      // Request the review
      await InAppReview.RequestInAppReview();
      this.hasRequestedReview = true;
      
      // Store that we've shown the review
      await this.markReviewShown();
      
      console.log('In-app review requested successfully');
      return true;
    } catch (error) {
      console.error('Error requesting in-app review:', error);
      return false;
    }
  }

  /**
   * Determine if we should show the review based on user behavior
   */
  private static async shouldShowReview(): Promise<boolean> {
    try {
      // Get stored data (you'll need to implement storage)
      const installDate = await this.getInstallDate();
      const mealsLogged = await this.getMealsLoggedCount();
      const lastReviewRequest = await this.getLastReviewRequestDate();
      
      const now = new Date();
      const daysSinceInstall = Math.floor((now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Don't show if already requested in last 30 days
      if (lastReviewRequest) {
        const daysSinceLastRequest = Math.floor((now.getTime() - lastReviewRequest.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastRequest < 30) {
          return false;
        }
      }

      // Show review if user has been using the app for a while and is engaged
      return daysSinceInstall >= this.REVIEW_THRESHOLD && mealsLogged >= this.USAGE_THRESHOLD;
    } catch (error) {
      console.error('Error checking review conditions:', error);
      return false;
    }
  }

  /**
   * Smart trigger points for review requests
   */
  static async triggerReviewAfterPositiveAction(action: 'meal_logged' | 'goal_achieved' | 'streak_milestone'): Promise<void> {
    try {
      // Increment usage counters
      await this.incrementUsageCounter(action);
      
      // Only request review after positive user actions
      if (action === 'goal_achieved' || action === 'streak_milestone') {
        // Small delay to let user appreciate their achievement
        setTimeout(() => {
          this.requestReview();
        }, 2000);
      } else if (action === 'meal_logged') {
        // Check if this is a milestone meal log
        const mealsLogged = await this.getMealsLoggedCount();
        if (mealsLogged > 0 && mealsLogged % 10 === 0) { // Every 10th meal
          setTimeout(() => {
            this.requestReview();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error triggering review:', error);
    }
  }

  // Helper methods (implement based on your storage solution)
  private static async getInstallDate(): Promise<Date> {
    // Implement with AsyncStorage or your preferred storage
    // Return app install date or first launch date
    return new Date(); // Placeholder
  }

  private static async getMealsLoggedCount(): Promise<number> {
    // Get from your app's storage/database
    return 0; // Placeholder
  }

  private static async getLastReviewRequestDate(): Promise<Date | null> {
    // Get from AsyncStorage
    return null; // Placeholder
  }

  private static async markReviewShown(): Promise<void> {
    // Store current date as last review request
    // Implement with AsyncStorage
  }

  private static async incrementUsageCounter(action: string): Promise<void> {
    // Increment counters for different actions
    // Implement with AsyncStorage
  }
}