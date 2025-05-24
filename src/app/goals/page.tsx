
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Target, Save, CheckCircle, Flame, Drumstick, Droplets, Wheat, Loader2 } from "lucide-react";
import type { Goal } from "@/types";
import { useGoals } from "@/hooks/use-goals";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoalsPage() {
  const { goals: initialGoals, updateGoals, isLoading: isLoadingGoalsHook } = useGoals();
  const [goals, setGoalsState] = useState<Goal>(initialGoals); // Local form state
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Sync local form state when initialGoals from hook load/change
    if (!isLoadingGoalsHook) {
      setGoalsState(initialGoals);
    }
  }, [initialGoals, isLoadingGoalsHook]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGoalsState((prevGoals) => ({
      ...prevGoals,
      [name]: value === "" ? 0 : parseInt(value, 10) || 0,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateGoals(goals); // This is now an async function
      toast({
        title: "Goals Updated!",
        description: "Your nutritional goals have been saved successfully.",
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error("Failed to update goals:", error);
      toast({
        title: "Update Failed",
        description: "Could not save your goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingGoalsHook && !initialGoals.calories) { // Show skeleton if loading and no initial data yet
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-xl mx-auto shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i}>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-xl mx-auto shadow-xl animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Target className="mr-2 h-6 w-6 text-primary" />
            Set Your Nutritional Goals
          </CardTitle>
          <CardDescription>
            Define your daily targets for calories, protein, fat, and carbohydrates.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="calories" className="text-sm font-medium flex items-center">
                  <Flame className="mr-2 h-4 w-4 text-red-500" /> Daily Calories (kcal)
                </Label>
                <Input
                  id="calories"
                  name="calories"
                  type="number"
                  value={goals.calories}
                  onChange={handleInputChange}
                  className="mt-1"
                  min="0"
                  placeholder="e.g., 2000"
                />
              </div>
              <div>
                <Label htmlFor="protein" className="text-sm font-medium flex items-center">
                  <Drumstick className="mr-2 h-4 w-4 text-sky-500" /> Daily Protein (g)
                </Label>
                <Input
                  id="protein"
                  name="protein"
                  type="number"
                  value={goals.protein}
                  onChange={handleInputChange}
                  className="mt-1"
                  min="0"
                  placeholder="e.g., 150"
                />
              </div>
              <div>
                <Label htmlFor="fat" className="text-sm font-medium flex items-center">
                  <Droplets className="mr-2 h-4 w-4 text-amber-500" /> Daily Fat (g)
                </Label>
                <Input
                  id="fat"
                  name="fat"
                  type="number"
                  value={goals.fat}
                  onChange={handleInputChange}
                  className="mt-1"
                  min="0"
                  placeholder="e.g., 70"
                />
              </div>
              <div>
                <Label htmlFor="carbs" className="text-sm font-medium flex items-center">
                  <Wheat className="mr-2 h-4 w-4 text-emerald-500" /> Daily Carbohydrates (g)
                </Label>
                <Input
                  id="carbs"
                  name="carbs"
                  type="number"
                  value={goals.carbs}
                  onChange={handleInputChange}
                  className="mt-1"
                  min="0"
                  placeholder="e.g., 250"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isSaving || isLoadingGoalsHook} 
              className="w-full sm:w-auto transition-transform hover:scale-105 active:scale-95"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Goals
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
