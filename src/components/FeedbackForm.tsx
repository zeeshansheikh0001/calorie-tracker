"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Star, 
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface FeedbackSubmission {
  id: string;
  type: 'bug' | 'feature' | 'general' | 'rating';
  title: string;
  description: string;
  rating?: number;
  timestamp: number;
  userAgent: string;
}

export function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general' | 'rating'>('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const feedback: FeedbackSubmission = {
        id: Date.now().toString(),
        type: feedbackType,
        title: title.trim(),
        description: description.trim(),
        rating: feedbackType === 'rating' ? rating : undefined,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      };

      // Save to localStorage
      const existingFeedback = localStorage.getItem('calorie_tracker_feedback');
      const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackArray.push(feedback);
      localStorage.setItem('calorie_tracker_feedback', JSON.stringify(feedbackArray));

      // Show success message
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully. We appreciate your input!",
      });

      setIsSubmitted(true);
      setTimeout(() => {
        resetForm();
        setIsSubmitted(false);
      }, 3000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRating(5);
    setFeedbackType('general');
  };

  const renderRatingStars = () => {
    if (feedbackType !== 'rating') return null;
    
    return (
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Rate your experience with Calorie Tracker
          </p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={cn(
                  "text-2xl transition-all duration-200 hover:scale-110",
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                )}
              >
                {star <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {rating}/5 stars
          </p>
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Feedback Submitted!
          </h3>
          <p className="text-green-700">
            Thank you for your valuable input. We'll review your feedback and use it to improve Calorie Tracker.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20" data-feedback-form>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>Share Your Feedback</CardTitle>
        </div>
        <CardDescription>
          Help us improve Calorie Tracker by sharing your thoughts, reporting bugs, or suggesting new features.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Feedback Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Feedback Type</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { type: 'bug', label: 'Bug Report', icon: Bug, color: 'bg-red-100 text-red-700 border-red-200' },
              { type: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'bg-blue-100 text-blue-700 border-blue-200' },
              { type: 'general', label: 'General Feedback', icon: MessageSquare, color: 'bg-green-100 text-green-700 border-green-200' },
              { type: 'rating', label: 'App Rating', icon: Star, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
            ] as const).map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => setFeedbackType(type)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105",
                  "flex flex-col items-center gap-2",
                  feedbackType === type 
                    ? `${color} border-current shadow-md` 
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rating Stars */}
        {renderRatingStars()}

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {feedbackType === 'bug' ? 'Brief description of the issue:' :
             feedbackType === 'feature' ? 'Feature name:' :
             feedbackType === 'rating' ? 'What would you like to rate?' :
             'Subject:'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your feedback"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            maxLength={100}
          />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {feedbackType === 'bug' ? 'Detailed description (steps to reproduce, expected vs actual behavior):' :
             feedbackType === 'feature' ? 'Describe the feature and why it would be useful:' :
             feedbackType === 'rating' ? 'Additional comments (optional):' :
             'Your feedback:'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed information..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            rows={4}
            maxLength={1000}
          />
          <div className="text-xs text-muted-foreground text-right">
            {description.length}/1000 characters
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What happens to your feedback?</p>
              <ul className="space-y-1 text-xs">
                <li>• Your feedback is stored locally on your device</li>
                <li>• We review all submissions to improve the app</li>
                <li>• Bug reports help us fix issues faster</li>
                <li>• Feature requests influence our development roadmap</li>
                <li>• Your privacy is protected - no personal data is collected</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
