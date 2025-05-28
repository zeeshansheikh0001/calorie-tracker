"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday, isThisWeek, subDays, differenceInDays } from "date-fns";
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart2,
  Target,
  Award,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Goal, DailyLogEntry } from "@/types";

interface SmartInsightsProps {
  goals: Goal | null;
  dailyLog: DailyLogEntry | null;
  currentSelectedDate: Date | null;
  previousLogs: DailyLogEntry[];
  loading: boolean;
}

// A factory function to generate insights based on the user data
const generateInsights = (
  goals: Goal | null,
  dailyLog: DailyLogEntry | null,
  previousLogs: DailyLogEntry[],
  currentSelectedDate: Date | null
) => {
  const insights: {
    id: string;
    title: string;
    description: string;
    type: "success" | "warning" | "info" | "neutral";
    icon: React.ElementType;
    priority: number;
    actionText?: string;
    actionLink?: string;
  }[] = [];

  if (!dailyLog || !currentSelectedDate) {
    return insights;
  }

  const { calories, protein, fat, carbs } = dailyLog;
  
  // Get basic insights for current day
  const isCurrentDay = isToday(currentSelectedDate);
  const dayText = isCurrentDay 
    ? "today" 
    : isYesterday(currentSelectedDate) 
      ? "yesterday" 
      : format(currentSelectedDate, "MMM d");

  // Calculate percentage of goals
  let caloriePercentage = 0;
  let proteinPercentage = 0; 
  let fatPercentage = 0;
  let carbsPercentage = 0;
  
  if (goals) {
    caloriePercentage = Math.round((calories / goals.calories) * 100);
    proteinPercentage = Math.round((protein / goals.protein) * 100);
    fatPercentage = Math.round((fat / goals.fat) * 100);
    carbsPercentage = Math.round((carbs / goals.carbs) * 100);
  }

  // Base insights
  if (goals) {
    // Calorie intake insight
    if (caloriePercentage > 0) {
      if (caloriePercentage < 50 && isCurrentDay) {
        insights.push({
          id: "calories-low",
          title: `Only ${caloriePercentage}% of your calorie goal consumed`,
          description: `You've only consumed ${calories} out of ${goals.calories} calories ${dayText}. Consider adding a nutritious meal.`,
          type: "warning",
          icon: AlertCircle,
          priority: 90,
          actionText: "Log meal",
          actionLink: "/log-food/manual"
        });
      } else if (caloriePercentage > 100) {
        insights.push({
          id: "calories-exceeded",
          title: `Calorie goal exceeded by ${caloriePercentage - 100}%`,
          description: `You've consumed ${calories} calories, which is above your ${goals.calories} calorie goal ${dayText}.`,
          type: caloriePercentage > 130 ? "warning" : "info",
          icon: caloriePercentage > 130 ? AlertCircle : CheckCircle2,
          priority: caloriePercentage > 130 ? 80 : 50,
        });
      } else if (caloriePercentage >= 90 && caloriePercentage <= 100) {
        insights.push({
          id: "calories-perfect",
          title: "Perfect calorie intake!",
          description: `You've hit ${caloriePercentage}% of your calorie goal ${dayText}. Great job staying on target!`,
          type: "success",
          icon: Award,
          priority: 70,
        });
      } else if (caloriePercentage >= 75 && caloriePercentage < 90 && isCurrentDay) {
        insights.push({
          id: "calories-almost",
          title: "Almost there!",
          description: `You're at ${caloriePercentage}% of your calorie goal. Just ${goals.calories - calories} more calories to reach your target.`,
          type: "info",
          icon: Target,
          priority: 60,
        });
      }
    }

    // Macronutrient balance insights
    if (protein > 0 && fat > 0 && carbs > 0) {
      // Check protein intake
      if (proteinPercentage < 70 && calories > goals.calories * 0.7) {
        insights.push({
          id: "protein-low",
          title: "Protein intake is low",
          description: `Your protein intake is only ${proteinPercentage}% of your goal while you've consumed ${caloriePercentage}% of your calorie goal. Consider adding more protein-rich foods.`,
          type: "warning",
          icon: TrendingDown,
          priority: 75,
        });
      } else if (proteinPercentage > 120) {
        insights.push({
          id: "protein-high",
          title: "High protein intake",
          description: `You've consumed ${proteinPercentage}% of your protein goal. Great work prioritizing protein!`,
          type: "success",
          icon: TrendingUp,
          priority: 55,
        });
      }

      // Check if carbs are too high
      if (carbsPercentage > 130 && fatPercentage < 80 && proteinPercentage < 80) {
        insights.push({
          id: "carbs-imbalance",
          title: "Carb-heavy diet detected",
          description: `Your diet ${dayText} is high in carbs (${carbsPercentage}%) but lower in protein and fats. Consider a more balanced approach.`,
          type: "info",
          icon: BarChart2,
          priority: 65,
        });
      }
    }
  }

  // Trend insights based on previous logs
  if (previousLogs.length > 2 && isCurrentDay) {
    const recentLogs = previousLogs.slice(0, 7); // Last week's logs
    const avgCalories = recentLogs.reduce((sum, log) => sum + log.calories, 0) / recentLogs.length;
    const avgProtein = recentLogs.reduce((sum, log) => sum + log.protein, 0) / recentLogs.length;
    
    const calorieChange = Math.round(((calories - avgCalories) / avgCalories) * 100);
    const proteinChange = Math.round(((protein - avgProtein) / avgProtein) * 100);
    
    // Detect significant changes
    if (Math.abs(calorieChange) > 20) {
      insights.push({
        id: "calorie-trend",
        title: `${calorieChange > 0 ? "Higher" : "Lower"} calories than your average`,
        description: `You're consuming ${Math.abs(calorieChange)}% ${calorieChange > 0 ? "more" : "less"} calories today compared to your average of ${Math.round(avgCalories)} calories.`,
        type: calorieChange > 30 ? "warning" : "info",
        icon: calorieChange > 0 ? TrendingUp : TrendingDown,
        priority: 60,
      });
    }
    
    if (Math.abs(proteinChange) > 25 && protein > 0) {
      insights.push({
        id: "protein-trend",
        title: `${proteinChange > 0 ? "Higher" : "Lower"} protein intake than usual`,
        description: `Your protein intake is ${Math.abs(proteinChange)}% ${proteinChange > 0 ? "higher" : "lower"} than your average of ${Math.round(avgProtein)}g.`,
        type: proteinChange < -25 ? "warning" : "info",
        icon: proteinChange > 0 ? TrendingUp : TrendingDown,
        priority: 55,
      });
    }
    
    // Consistency insights
    const consecutiveDays = previousLogs.filter(log => 
      log.calories > 0 && 
      differenceInDays(new Date(), new Date(log.date)) <= 7
    ).length;
    
    if (consecutiveDays >= 3) {
      insights.push({
        id: "streak",
        title: `${consecutiveDays} day tracking streak!`,
        description: `You've been consistently tracking your nutrition for ${consecutiveDays} days. Keep up the great work!`,
        type: "success",
        icon: Award,
        priority: 85,
      });
    }
  }

  // If no insights are generated but we have data, add a generic one
  if (insights.length === 0 && calories > 0) {
    insights.push({
      id: "generic",
      title: `Your nutrition data for ${dayText}`,
      description: `You've logged ${calories} calories with ${protein}g protein, ${fat}g fat, and ${carbs}g carbs.`,
      type: "neutral",
      icon: CheckCircle2,
      priority: 30,
    });
  }

  // If we have no data for the current day
  if (calories === 0 && isCurrentDay) {
    insights.push({
      id: "no-data",
      title: "No meals logged yet today",
      description: "Track your first meal of the day to get personalized insights!",
      type: "neutral",
      icon: Clock,
      priority: 100,
      actionText: "Log meal",
      actionLink: "/log-food/manual"
    });
  }

  // Sort insights by priority
  return insights.sort((a, b) => b.priority - a.priority);
};

export default function SmartInsights({
  goals,
  dailyLog,
  currentSelectedDate,
  previousLogs,
  loading
}: SmartInsightsProps) {
  const [insights, setInsights] = useState<ReturnType<typeof generateInsights>>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  useEffect(() => {
    if (!loading) {
      const newInsights = generateInsights(goals, dailyLog, previousLogs, currentSelectedDate);
      setInsights(newInsights);
    }
  }, [goals, dailyLog, previousLogs, currentSelectedDate, loading]);
  
  const filteredInsights = activeTab === "all" 
    ? insights 
    : insights.filter(insight => insight.type === activeTab);
  
  if (loading) {
    return (
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-3">
      {insights.length > 0 && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-2">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="success" className="text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Good
            </TabsTrigger>
            <TabsTrigger value="warning" className="text-xs">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="info" className="text-xs">
              <Lightbulb className="h-3.5 w-3.5 mr-1" />
              Tips
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0 space-y-3">
            <AnimatePresence mode="wait">
              {filteredInsights.length > 0 ? (
                filteredInsights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`shadow-md rounded-xl overflow-hidden ${
                        insight.type === "success" 
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30" 
                          : insight.type === "warning" 
                            ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
                            : insight.type === "info"
                              ? "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30"
                              : "bg-card"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            insight.type === "success" 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                              : insight.type === "warning" 
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : insight.type === "info"
                                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                                  : "bg-muted text-muted-foreground"
                          }`}>
                            <insight.icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className={`font-semibold ${
                              insight.type === "success" 
                                ? "text-green-700 dark:text-green-400" 
                                : insight.type === "warning" 
                                  ? "text-amber-700 dark:text-amber-400"
                                  : insight.type === "info"
                                    ? "text-sky-700 dark:text-sky-400"
                                    : "text-foreground"
                            }`}>
                              {insight.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {insight.description}
                            </p>
                            
                            {insight.actionText && insight.actionLink && (
                              <div className="mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`text-xs ${
                                    insight.type === "success" 
                                      ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-200" 
                                      : insight.type === "warning" 
                                        ? "bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200"
                                        : insight.type === "info"
                                          ? "bg-sky-100 hover:bg-sky-200 text-sky-700 border-sky-200"
                                          : "bg-secondary"
                                  }`}
                                  asChild
                                >
                                  <a href={insight.actionLink}>
                                    {insight.actionText}
                                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 text-muted-foreground"
                >
                  No insights available in this category
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      )}

      {insights.length === 0 && !loading && (
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center">
            <Lightbulb className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No insights available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start logging your meals to receive personalized nutrition insights.
            </p>
            <Button className="mt-4" asChild>
              <a href="/log-food/manual">
                Log your first meal
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 