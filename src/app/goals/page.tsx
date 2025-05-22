"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Target, Save, CheckCircle } from "lucide-react";
import type { Goal } from "@/types";

const initialGoals: Goal = {
  calories: 2000,
  protein: 150,
  fat: 70,
  carbs: 250,
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal>(initialGoals);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedGoals = localStorage.getItem("userGoals");
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGoals((prevGoals) => ({
      ...prevGoals,
      [name]: value === "" ? 0 : parseInt(value, 10) || 0,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("userGoals", JSON.stringify(goals));
      toast({
        title: "Goals Updated!",
        description: "Your nutritional goals have been saved successfully.",
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-xl mx-auto shadow-xl">
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
                <Label htmlFor="calories" className="text-sm font-medium">Daily Calories (kcal)</Label>
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
                <Label htmlFor="protein" className="text-sm font-medium">Daily Protein (g)</Label>
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
                <Label htmlFor="fat" className="text-sm font-medium">Daily Fat (g)</Label>
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
                <Label htmlFor="carbs" className="text-sm font-medium">Daily Carbohydrates (g)</Label>
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
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Save className="mr-2 h-4 w-4 animate-pulse" />
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
