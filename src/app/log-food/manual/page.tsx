
"use client";

import { useState, type FormEvent, type FC } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDailyLog } from "@/hooks/use-daily-log";
import { PlusCircle, Save, Utensils, Flame, Drumstick, Droplets, Wheat, ChevronLeft, Sparkles, AlertCircle, Loader2, Heart } from "lucide-react";
import type { FoodEntry } from "@/types";
import { analyzeFoodText, type AnalyzeFoodTextInput, type AnalyzeFoodTextOutput } from "@/ai/flows/analyze-food-text-flow";

interface NutritionDisplayItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}

const NutritionDisplayItem: FC<NutritionDisplayItemProps> = ({ icon: Icon, label, value, color = "text-foreground" }) => (
  <div className={`flex items-center space-x-2 p-2.5 rounded-lg bg-background/70 shadow-sm`}>
    <div className={`p-1.5 rounded-md ${color} bg-opacity-10`}> {/* Icon background tint */}
      <Icon className={`h-5 w-5 flex-shrink-0`} />
    </div>
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`font-semibold text-sm ${color}`}>{value}</p>
    </div>
  </div>
);

export default function ManualLogPage() {
  const [foodName, setFoodName] = useState("");
  const [estimatedNutrition, setEstimatedNutrition] = useState<AnalyzeFoodTextOutput | null>(null);
  
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [isAiEstimating, setIsAiEstimating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { addFoodEntry, currentSelectedDate } = useDailyLog();
  const { toast } = useToast();
  const router = useRouter();

  const handleAiEstimate = async () => {
    if (!foodName.trim()) {
      setAiError("Please enter a food description first.");
      setEstimatedNutrition(null);
      return;
    }
    setIsAiEstimating(true);
    setAiError(null);
    setEstimatedNutrition(null); 
    try {
      const input: AnalyzeFoodTextInput = { description: foodName };
      const result: AnalyzeFoodTextOutput = await analyzeFoodText(input);
      
      setEstimatedNutrition(result);

      toast({
        title: "AI Estimation Complete",
        description: "Nutritional values and benefits have been estimated. Review and log if correct.",
        action: <Sparkles className="text-yellow-500" />,
      });

    } catch (err) {
      console.error("AI estimation error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI estimation.";
      setAiError(errorMessage);
      setEstimatedNutrition(null);
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
    if (!estimatedNutrition) {
      toast({
        title: "Cannot Log",
        description: "Please estimate nutritional information with AI first.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmittingLog(true);

    const foodEntryData: Omit<FoodEntry, "id" | "timestamp"> = {
      name: foodName || "Unnamed Food", // Use the user-provided name
      calories: estimatedNutrition.calorieEstimate,
      protein: estimatedNutrition.proteinEstimate,
      fat: estimatedNutrition.fatEstimate,
      carbs: estimatedNutrition.carbEstimate,
    };

    addFoodEntry(foodEntryData);

    toast({
      title: "Meal Logged!",
      description: `${foodEntryData.name} (${foodEntryData.calories.toFixed(0)} kcal) has been added to your log.`,
      action: <PlusCircle className="text-green-500" />,
    });

    setEstimatedNutrition(null); 
    // setFoodName(""); // Optional: clear food name after logging
    setIsSubmittingLog(false);
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
            Describe your meal for AI-powered estimates. Log for: {currentSelectedDate ? currentSelectedDate.toLocaleDateString() : 'No date selected'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="foodName" className="text-sm font-medium">Food Item Name / Description</Label>
              <Input
                id="foodName"
                value={foodName}
                onChange={(e) => {
                  setFoodName(e.target.value);
                  if(estimatedNutrition) setEstimatedNutrition(null); 
                  setAiError(null); 
                }}
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

            {estimatedNutrition && !isAiEstimating && (
              <div className="mt-6 space-y-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
                <h3 className="text-lg font-semibold text-primary">Estimated Nutritional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border rounded-lg bg-card shadow-sm">
                  <NutritionDisplayItem icon={Flame} label="Calories" value={`${estimatedNutrition.calorieEstimate.toFixed(0)} kcal`} color="text-red-500" />
                  <NutritionDisplayItem icon={Drumstick} label="Protein" value={`${estimatedNutrition.proteinEstimate.toFixed(1)} g`} color="text-sky-500" />
                  <NutritionDisplayItem icon={Droplets} label="Fat" value={`${estimatedNutrition.fatEstimate.toFixed(1)} g`} color="text-amber-500" />
                  <NutritionDisplayItem icon={Wheat} label="Carbs" value={`${estimatedNutrition.carbEstimate.toFixed(1)} g`} color="text-emerald-500" />
                </div>

                {estimatedNutrition.healthBenefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mt-4 mb-2 flex items-center">
                      <Heart className="mr-2 h-5 w-5 text-pink-500" />
                      Potential Health Benefits
                    </h3>
                    <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-md shadow-sm">
                      {estimatedNutrition.healthBenefits}
                    </p>
                  </div>
                )}
                <CardFooter className="px-0 pt-4">
                  <Button type="submit" disabled={isSubmittingLog || isAiEstimating || !foodName.trim() || !estimatedNutrition} className="w-full sm:w-auto">
                    {isSubmittingLog ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Add to Log
                  </Button>
                </CardFooter>
              </div>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
