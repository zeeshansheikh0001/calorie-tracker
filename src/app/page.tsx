
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
  Loader2,
  Trash2, // Added Trash2
} from "lucide-react";
import { useEffect, useState, type FC } from "react";
import type { FoodEntry as LoggedFoodEntry } from "@/types";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals";
import { format } from "date-fns";
import Image from "next/image";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label } from 'recharts';

interface MealCardProps {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  onDelete: (id: string) => void; // Added onDelete prop
}

const MealCard: React.FC<MealCardProps> = ({ id, name, calories, protein, fat, carbs, onDelete }) => (
  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden rounded-xl relative">
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive z-10"
      onClick={() => onDelete(id)}
      aria-label="Delete meal"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
    <CardContent className="p-4 space-y-3">
      <div className="flex justify-between items-start mr-8"> {/* Added mr-8 for spacing from delete button */}
        <h3 className="text-lg font-semibold text-foreground flex-1 truncate" title={name}>{name}</h3>
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
  iconColorVariable: string; 
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, value, label, iconColorVariable }) => (
 <Card className="p-3 shadow-md hover:shadow-lg transition-shadow text-center bg-card rounded-xl">
    <Icon className="h-6 w-6 mx-auto mb-1" style={{ color: `hsl(${iconColorVariable})` }} />
    <p className="text-lg font-bold" style={{ color: `hsl(${iconColorVariable})` }}>{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </Card>
);

interface DonutCenterLabelProps {
  viewBox?: { cx?: number; cy?: number };
  percentage: number;
}

const DonutCenterLabel: FC<DonutCenterLabelProps> = ({ viewBox, percentage }) => {
  if (!viewBox || typeof viewBox.cx !== 'number' || typeof viewBox.cy !== 'number') {
    return null;
  }
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} fill="hsl(var(--primary-foreground))" textAnchor="middle" dominantBaseline="central">
      <tspan fontSize="2rem" fontWeight="bold">{`${percentage}%`}</tspan>
    </text>
  );
};


export default function DashboardPage() {
  const { dailyLog, foodEntries, isLoading: isLoadingLog, deleteFoodEntry } = useDailyLog(); // Added deleteFoodEntry
  const { goals, isLoading: isLoadingGoals } = useGoals();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(format(new Date(), "MMM d"));
  }, []);

  const consumedCalories = dailyLog?.calories ?? 0;
  const goalCalories = goals?.calories ?? 0;
  const percentAchieved = goalCalories > 0 ? Math.round((consumedCalories / goalCalories) * 100) : 0;
  
  const chartData = [];
  if (consumedCalories > 0 && goalCalories > 0) {
     chartData.push({ name: 'Consumed', value: consumedCalories });
  } else if (consumedCalories > 0 && goalCalories === 0) { 
     chartData.push({ name: 'Consumed', value: consumedCalories });
  }


  if (goalCalories > consumedCalories && goalCalories > 0) {
    chartData.push({ name: 'Remaining', value: goalCalories - consumedCalories });
  } else if (goalCalories === 0 && consumedCalories === 0) { 
    chartData.push({ name: 'Empty', value: 1 }); 
  }


  const COLORS = {
    Consumed: 'hsl(var(--accent))', 
    Remaining: 'hsla(var(--primary-foreground-hsl-raw), 0.3)', 
    Empty: 'hsla(var(--primary-foreground-hsl-raw), 0.3)',
  };


  const todayCalories = dailyLog?.calories ?? 0;
  const todayCarbs = dailyLog?.carbs ?? 0;
  const todayProtein = dailyLog?.protein ?? 0;
  const todayFat = dailyLog?.fat ?? 0;

  const isDataLoading = isLoadingLog || isLoadingGoals;

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

      {/* Smart Calorie Tracker Card with Donut Chart */}
       <Card 
          className="shadow-xl text-primary-foreground p-0 rounded-2xl overflow-hidden relative"
        >
          {isDataLoading ? (
            <div 
              className="min-h-[220px] sm:min-h-[240px] flex flex-col justify-center items-center" 
              style={{
                backgroundImage: `url("/your-image-in-public-folder.jpg")`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
              }}
              data-ai-hint="health fitness abstract"
            >
              <div className="absolute inset-0 bg-black/30 z-0"></div> {/* Dark overlay */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                <Skeleton className="h-6 w-3/5 mb-1 bg-white/40" />
                <Skeleton className="h-4 w-2/5 mb-3 bg-white/40" />
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-white/60 animate-spin" />
                </div>
              </div>
            </div>
          ) : (
            <div 
              style={{ 
                backgroundImage: `url("/your-image-in-public-folder.jpg")`,
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative', 
              }}
              data-ai-hint="health fitness abstract"
              className="min-h-[220px] sm:min-h-[240px]"
            >
              <div className="absolute inset-0 bg-black/30 z-0"></div> {/* Dark overlay for text legibility */}
              <div className="relative z-10 flex flex-col h-full"> 
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>Daily Calories</span>
                    <span className="text-sm opacity-90">{Math.round(consumedCalories)} / {Math.round(goalCalories)} kcal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow h-[150px] sm:h-[170px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="90%"
                        dataKey="value"
                        stroke="none"
                        paddingAngle={chartData.length > 1 && chartData[0].value > 0 && chartData.some(d => d.name === 'Remaining' && d.value > 0) ? 5 : 0}
                        isAnimationActive={true}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Empty} />
                        ))}
                        {goalCalories > 0 && <Label content={<DonutCenterLabel percentage={percentAchieved} />} position="center" />}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${Math.round(value as number)} kcal`, ""]}
                        wrapperStyle={{zIndex: 1000}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </div>
            </div>
          )}
        </Card>


      {/* Action Buttons */}
       <div className="grid grid-cols-3 gap-3">
        {isDataLoading ? ( 
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
        <div className="flex justify-between items-center mb-2"> 
          <h2 className="text-xl font-semibold">Today's Summary</h2>
          <div className="flex items-center gap-1 text-sm text-primary">
            <CalendarDays className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
         {isDataLoading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                 <Card key={`skel-summary-${i}`} className="p-3 shadow-md rounded-xl text-center">
                    <Skeleton className="h-6 w-6 mx-auto mb-1 rounded-full" />
                    <Skeleton className="h-5 w-10 mx-auto mb-1" />
                    <Skeleton className="h-3 w-8 mx-auto" />
                  </Card>
              ))}
            </>
          ) : (
            <>
              <SummaryCard icon={Flame} value={Math.round(todayCalories).toString()} label="kcal" iconColorVariable="var(--text-kcal-raw)" />
              <SummaryCard icon={Wheat} value={`${Math.round(todayCarbs)}g`} label="Carbs" iconColorVariable="var(--text-carbs-raw)" />
              <SummaryCard icon={Drumstick} value={`${Math.round(todayProtein)}g`} label="Protein" iconColorVariable="var(--text-protein-raw)" />
              <SummaryCard icon={Droplets} value={`${Math.round(todayFat)}g`} label="Fat" iconColorVariable="var(--text-fat-raw)" />
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
              <Card key={`skel-meal-${i}`} className="shadow-lg rounded-xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4" /> 
                    <Skeleton className="h-6 w-1/4" /> 
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-12 w-full rounded-md" /> 
                    <Skeleton className="h-12 w-full rounded-md" /> 
                    <Skeleton className="h-12 w-full rounded-md" /> 
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : foodEntries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {foodEntries.map((entry: LoggedFoodEntry) => (
              <MealCard
                key={entry.id}
                id={entry.id}
                name={entry.name}
                calories={entry.calories}
                protein={entry.protein}
                fat={entry.fat}
                carbs={entry.carbs}
                onDelete={deleteFoodEntry} // Pass delete function
              />
            ))}
          </div>
        ) : (
          <Card className="shadow-lg rounded-xl">
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
