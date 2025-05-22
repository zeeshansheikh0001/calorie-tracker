"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Camera, ScanLine, PlusCircle, Target } from "lucide-react";
import { useEffect, useState } from "react";
import type { Goal } from "@/types"; // Assuming types are defined

const mockDailyData = [
  { name: 'Mon', calories: 1800 },
  { name: 'Tue', calories: 2200 },
  { name: 'Wed', calories: 1950 },
  { name: 'Thu', calories: 2050 },
  { name: 'Fri', calories: 2300 },
  { name: 'Sat', calories: 2500 },
  { name: 'Sun', calories: 2100 },
];

const initialGoals: Goal = {
  calories: 2000,
  protein: 150,
  fat: 70,
  carbs: 250,
};

export default function DashboardPage() {
  const [todayCalories, setTodayCalories] = useState(0);
  const [goals, setGoals] = useState<Goal>(initialGoals);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    // In a real app, fetch today's calories and goals
    // For now, using mock data
    const loggedCalories = 1250; // Example logged calories
    setTodayCalories(loggedCalories);
    
    // Load goals from localStorage or set default
    const storedGoals = localStorage.getItem("userGoals");
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    } else {
      setGoals(initialGoals);
    }
  }, []);

  useEffect(() => {
    if (goals.calories > 0) {
      setProgressValue((todayCalories / goals.calories) * 100);
    }
  }, [todayCalories, goals.calories]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
          <p className="text-muted-foreground">Here's your nutritional overview for today.</p>
        </div>
        <Link href="/goals" passHref>
          <Button variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Set Your Goals
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Today's Calories</CardTitle>
            <CardDescription>You've consumed {todayCalories.toLocaleString()} of {goals.calories.toLocaleString()} kcal</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressValue} aria-label={`${progressValue.toFixed(0)}% of daily calorie goal`} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.max(0, goals.calories - todayCalories).toLocaleString()} kcal remaining
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Log Your Meal</CardTitle>
            <CardDescription>Add what you've eaten today.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/log-food/photo" passHref>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Camera className="mr-2 h-4 w-4" />
                Scan with Photo
              </Button>
            </Link>
            <Link href="/log-food/barcode" passHref>
              <Button variant="secondary" className="w-full">
                <ScanLine className="mr-2 h-4 w-4" />
                Scan Barcode
              </Button>
            </Link>
            {/* Placeholder for manual entry */}
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Manually
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Macronutrients</CardTitle>
            <CardDescription>Today's protein, fat, and carbs intake.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Protein</span>
                <span>{/* Actual protein */ 80}g / {goals.protein}g</span>
              </div>
              <Progress value={(80 / goals.protein) * 100} aria-label="Protein intake" className="h-2 bg-blue-500/20 [&>div]:bg-blue-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fat</span>
                <span>{/* Actual fat */ 40}g / {goals.fat}g</span>
              </div>
              <Progress value={(40 / goals.fat) * 100} aria-label="Fat intake" className="h-2 bg-yellow-500/20 [&>div]:bg-yellow-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Carbs</span>
                <span>{/* Actual carbs */ 150}g / {goals.carbs}g</span>
              </div>
              <Progress value={(150 / goals.carbs) * 100} aria-label="Carbs intake" className="h-2 bg-green-500/20 [&>div]:bg-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Weekly Calorie Trend</CardTitle>
          <CardDescription>Your calorie intake over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockDailyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "hsl(var(--primary))" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
