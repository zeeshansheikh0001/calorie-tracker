
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
import { PlusCircle, Save, Utensils, Flame, Drumstick, Droplets, Wheat, ChevronLeft, Sparkles, AlertCircle, Loader2, Heart, Info, Brain, UtensilsCross, Leaf, Activity, ShieldCheck } from "lucide-react";
import type { FoodEntry } from "@/types";
import { analyzeFoodText, type AnalyzeFoodTextInput, type AnalyzeFoodTextOutput } from "@/ai/flows/analyze-food-text-flow";

interface NutritionDisplayItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  className?: string;
}

const NutritionDisplayItem: FC<NutritionDisplayItemProps> = ({ icon: Icon, label, value, unit, color = "text-foreground", className }) => (
  <div className={`flex items-center space-x-2 p-2.5 rounded-lg bg-background/70 shadow-sm ${className}`}>
    <div className={`p-1.5 rounded-md ${color} bg-opacity-10`}>
      <Icon className={`h-5 w-5 flex-shrink-0`} />
    </div>
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`font-semibold text-sm ${color}`}>{value}{unit && <span className="text-xs"> {unit}</span>}</p>
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
        description: "Nutritional details and benefits have been estimated. Review and log if correct.",
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
      name: foodName || "Unnamed Food",
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
    setFoodName(""); 
    setIsSubmittingLog(false);
  };

  const renderTextSection = (title: string, content: string | undefined, icon: React.ElementType) => {
    if (!content) return null;
    const IconComponent = icon;
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
          <IconComponent className="mr-2 h-5 w-5 text-primary/80" />
          {title}
        </h3>
        <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-md shadow-sm whitespace-pre-line">
          {content}
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 group text-sm">
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
      <Card className="max-w-2xl mx-auto shadow-xl animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Utensils className="mr-2 h-6 w-6 text-primary" />
            Log Food Manually (AI Assisted)
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
                placeholder="e.g., 200g grilled salmon with asparagus and quinoa"
                className="mt-1"
                required
              />
               <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAiEstimate} 
                disabled={isAiEstimating || !foodName.trim()}
                className="mt-3 w-full sm:w-auto"
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
              <div className="mt-6 space-y-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">Estimated Nutritional Information</h3>
                  <p className="text-xs text-muted-foreground flex items-center mb-3">
                      <Info className="mr-1.5 h-3.5 w-3.5" />
                      {estimatedNutrition.estimatedQuantityNote}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border rounded-lg bg-card shadow-sm">
                    <NutritionDisplayItem icon={Flame} label="Calories" value={estimatedNutrition.calorieEstimate.toFixed(0)} unit="kcal" color="text-red-500" />
                    <NutritionDisplayItem icon={Drumstick} label="Protein" value={estimatedNutrition.proteinEstimate.toFixed(1)} unit="g" color="text-sky-500" />
                    <NutritionDisplayItem icon={Droplets} label="Fat" value={estimatedNutrition.fatEstimate.toFixed(1)} unit="g" color="text-amber-500" />
                    <NutritionDisplayItem icon={Wheat} label="Carbs" value={estimatedNutrition.carbEstimate.toFixed(1)} unit="g" color="text-emerald-500" />
                  </div>
                </div>
                
                { (estimatedNutrition.saturatedFatEstimate !== undefined && estimatedNutrition.saturatedFatEstimate > 0) ||
                  (estimatedNutrition.fiberEstimate !== undefined && estimatedNutrition.fiberEstimate > 0) ||
                  (estimatedNutrition.sugarEstimate !== undefined && estimatedNutrition.sugarEstimate > 0) ||
                  (estimatedNutrition.cholesterolEstimate !== undefined && estimatedNutrition.cholesterolEstimate > 0) ||
                  (estimatedNutrition.sodiumEstimate !== undefined && estimatedNutrition.sodiumEstimate > 0) ? (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">Detailed Nutritional Breakdown</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border rounded-lg bg-card shadow-sm">
                      {estimatedNutrition.saturatedFatEstimate !== undefined && estimatedNutrition.saturatedFatEstimate > 0 && <NutritionDisplayItem icon={Droplets} label="Saturated Fat" value={estimatedNutrition.saturatedFatEstimate.toFixed(1)} unit="g" color="text-orange-400" />}
                      {estimatedNutrition.fiberEstimate !== undefined && estimatedNutrition.fiberEstimate > 0 &&<NutritionDisplayItem icon={Leaf} label="Dietary Fiber" value={estimatedNutrition.fiberEstimate.toFixed(1)} unit="g" color="text-lime-600" />}
                      {estimatedNutrition.sugarEstimate !== undefined && estimatedNutrition.sugarEstimate > 0 && <NutritionDisplayItem icon={Activity} label="Sugars" value={estimatedNutrition.sugarEstimate.toFixed(1)} unit="g" color="text-fuchsia-500" />}
                      {estimatedNutrition.cholesterolEstimate !== undefined && estimatedNutrition.cholesterolEstimate > 0 && <NutritionDisplayItem icon={Heart} label="Cholesterol" value={estimatedNutrition.cholesterolEstimate.toFixed(0)} unit="mg" color="text-purple-500" />}
                      {estimatedNutrition.sodiumEstimate !== undefined && estimatedNutrition.sodiumEstimate > 0 && <NutritionDisplayItem icon={UtensilsCross} label="Sodium" value={estimatedNutrition.sodiumEstimate.toFixed(0)} unit="mg" color="text-indigo-500" />}
                    </div>
                  </div>
                ) : null}
                
                {renderTextSection("How Ingredients Influence Nutrition", estimatedNutrition.commonIngredientsInfluence, Brain)}
                
                {estimatedNutrition.healthBenefits && estimatedNutrition.healthBenefits.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
                      <ShieldCheck className="mr-2 h-5 w-5 text-primary/80" />
                      Potential Health Benefits
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-md shadow-sm">
                      {estimatedNutrition.healthBenefits.map((benefit, index) => (
                        <li key={index}>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {renderTextSection("Tips for a Healthier Version", estimatedNutrition.healthierTips, Leaf)}
                {renderTextSection("Estimation Disclaimer", estimatedNutrition.estimationDisclaimer, Info)}

                <CardFooter className="px-0 pt-4 border-t">
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
