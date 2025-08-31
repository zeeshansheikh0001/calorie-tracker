export interface FeedbackSubmission {
  id: string;
  type: 'bug' | 'feature' | 'general' | 'rating';
  title: string;
  description: string;
  rating?: number;
  timestamp: number;
  userAgent: string;
}

export interface FeedbackStats {
  totalSubmissions: number;
  averageRating: number;
  feedbackByType: Record<string, number>;
  recentSubmissions: FeedbackSubmission[];
}

class FeedbackService {
  private readonly STORAGE_KEY = 'calorie_tracker_feedback';

  /**
   * Submit new feedback
   */
  async submitFeedback(feedback: Omit<FeedbackSubmission, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const feedbackData: FeedbackSubmission = {
        ...feedback,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      // Store locally
      await this.storeLocally(feedbackData);
      return true;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return false;
    }
  }

  /**
   * Get all feedback from local storage
   */
  async getAllFeedback(): Promise<FeedbackSubmission[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error retrieving feedback:", error);
      return [];
    }
  }

  /**
   * Get feedback statistics
   */
  async getFeedbackStats(): Promise<FeedbackStats> {
    try {
      const feedback = await this.getAllFeedback();
      
      const totalSubmissions = feedback.length;
      const ratings = feedback.filter(f => f.rating).map(f => f.rating!);
      const averageRating = ratings.length > 0 
        ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
        : 0;

      // Count feedback by type
      const feedbackByType: Record<string, number> = {};
      feedback.forEach(f => {
        feedbackByType[f.type] = (feedbackByType[f.type] || 0) + 1;
      });

      // Get recent submissions (last 10)
      const recentSubmissions = feedback
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      return {
        totalSubmissions,
        averageRating,
        feedbackByType,
        recentSubmissions,
      };
    } catch (error) {
      console.error("Error getting feedback stats:", error);
      return {
        totalSubmissions: 0,
        averageRating: 0,
        feedbackByType: {},
        recentSubmissions: [],
      };
    }
  }

  /**
   * Export feedback data as CSV
   */
  async exportFeedback(): Promise<string> {
    try {
      const feedback = await this.getAllFeedback();
      const csvData = this.convertToCSV(feedback);
      return csvData;
    } catch (error) {
      console.error("Error exporting feedback:", error);
      throw error;
    }
    }

  /**
   * Clear all feedback data
   */
  async clearAllFeedback(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing feedback:", error);
    }
  }

  /**
   * Store feedback locally
   */
  private async storeLocally(feedback: FeedbackSubmission): Promise<void> {
    try {
      const existing = await this.getAllFeedback();
      existing.push(feedback);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
    } catch (error) {
      console.error("Error storing feedback locally:", error);
    }
  }

  /**
   * Convert feedback data to CSV format
   */
  private convertToCSV(feedback: FeedbackSubmission[]): string {
    const headers = ["Type", "Title", "Description", "Rating", "Timestamp", "User Agent"];
    const rows = feedback.map(f => [
      f.type,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.description.replace(/"/g, '""')}"`,
      f.rating || "",
      new Date(f.timestamp).toISOString(),
      `"${f.userAgent.replace(/"/g, '""')}"`,
    ]);

    return [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();
