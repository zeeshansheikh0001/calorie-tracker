
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDailyLog } from "@/hooks/use-daily-log";
import { PlusCircle, Save, Utensils, Flame, Drumstick, Droplets, Wheat, ChevronLeft, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import type { FoodEntry } from "@/types";
import { analyzeFoodText, type AnalyzeFoodTextInput, type AnalyzeFoodTextOutput } from "@/ai/flows/analyze-food-text-flow";

export default function ManualLogPage() {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [isAiEstimating, setIsAiEstimating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { addFoodEntry, currentSelectedDate } = useDailyLog();
  const { toast } = useToast();
  const router = useRouter();

  const handleAiEstimate = async () => {
    if (!foodName.trim()) {
      setAiError("Please enter a food description first.");
      return;
    }
    setIsAiEstimating(true);
    setAiError(null);
    try {
      const input: AnalyzeFoodTextInput = { description: foodName };
      const result: AnalyzeFoodTextOutput = await analyzeFoodText(input);
      
      setCalories(result.calorieEstimate.toString());
      setProtein(result.proteinEstimate.toString());
      setFat(result.fatEstimate.toString());
      setCarbs(result.carbEstimate.toString());

      toast({
        title: "AI Estimation Complete",
        description: "Nutritional values have been estimated. Review and adjust if needed.",
        action: <Sparkles className="text-yellow-500" />,
      });

    } catch (err) {
      console.error("AI estimation error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI estimation.";
      setAiError(errorMessage);
      toast({
        title: "AI Estimation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAiEstimating(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingLog(true);

    const foodEntryData: Omit<FoodEntry, "id" | "timestamp"> = {
      name: foodName || "Unnamed Food",
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      fat: parseFloat(fat) || 0,
      carbs: parseFloat(carbs) || 0,
    };

    addFoodEntry(foodEntryData);

    toast({
      title: "Meal Logged!",
      description: `${foodEntryData.name} (${foodEntryData.calories} kcal) has been added to your log.`,
      action: <PlusCircle className="text-green-500" />,
    });

    // Reset form partially, keep food name if user wants to log variations
    // setFoodName(""); 
    setCalories("");
    setProtein("");
    setFat("");
    setCarbs("");
    setIsSubmittingLog(false);
    // Optionally navigate back or allow multiple entries
    // router.push("/"); 
  };

  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 group text-sm">
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
      <Card className="max-w-lg mx-auto shadow-xl animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Utensils className="mr-2 h-6 w-6 text-primary" />
            Log Food Manually
          </CardTitle>
          <CardDescription>
            Describe your meal to get AI-powered nutritional estimates, or enter values directly. Log for: {currentSelectedDate ? currentSelectedDate.toLocaleDateString() : 'No date selected'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="foodName" className="text-sm font-medium">Food Item Name / Description</Label>
              <Input
                id="foodName"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g., Chicken salad, or 2 slices of pizza"
                className="mt-1"
                required
              />
               <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAiEstimate} 
                disabled={isAiEstimating || !foodName.trim()}
                className="mt-2 w-full sm:w-auto"
              >
                {isAiEstimating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Estimate with AI
              </Button>
            </div>

            {aiError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>AI Estimation Error</AlertTitle>
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="calories" className="text-sm font-medium flex items-center">
                   <Flame className="mr-2 h-4 w-4 text-red-500" /> Calories (kcal)
                </Label>
                <Input
                  id="calories"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="e.g., 350"
                  className="mt-1"
                  min="0"
                  step="any"
                  required
                />
              </div>
              <div>
                <Label htmlFor="protein" className="text-sm font-medium flex items-center">
                  <Drumstick className="mr-2 h-4 w-4 text-sky-500" /> Protein (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="e.g., 30"
                  className="mt-1"
                  min="0"
                  step="any"
                />
              </div>
              <div>
                <Label htmlFor="fat" className="text-sm font-medium flex items-center">
                   <Droplets className="mr-2 h-4 w-4 text-amber-500" /> Fat (g)
                </Label>
                <Input
                  id="fat"
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="e.g., 15"
                  className="mt-1"
                  min="0"
                  step="any"
                />
              </div>
              <div>
                <Label htmlFor="carbs" className="text-sm font-medium flex items-center">
                  <Wheat className="mr-2 h-4 w-4 text-emerald-500" /> Carbohydrates (g)
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="e.g., 25"
                  className="mt-1"
                  min="0"
                  step="any"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmittingLog || isAiEstimating} className="w-full sm:w-auto">
              {isSubmittingLog ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Add to Log
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
