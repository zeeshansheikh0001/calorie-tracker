"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import { LineChart as LucideLineChart, TrendingUp, Activity, CalendarDays } from "lucide-react";
import type { Goal, DailyLogEntry } from "@/types"; // Assuming types are defined
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockGoals: Goal = { calories: 2200, protein: 160, fat: 75, carbs: 220 };
const mockLog: DailyLogEntry[] = [
  { date: '2024-07-01', calories: 2100, protein: 150, fat: 70, carbs: 210 },
  { date: '2024-07-02', calories: 2300, protein: 165, fat: 80, carbs: 230 },
  { date: '2024-07-03', calories: 2050, protein: 155, fat: 65, carbs: 200 },
  { date: '2024-07-04', calories: 2250, protein: 160, fat: 72, carbs: 225 },
  { date: '2024-07-05', calories: 1900, protein: 140, fat: 60, carbs: 190 },
  { date: '2024-07-06', calories: 2400, protein: 170, fat: 85, carbs: 245 },
  { date: '2024-07-07', calories: 2150, protein: 158, fat: 73, carbs: 215 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

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
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-semibold">
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
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs">{`${value.toFixed(0)}g`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export default function ProgressPage() {
  const [goals, setGoals] = useState<Goal>(mockGoals);
  const [dailyLog, setDailyLog] = useState<DailyLogEntry[]>(mockLog);
  const [timeRange, setTimeRange] = useState("7days");
  const [activeIndex, setActiveIndex] = useState(0);


  useEffect(() => {
    const storedGoals = localStorage.getItem("userGoals");
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
    // In a real app, fetch dailyLog based on timeRange
  }, [timeRange]);

  const averageCalories = dailyLog.reduce((sum, entry) => sum + entry.calories, 0) / dailyLog.length;
  
  const latestEntry = dailyLog[dailyLog.length -1] || {calories: 0, protein: 0, fat: 0, carbs: 0};
  const macroData = [
    { name: 'Protein', value: latestEntry.protein },
    { name: 'Fat', value: latestEntry.fat },
    { name: 'Carbs', value: latestEntry.carbs },
  ];


  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <LucideLineChart className="mr-3 h-8 w-8 text-primary" />
            Your Nutritional Progress
          </h1>
          <p className="text-muted-foreground">Visualize your journey towards better health.</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="alltime">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Calories</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCalories.toFixed(0)} kcal</div>
            <p className="text-xs text-muted-foreground">
              Target: {goals.calories} kcal
            </p>
            <Progress value={(averageCalories / goals.calories) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Adherence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* Placeholder for adherence calculation */}
              {((dailyLog.filter(d => d.calories <= goals.calories).length / dailyLog.length) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Days on track in selected period
            </p>
             <Progress value={((dailyLog.filter(d => d.calories <= goals.calories).length / dailyLog.length) * 100)} className="mt-2 h-2 bg-green-500/20 [&>div]:bg-green-500" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days Logged</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyLog.length} days</div>
            <p className="text-xs text-muted-foreground">
              Consistency is key!
            </p>
             <Progress value={(dailyLog.length / (timeRange === '7days' ? 7 : 30)) * 100} className="mt-2 h-2 bg-blue-500/20 [&>div]:bg-blue-500" />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Daily Calorie Intake vs. Goal</CardTitle>
            <CardDescription>How your intake compares to your {goals.calories} kcal goal.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyLog} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "var(--radius)"}}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="calories" name="Calories Consumed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                {/* You could add a reference line for the goal */}
                {/* <ReferenceLine y={goals.calories} label="Goal" stroke="hsl(var(--accent))" strokeDasharray="3 3" /> */}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Macronutrient Distribution (Latest Day)</CardTitle>
            <CardDescription>Breakdown of protein, fat, and carbs for {new Date(latestEntry.date || Date.now()).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                 <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "var(--radius)"}}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for historical data table or more detailed reports */}
      {/* <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Detailed Log History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A table with historical logs would go here.</p>
        </CardContent>
      </Card> */}
    </div>
  );
}
