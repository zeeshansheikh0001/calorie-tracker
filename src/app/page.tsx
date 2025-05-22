
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Camera,
  UploadCloud,
  FilePenLine,
  CalendarDays,
  Flame,
  Wheat,
  Drumstick,
  CakeSlice, // Using CakeSlice for Fat icon as per image
  PlusCircle,
  Coffee,
  Salad, // Using Salad for Lunch
  Soup,   // Using Soup for Dinner
  Apple,
  Lightbulb,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Goal } from "@/types";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals";
import { format } from "date-fns";

interface MealCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  calories: string;
  iconColor?: string;
  bgColor?: string;
}

const MealCard: React.FC<MealCardProps> = ({ icon: Icon, title, description, calories, iconColor = "text-primary", bgColor="bg-secondary/30" }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow">
    <CardContent className="pt-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <h3 className="text-md font-semibold">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{description}</p>
      <p className="text-sm font-medium" style={{color: 'hsl(var(--primary))'}}>{calories}</p>
    </CardContent>
  </Card>
);

interface SummaryCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, value, label, iconColor }) => (
 <Card className="shadow-md hover:shadow-lg transition-shadow flex-1">
    <CardContent className="pt-4 pb-3 text-center">
      <div className={`p-2 rounded-full inline-block mb-1`} style={{ backgroundColor: `hsla(${iconColor}, 0.2)`}}> {/* Updated for hsla */}
         <Icon className="h-5 w-5" style={{ color: `hsl(${iconColor})` }}/>
      </div>
      <p className="text-lg font-bold" style={{ color: `hsl(${iconColor})` }}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);


export default function DashboardPage() {
  const { dailyLog, isLoading: isLoadingLog } = useDailyLog();
  const { goals, isLoading: isLoadingGoals } = useGoals();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(format(new Date(), "MMM d"));
  }, []);

  const todayCalories = dailyLog?.calories ?? 0;
  const todayCarbs = dailyLog?.carbs ?? 0;
  const todayProtein = dailyLog?.protein ?? 0;
  const todayFat = dailyLog?.fat ?? 0;

  // Placeholder meal data
  const meals = [
    { icon: Coffee, title: "Breakfast", description: "Oatmeal, Banana", calories: "320 kcal", iconColor: "text-yellow-600", bgColor: "bg-yellow-100" },
    { icon: Salad, title: "Lunch", description: "Grilled Chicken, Rice", calories: "620 kcal", iconColor: "text-purple-600", bgColor: "bg-purple-100" },
    { icon: Soup, title: "Dinner", description: "Salmon, Veggies", calories: "310 kcal", iconColor: "text-green-600", bgColor: "bg-green-100" },
    { icon: Apple, title: "Snacks", description: "Apple, Yogurt", calories: "150 kcal", iconColor: "text-red-600", bgColor: "bg-red-100" },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://placehold.co/100x100.png" alt="Alex" data-ai-hint="user avatar" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-semibold">Hi, Alex</h1>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Smart Calorie Tracker Card */}
      <Card 
        className="shadow-xl text-primary-foreground p-6 rounded-2xl"
        style={{ background: 'linear-gradient(100deg, rgb(var(--gradient-start-rgb)) 0%, rgb(var(--gradient-end-rgb)) 100%)' }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Smart Calorie Tracker</h2>
            <p className="text-sm opacity-90">Eat smarter. Track easier.</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <Utensils className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4">
        {(isLoadingLog || isLoadingGoals) ? (
            <>
                <Card className="shadow-lg"><CardContent className="p-4 flex flex-row items-center gap-3"><div className="animate-pulse bg-muted-foreground/20 h-10 w-full rounded-md"></div></CardContent></Card>
                <Card className="shadow-lg"><CardContent className="p-4 flex flex-row items-center gap-3"><div className="animate-pulse bg-muted-foreground/20 h-10 w-full rounded-md"></div></CardContent></Card>
                <Card className="shadow-lg"><CardContent className="p-4 flex flex-row items-center gap-3"><div className="animate-pulse bg-muted-foreground/20 h-10 w-full rounded-md"></div></CardContent></Card>
            </>
        ) : (
        <>
        <Link href="/log-food/photo" passHref>
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-row items-center gap-3">
              <div className="p-2 rounded-full" style={{backgroundColor: 'hsla(var(--primary-hsl), 0.1)'}}>
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Snap</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/log-food/photo" passHref>
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-row items-center gap-3">
               <div className="p-2 rounded-full" style={{backgroundColor: 'hsla(145, 63%, 42%, 0.1)'}}>
                <UploadCloud className="h-6 w-6" style={{color: 'hsl(145, 58%, 40%)'}} />
              </div>
              <p className="text-sm font-medium">Upload</p>
            </CardContent>
          </Card>
        </Link>
         <Link href="/log-food/barcode" passHref> 
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-row items-center gap-3">
              <div className="p-2 rounded-full" style={{backgroundColor: 'hsla(340, 82%, 66%, 0.1)'}}>
                <FilePenLine className="h-6 w-6" style={{color: 'hsl(340, 72%, 62%)'}} />
              </div>
              <p className="text-sm font-medium">Manual</p>
            </CardContent>
          </Card>
        </Link>
        </>
        )}
      </div>

      {/* Today's Summary */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Today's Summary</h2>
          <div className="flex items-center gap-1 text-sm text-primary">
            <CalendarDays className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
         {(isLoadingLog || isLoadingGoals) ? (
            <>
              <SummaryCard icon={Flame} value="..." label="kcal" iconColor="var(--text-kcal-raw)" />
              <SummaryCard icon={Wheat} value="..." label="Carbs" iconColor="var(--text-carbs-raw)" />
              <SummaryCard icon={Drumstick} value="..." label="Protein" iconColor="var(--text-protein-raw)" />
              <SummaryCard icon={CakeSlice} value="..." label="Fat" iconColor="var(--text-fat-raw)" />
            </>
          ) : (
            <>
              <SummaryCard icon={Flame} value={`${todayCalories}`} label="kcal" iconColor="var(--text-kcal-raw)" />
              <SummaryCard icon={Wheat} value={`${todayCarbs}g`} label="Carbs" iconColor="var(--text-carbs-raw)" />
              <SummaryCard icon={Drumstick} value={`${todayProtein}g`} label="Protein" iconColor="var(--text-protein-raw)" />
              <SummaryCard icon={CakeSlice} value={`${todayFat}g`} label="Fat" iconColor="var(--text-fat-raw)" />
            </>
          )}
        </div>
      </div>

      {/* Meal Log */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Meal Log</h2>
          <Button variant="ghost" size="sm" className="text-sm" style={{ color: 'hsl(var(--add-button-bg))' }}>
            <PlusCircle className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meals.map((meal, index) => (
            <MealCard key={index} {...meal} />
          ))}
        </div>
      </div>

      {/* Smart Insights */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Smart Insights</h2>
        </div>
        <Card 
            className="shadow-lg p-5 rounded-xl"
            style={{ background: 'linear-gradient(100deg, hsl(180, 80%, 95%) 0%, hsl(200, 80%, 95%) 100%)' }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-green-700">You're <span className="font-bold">on track</span> today!</h3>
              <p className="text-xs text-muted-foreground">Keep up the balanced meals for better results.</p>
            </div>
            <TrendingUp className="h-7 w-7 text-green-600" />
          </div>
        </Card>
      </div>
    </div>
  );

    