
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp, Activity, CalendarDays, CheckCircle, XCircle, ListChecks } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals";
import { format, isToday } from "date-fns";

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm font-semibold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={5}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        cornerRadius={3}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs">{`${Math.round(value)}g`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};


export default function ProgressPage() {
  const { dailyLog, foodEntries, isLoading: isLoadingLog, currentSelectedDate } = useDailyLog();
  const { goals, isLoading: isLoadingGoals } = useGoals();
  const [activeIndex, setActiveIndex] = useState(0);

  const isLoading = isLoadingLog || isLoadingGoals;

  const caloriesToday = dailyLog?.calories ?? 0;
  const proteinToday = dailyLog?.protein ?? 0;
  const fatToday = dailyLog?.fat ?? 0;
  const carbsToday = dailyLog?.carbs ?? 0;
  const mealsLoggedToday = foodEntries?.length ?? 0;

  const calorieGoal = goals?.calories ?? 0;
  const calorieProgress = calorieGoal > 0 ? (caloriesToday / calorieGoal) * 100 : 0;
  const isOnTrackToday = calorieGoal > 0 && caloriesToday <= calorieGoal;

  const calorieChartData = [
    { name: 'Consumed', value: Math.round(caloriesToday), fill: 'hsl(var(--chart-1))' },
    { name: 'Goal', value: Math.round(calorieGoal), fill: 'hsl(var(--chart-2))' },
  ];

  const macroData = [
    { name: 'Protein', value: proteinToday > 0 ? proteinToday : 0.01 }, // Add small value if 0 for pie chart
    { name: 'Fat', value: fatToday > 0 ? fatToday : 0.01 },
    { name: 'Carbs', value: carbsToday > 0 ? carbsToday : 0.01 },
  ].filter(m => m.value > 0); // Filter out zero values after adding small epsilon if needed

   const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const selectedDateFormatted = currentSelectedDate 
    ? isToday(currentSelectedDate) 
      ? "Today" 
      : format(currentSelectedDate, "MMM d, yyyy") 
    : "Selected Date";

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <TrendingUp className="mr-3 h-8 w-8 text-primary" />
          Nutritional Stats for {selectedDateFormatted}
        </h1>
        <p className="text-muted-foreground">Your performance for the selected day.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-5 duration-500 delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Consumed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <div className="h-7 w-24 bg-muted rounded animate-pulse mb-1"></div>
                <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
              </>
            ) : (
              <>
              <div className="text-2xl font-bold">{Math.round(caloriesToday)} kcal</div>
              <p className="text-xs text-muted-foreground">
                Goal: {Math.round(calorieGoal)} kcal
              </p>
              </>
            )}
            <Progress value={calorieProgress} className="mt-2 h-3 rounded-full" indicatorClassName="rounded-full" />
          </CardContent>
        </Card>

        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-5 duration-500 delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Adherence (Calories)</CardTitle>
            {isLoading ? <TrendingUp className="h-4 w-4 text-muted-foreground" /> : isOnTrackToday ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <>
                <div className="h-7 w-20 bg-muted rounded animate-pulse mb-1"></div>
                <div className="h-3 w-28 bg-muted rounded animate-pulse"></div>
              </>
            ) : (
            <>
            <div className={`text-2xl font-bold ${isOnTrackToday ? 'text-green-500' : 'text-red-500'}`}>
              {calorieGoal > 0 ? `${Math.round(calorieProgress)}%` : "No Goal Set"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOnTrackToday ? "On track for today!" : (caloriesToday > calorieGoal && calorieGoal > 0 ? "Over calorie goal" : "Under calorie goal or no goal")}
            </p>
            </>
            )}
            <Progress 
                value={calorieGoal > 0 ? Math.min(100, calorieProgress) : 0} 
                className={`mt-2 h-3 rounded-full ${isOnTrackToday && calorieGoal > 0 ? 'bg-green-500/20 [&>div]:bg-green-500' : (calorieGoal > 0 ? 'bg-red-500/20 [&>div]:bg-red-500' : 'bg-muted')}`}
                indicatorClassName="rounded-full"
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-5 duration-500 delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meals Logged</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="h-7 w-12 bg-muted rounded animate-pulse mb-1"></div>
             ) : (
                <div className="text-2xl font-bold">{mealsLoggedToday}</div>
             )}
            <p className="text-xs text-muted-foreground">
              Items logged for {selectedDateFormatted.toLowerCase()}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-5 duration-500 delay-400">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChartIcon className="mr-2 h-5 w-5 text-primary"/>Calories: Consumed vs. Goal</CardTitle>
            <CardDescription>Comparison for {selectedDateFormatted}.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            {isLoading ? <div className="h-full w-full bg-muted rounded animate-pulse"></div> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} barGap={10} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "var(--radius)"}}
                  cursor={{ fill: 'hsla(var(--primary-hsl), 0.1)' }}
                />
                <Bar dataKey="value" name="Calories" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-5 duration-500 delay-500">
          <CardHeader>
            <CardTitle className="flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary"/>Macronutrient Distribution</CardTitle>
            <CardDescription>Protein, Fat, and Carbs for {selectedDateFormatted}.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
          {isLoading || macroData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center bg-muted rounded animate-pulse text-muted-foreground">
                {isLoading ? "Loading chart..." : "No macro data for this day."}
            </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  paddingAngle={5}
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2}/>
                  ))}
                </Pie>
                 <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "var(--radius)"}} formatter={(value: number, name: string) => [`${Math.round(value)}g`, name]}/>
              </PieChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    