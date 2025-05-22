
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Camera,
  UploadCloud,
  FilePenLine,
  CalendarDays,
  Flame,
  Wheat,
  Drumstick,
  Droplets,
  PlusCircle,
  Lightbulb,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FoodEntry as LoggedFoodEntry } from "@/types"; // Renamed to avoid conflict with Card component
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals";
import { format } from "date-fns";

interface MealCardProps {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const MealCard: React.FC<MealCardProps> = ({ name, calories, protein, fat, carbs }) => (
  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
    <CardContent className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-foreground flex-1 mr-2 truncate" title={name}>{name}</h3>
        <div className="flex items-center font-bold text-lg" style={{color: 'hsl(var(--text-kcal-raw))'}}>
          <Flame className="h-5 w-5 mr-1.5" />
          {Math.round(calories)}
          <span className="text-xs font-normal ml-1 text-muted-foreground">kcal</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
          <span className="font-medium text-sm" style={{color: 'hsl(var(--text-protein-raw))'}}>{Math.round(protein)}g</span>
          <span>Protein</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
          <span className="font-medium text-sm" style={{color: 'hsl(var(--text-fat-raw))'}}>{Math.round(fat)}g</span>
          <span>Fat</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
          <span className="font-medium text-sm" style={{color: 'hsl(var(--text-carbs-raw))'}}>{Math.round(carbs)}g</span>
          <span>Carbs</span>
        </div>
      </div>
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
 <Card className="shadow-md hover:shadow-lg transition-shadow flex-1 min-w-[150px]">
    <CardContent className="p-4 flex items-center space-x-3">
      <div className={`p-3 rounded-lg`} style={{ backgroundColor: `hsla(${iconColor}, 0.1)`}}>
         <Icon className="h-6 w-6" style={{ color: `hsl(${iconColor})` }}/>
      </div>
      <div className="flex flex-col">
        <p className="text-2xl font-bold" style={{ color: `hsl(${iconColor})` }}>{value}</p>
        <p className="text-sm text-muted-foreground -mt-1">{label}</p>
      </div>
    </CardContent>
  </Card>
);


export default function DashboardPage() {
  const { dailyLog, foodEntries, isLoading: isLoadingLog } = useDailyLog();
  const { goals, isLoading: isLoadingGoals } = useGoals(); // Keep isLoadingGoals if used elsewhere or for future use
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(format(new Date(), "MMM d"));
  }, []);

  const todayCalories = dailyLog?.calories ?? 0;
  const todayCarbs = dailyLog?.carbs ?? 0;
  const todayProtein = dailyLog?.protein ?? 0;
  const todayFat = dailyLog?.fat ?? 0;

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
       <div className="grid grid-cols-3 gap-3">
        {(isLoadingLog || isLoadingGoals) ? ( 
            <>
                {[1,2,3].map(i => (
                  <Card key={`skel-action-${i}`} className="shadow-lg h-full">
                    <CardContent className="p-4 flex flex-row items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-12" />
                    </CardContent>
                  </Card>
                ))}
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
         <Link href="/log-food/manual" passHref> 
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
        <div className="grid grid-cols-2 gap-4">
         {(isLoadingLog || isLoadingGoals) ? (
            <>
              <SummaryCard icon={Flame} value="..." label="kcal" iconColor="var(--text-kcal-raw)" />
              <SummaryCard icon={Wheat} value="..." label="Carbs (g)" iconColor="var(--text-carbs-raw)" />
              <SummaryCard icon={Drumstick} value="..." label="Protein (g)" iconColor="var(--text-protein-raw)" />
              <SummaryCard icon={Droplets} value="..." label="Fat (g)" iconColor="var(--text-fat-raw)" />
            </>
          ) : (
            <>
              <SummaryCard icon={Flame} value={Math.round(todayCalories).toString()} label="kcal" iconColor="var(--text-kcal-raw)" />
              <SummaryCard icon={Wheat} value={Math.round(todayCarbs).toString()} label="Carbs (g)" iconColor="var(--text-carbs-raw)" />
              <SummaryCard icon={Drumstick} value={Math.round(todayProtein).toString()} label="Protein (g)" iconColor="var(--text-protein-raw)" />
              <SummaryCard icon={Droplets} value={Math.round(todayFat).toString()} label="Fat (g)" iconColor="var(--text-fat-raw)" />
            </>
          )}
        </div>
      </div>

      {/* Meal Log */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Meal Log</h2>
          <Link href="/log-food/photo" passHref>
            <Button variant="ghost" size="sm" className="text-sm" style={{ color: 'hsl(var(--add-button-bg))' }}>
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Meal
            </Button>
          </Link>
        </div>
        {isLoadingLog ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map(i => ( 
              <Card key={`skel-meal-${i}`} className="shadow-lg">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4" /> {/* Name */}
                    <Skeleton className="h-6 w-1/4" /> {/* Calories */}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-12 w-full rounded-md" /> {/* Protein */}
                    <Skeleton className="h-12 w-full rounded-md" /> {/* Fat */}
                    <Skeleton className="h-12 w-full rounded-md" /> {/* Carbs */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : foodEntries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {foodEntries.map((entry: LoggedFoodEntry) => ( // Ensure type is used here
              <MealCard
                key={entry.id}
                id={entry.id}
                name={entry.name}
                calories={entry.calories}
                protein={entry.protein}
                fat={entry.fat}
                carbs={entry.carbs}
              />
            ))}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No meals logged for today yet. Use the "Add Meal" button to log your first meal!
            </CardContent>
          </Card>
        )}
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
}

    