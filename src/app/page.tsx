
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
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
  BarChart2,
  ChevronDown,
  Trash2,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useState, type FC, useEffect, ReactNode } from "react";
import type { FoodEntry as LoggedFoodEntry, BlogPost } from "@/types";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals";
import { useUserProfile } from "@/hooks/use-user-profile";
import { format, isToday } from "date-fns";
import Image from "next/image";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label, type TooltipProps } from 'recharts';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import React from "react"; // Added React import for React.memo
import dynamic from "next/dynamic"; // Added dynamic import

// Dynamically import CalorieDonutChart
const CalorieDonutChart = dynamic(
  () => import('@/components/dashboard/calorie-donut-chart'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-36 h-36 md:w-32 md:h-32 flex justify-center items-center relative">
        <Skeleton className="w-full h-full rounded-full" />
        <Loader2 className="absolute h-8 w-8 animate-spin text-primary/50" />
      </div>
    )
  }
);


interface MealCardProps {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  onDelete: (id: string) => void;
}

const MealCard: React.FC<MealCardProps> = React.memo(({ id, name, calories, protein, fat, carbs, onDelete }) => (
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
    <CardContent className="p-4 space-y-3 mr-8">
      <div className="flex justify-between items-start">
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
));
MealCard.displayName = 'MealCard';


interface SummaryCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  iconColorVariable: string;
}

const SummaryCard: React.FC<SummaryCardProps> = React.memo(({ icon: Icon, value, label, iconColorVariable }) => (
  <Card className="p-3 shadow-md hover:shadow-lg transition-shadow bg-card rounded-xl text-center">
      <div className="p-2 rounded-lg inline-block mx-auto" style={{ backgroundColor: `hsla(${iconColorVariable}, 0.1)` }}>
        <Icon className="h-6 w-6" style={{ color: `hsl(${iconColorVariable})` }} />
      </div>
      <p className="text-lg font-bold mt-1" style={{ color: `hsl(${iconColorVariable})` }}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
  </Card>
));
SummaryCard.displayName = 'SummaryCard';


export const mockBlogData: BlogPost[] = [
  {
    id: "1",
    title: "The Surprising Benefits of Morning Workouts",
    excerpt: "Discover how starting your day with exercise can boost your metabolism and mood.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "morning workout",
    readMoreLink: "/blog/1",
  },
  {
    id: "2",
    title: "Understanding Macronutrients: Your Guide to Balanced Eating",
    excerpt: "Learn the roles of protein, carbs, and fats in your diet and how to balance them.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "healthy food",
    readMoreLink: "/blog/2",
  },
  {
    id: "3",
    title: "Mindful Eating: How to Enjoy Your Food and Improve Digestion",
    excerpt: "Explore techniques for mindful eating to enhance your relationship with food.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "mindful eating",
    readMoreLink: "/blog/3",
  },
  {
    id: "4",
    title: "Hydration Secrets: Are You Drinking Enough Water?",
    excerpt: "Uncover the importance of hydration for overall health and performance.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "water hydration",
    readMoreLink: "/blog/4",
  },
];


const BlogCard: FC<BlogPost> = React.memo(({ id, title, excerpt, imageUrl, imageHint, readMoreLink }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden group flex flex-col w-72 flex-shrink-0">
      <div className="relative w-full h-40">
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-105 transition-transform duration-300"
          data-ai-hint={imageHint || "health fitness"}
        />
      </div>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-md font-semibold line-clamp-2 h-12">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Link href={readMoreLink} passHref>
          <Button variant="link" className="p-0 text-primary hover:text-primary/80 text-sm">
            Read More <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
});
BlogCard.displayName = 'BlogCard';


export default function DashboardPage() {
  const { dailyLog, foodEntries, isLoading: isLoadingLog, deleteFoodEntry, currentSelectedDate, selectDateForLog } = useDailyLog();
  const { goals, isLoading: isLoadingGoals } = useGoals();
  const { userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);


  const consumedCalories = dailyLog?.calories ?? 0;
  const goalCalories = goals?.calories ?? 0;

  let percentAchieved = 0;
  if (goalCalories > 0) {
    percentAchieved = Math.round((consumedCalories / goalCalories) * 100);
  }

  const chartData = [];
  const COLORS = {
    Consumed: 'hsl(var(--card))', 
    Remaining: 'hsla(var(--primary-hsl), 0.25)', 
    Empty: 'hsla(var(--muted-foreground), 0.1)', 
    ConsumedNoGoal: 'hsl(var(--accent))', 
  };

  if (goalCalories > 0) {
    if (consumedCalories > 0) {
      chartData.push({ name: 'Consumed', value: consumedCalories, fill: COLORS.Consumed });
      if (consumedCalories < goalCalories) {
        chartData.push({ name: 'Remaining', value: Math.max(0, goalCalories - consumedCalories), fill: COLORS.Remaining });
      }
    } else { 
      chartData.push({ name: 'Remaining', value: goalCalories, fill: COLORS.Remaining });
    }
  } else { 
    if (consumedCalories > 0) {
      chartData.push({ name: 'ConsumedNoGoal', value: consumedCalories, fill: COLORS.ConsumedNoGoal });
    } else { 
      chartData.push({ name: 'Empty', value: 1, fill: COLORS.Empty });
    }
  }

  if (chartData.length === 0) { 
    chartData.push({ name: 'Empty', value: 1, fill: COLORS.Empty });
  }


  const todayCalories = dailyLog?.calories ?? 0;
  const todayCarbs = dailyLog?.carbs ?? 0;
  const todayProtein = dailyLog?.protein ?? 0;
  const todayFat = dailyLog?.fat ?? 0;

  const isDataLoading = isLoadingLog || isLoadingGoals || isLoadingProfile;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          {isLoadingProfile ? (
            <>
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </>
          ) : (
            <>
              <Link href="/profile">
                <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name || ""} data-ai-hint="user avatar" />
                  <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Link>
              <Link href="/profile">
                <h1 className="text-xl font-semibold hover:underline">Hi, {userProfile.name}</h1>
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/reminders" legacyBehavior>
             <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Your Progress Card */}
       <Card className="shadow-lg rounded-2xl p-4 bg-sky-100 dark:bg-sky-900/50 text-foreground">
          {isDataLoading ? (
             <div className="flex flex-row items-start gap-3">
              <div className="flex-1 space-y-2 text-left">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 sm:h-12 w-20 sm:w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="w-36 h-36 md:w-32 md:h-32 flex-shrink-0 flex justify-center items-center relative">
                <Skeleton className="w-full h-full rounded-full" />
                <Loader2 className="absolute h-8 w-8 animate-spin text-primary/50" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4"> 
              <div className="flex-1 space-y-1 text-center md:text-left">
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center md:justify-start">
                  <BarChart2 className="h-5 w-5" />
                  <span>Your Progress</span>
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-primary">
                  {goalCalories > 0 ? `${percentAchieved}%` : "-"}
                </div>
                 <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                     <Button variant="ghost" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-1 py-0.5 h-auto">
                       <CalendarDays className="h-4 w-4" />
                       <span>{currentSelectedDate ? (isToday(currentSelectedDate) ? "Today" : format(currentSelectedDate, "MMM d, yyyy")) : "Select Date"}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={currentSelectedDate || undefined}
                      onSelect={(newDate) => {
                        if (newDate) {
                          selectDateForLog(newDate);
                          setIsCalendarOpen(false);
                        }
                      }}
                      initialFocus
                      disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-36 h-36 md:w-32 md:h-32 flex-shrink-0 flex justify-center items-center relative">
                 <CalorieDonutChart 
                    chartData={chartData} 
                    consumedCalories={consumedCalories} 
                    goalCalories={goalCalories} 
                  />
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
          <h2 className="text-xl font-semibold">
            Summary for{" "}
            {currentSelectedDate
              ? isToday(currentSelectedDate)
                ? "Today"
                : format(currentSelectedDate, "MMM d, yyyy")
              : "Selected Date"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
         {isDataLoading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                 <Card key={`skel-summary-${i}`} className="p-3 shadow-md rounded-xl text-center">
                    <Skeleton className="h-6 w-6 mx-auto mb-1 rounded-lg" />
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
          <h2 className="text-xl font-semibold">
            Meal Log for{" "}
            {currentSelectedDate
              ? isToday(currentSelectedDate)
                ? "Today"
                : format(currentSelectedDate, "MMM d, yyyy")
              : "Selected Date"}
          </h2>
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
                <CardContent className="p-4 space-y-3 mr-8">
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
                onDelete={deleteFoodEntry}
              />
            ))}
          </div>
        ) : (
          <Card className="shadow-lg rounded-xl">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No meals logged for{" "}
              {currentSelectedDate
                ? isToday(currentSelectedDate)
                  ? "today"
                  : format(currentSelectedDate, "MMM d, yyyy")
                : "the selected date"}{" "}
              yet. Use the "Add Meal" button to log your first meal!
            </CardContent>
          </Card>
        )}
      </div>

      {/* Health Blogs Section */}
      <div className="space-y-3 mt-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Health & Wellness Reads</h2>
        </div>
        <div className="flex overflow-x-auto space-x-4 pb-4 pt-2">
          {mockBlogData.map((blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              excerpt={blog.excerpt}
              imageUrl={blog.imageUrl}
              imageHint={blog.imageHint}
              readMoreLink={blog.readMoreLink}
            />
          ))}
        </div>
      </div>

      {/* Smart Insights */}
      <div className="space-y-3 mt-6">
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
              <h3 className="text-lg font-semibold text-green-700">
                You're <span className="font-bold">on track</span> for{" "}
                {currentSelectedDate
                  ? isToday(currentSelectedDate)
                    ? "today"
                    : format(currentSelectedDate, "MMM d")
                  : "today"}!
                </h3>
              <p className="text-xs text-muted-foreground">Keep up the balanced meals for better results.</p>
            </div>
            <TrendingUp className="h-7 w-7 text-green-600" />
          </div>
        </Card>
      </div>
    </div>
  );
}


    