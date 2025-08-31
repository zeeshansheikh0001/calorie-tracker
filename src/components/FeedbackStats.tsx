"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, Bug, Lightbulb, ThumbsUp } from "lucide-react";
import { feedbackService, type FeedbackStats } from "@/lib/feedback-service";

export function FeedbackStats() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const feedbackStats = await feedbackService.getFeedbackStats();
      setStats(feedbackStats);
    } catch (error) {
      console.error("Error loading feedback stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4" />;
      case "feature":
        return <Lightbulb className="h-4 w-4" />;
      case "general":
        return <MessageSquare className="h-4 w-4" />;
      case "rating":
        return <ThumbsUp className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case "bug":
        return "Bug Reports";
      case "feature":
        return "Feature Requests";
      case "general":
        return "General Feedback";
      case "rating":
        return "App Ratings";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalSubmissions === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
            <p className="text-gray-500 mb-4">
              Be the first to share your thoughts and help us improve the app!
            </p>
            <Button onClick={loadStats} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback Statistics
        </CardTitle>
        <CardDescription>
          Community feedback insights and metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.totalSubmissions}</div>
            <div className="text-sm text-muted-foreground">Total Submissions</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.averageRating}</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {Object.keys(stats.feedbackByType).length}
            </div>
            <div className="text-sm text-muted-foreground">Feedback Types</div>
          </div>
        </div>

        {/* Feedback by Type */}
        <div>
          <h4 className="font-medium mb-3">Feedback by Type</h4>
          <div className="space-y-2">
            {Object.entries(stats.feedbackByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getFeedbackTypeIcon(type)}
                  <span className="font-medium">{getFeedbackTypeLabel(type)}</span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        {stats.recentSubmissions.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Recent Submissions</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stats.recentSubmissions.map((submission, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getFeedbackTypeIcon(submission.type)}
                      <span className="text-sm font-medium">{submission.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(submission.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {submission.description}
                  </p>
                  {submission.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{submission.rating}/5</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={loadStats} variant="outline" size="sm">
            Refresh Stats
          </Button>
          <Button 
            onClick={() => feedbackService.exportFeedback().then(csv => {
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'feedback-export.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            })} 
            variant="outline" 
            size="sm"
          >
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
