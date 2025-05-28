"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp, Activity, CalendarDays, CheckCircle, XCircle, ListChecks } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals";
import { format, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

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
  const [chartsVisible, setChartsVisible] = useState(false);

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
    { name: 'Protein', value: proteinToday > 0 ? proteinToday : 0.01 },
    { name: 'Fat', value: fatToday > 0 ? fatToday : 0.01 },
    { name: 'Carbs', value: carbsToday > 0 ? carbsToday : 0.01 },
  ].filter(m => m.value > 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const selectedDateFormatted = currentSelectedDate 
    ? isToday(currentSelectedDate) 
      ? "Today" 
      : format(currentSelectedDate, "MMM d, yyyy") 
    : "Selected Date";

  // Show charts after a delay for better animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartsVisible(true);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container max-w-screen-xl mx-auto py-6 px-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        className="mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              Nutritional Stats
            </h1>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-muted-foreground mt-1 ml-1">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-sm font-medium">
                  {selectedDateFormatted}
                </span>
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 backdrop-blur-sm border border-border/50 shadow-sm"
          >
            <CalendarDays className="h-4 w-4 text-primary/70" />
            <span className="text-sm font-medium">{selectedDateFormatted}</span>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
            <CardHeader className="pb-0">
              <div className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="h-4 w-4 text-primary mr-2" />
                  Calories Consumed
                </CardTitle>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    calorieGoal > 0 && caloriesToday <= calorieGoal * 0.8
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : calorieGoal > 0 && caloriesToday <= calorieGoal
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {calorieGoal > 0 
                    ? caloriesToday <= calorieGoal * 0.8
                      ? 'Well Below Target'
                      : caloriesToday <= calorieGoal
                      ? 'On Target'
                      : 'Over Target'
                    : 'No Goal Set'}
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {isLoading ? (
                <>
                  <div className="h-7 w-24 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl md:text-3xl font-bold"
                    >
                      {Math.round(caloriesToday).toLocaleString()} 
                      <span className="text-sm text-muted-foreground ml-1">kcal</span>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm text-right"
                    >
                      <div className="text-muted-foreground">
                        Goal: <span className="font-medium text-foreground">{Math.round(calorieGoal).toLocaleString()} kcal</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {calorieGoal > 0 
                          ? caloriesToday > calorieGoal 
                            ? `${Math.round(caloriesToday - calorieGoal).toLocaleString()} over`
                            : `${Math.round(calorieGoal - caloriesToday).toLocaleString()} remaining`
                          : "No goal set"}
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
              <div className="mt-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-between mb-1 text-xs"
                >
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(calorieProgress)}%</span>
                </motion.div>
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                >
                  <Progress 
                    value={calorieProgress} 
                    className="h-2.5 rounded-full" 
                    indicatorClassName={`rounded-full ${
                      caloriesToday <= calorieGoal * 0.8
                        ? 'bg-green-500'
                        : caloriesToday <= calorieGoal
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400/40 via-green-500 to-green-400/40"></div>
            <CardHeader className="pb-0">
              <div className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center">
                  {isLoading ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                  ) : isOnTrackToday ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  Goal Adherence
                </CardTitle>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isOnTrackToday
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {isOnTrackToday ? 'On Track' : 'Off Track'}
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {isLoading ? (
                <>
                  <div className="h-7 w-20 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-28 bg-muted rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className={`text-2xl md:text-3xl font-bold flex items-center ${
                        isOnTrackToday ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {calorieGoal > 0 ? `${Math.round(calorieProgress)}%` : "No Goal"}
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-right"
                    >
                      {isOnTrackToday ? (
                        <motion.div
                          initial={{ rotate: -5 }}
                          animate={{ rotate: 0 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="flex items-center bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">On target!</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ rotate: 5 }}
                          animate={{ rotate: 0 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="flex items-center bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md"
                        >
                          <XCircle className="h-3.5 w-3.5 text-red-500 mr-1" />
                          <span className="text-xs font-medium text-red-700 dark:text-red-400">
                            {caloriesToday > calorieGoal ? "Over limit" : "No goal set"}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isOnTrackToday 
                      ? `Still have ${Math.round(calorieGoal - caloriesToday).toLocaleString()} kcal remaining for today!`
                      : calorieGoal > 0 
                        ? `Exceeded by ${Math.round(caloriesToday - calorieGoal).toLocaleString()} kcal`
                        : "Set a calorie goal to track progress"
                    }
                  </p>
                </>
              )}
              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="mt-3"
              >
                <Progress 
                  value={calorieGoal > 0 ? Math.min(100, calorieProgress) : 0} 
                  className={`h-2.5 rounded-full ${
                    isOnTrackToday && calorieGoal > 0 
                      ? 'bg-green-500/20' 
                      : calorieGoal > 0 
                        ? 'bg-red-500/20' 
                        : 'bg-muted'
                  }`}
                  indicatorClassName={`rounded-full ${
                    isOnTrackToday && calorieGoal > 0 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/40 via-blue-500 to-blue-400/40"></div>
            <CardHeader className="pb-0">
              <div className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ListChecks className="h-4 w-4 text-blue-500 mr-2" />
                  Meals Logged
                </CardTitle>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {selectedDateFormatted}
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {isLoading ? (
                <div className="h-12 w-12 bg-muted rounded-full animate-pulse mx-auto"></div>
              ) : (
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.4
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"></div>
                    <div className="relative bg-blue-100 dark:bg-blue-900/50 w-20 h-20 rounded-full flex items-center justify-center border-2 border-blue-200 dark:border-blue-800">
                      <span className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400">
                        {mealsLoggedToday}
                      </span>
                    </div>
                  </motion.div>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-muted-foreground mt-3 text-center"
                  >
                    {mealsLoggedToday === 0 
                      ? "No meals logged today" 
                      : mealsLoggedToday === 1 
                        ? "1 meal logged today"
                        : `${mealsLoggedToday} meals logged today`
                    }
                  </motion.p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="grid gap-5 md:grid-cols-2 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: chartsVisible ? 1 : 0, y: chartsVisible ? 0 : 30 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="overflow-hidden shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BarChartIcon className="mr-2 h-5 w-5 text-primary"/>
                  <span>Calories: Consumed vs. Goal</span>
                </CardTitle>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {selectedDateFormatted}
                </motion.div>
              </div>
              <CardDescription>Comparison of consumed calories against your daily goal.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full px-2">
              {isLoading ? (
                <div className="h-full w-full bg-muted rounded-lg animate-pulse flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Loading chart data...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={calorieChartData} 
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }} 
                    barGap={10} 
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                      }}
                      cursor={{ fill: 'hsla(var(--primary-hsl), 0.1)' }}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Calories" 
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                      animationBegin={200}
                      isAnimationActive={true}
                    >
                      {calorieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={index === 0 
                            ? caloriesToday <= calorieGoal * 0.8
                              ? 'hsl(142, 76%, 36%)' // Green
                              : caloriesToday <= calorieGoal
                              ? 'hsl(45, 93%, 47%)' // Yellow
                              : 'hsl(0, 91%, 71%)' // Red
                            : 'hsl(var(--chart-2))'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: chartsVisible ? 1 : 0, y: chartsVisible ? 0 : 30 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="overflow-hidden shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5 text-primary"/>
                  <span>Macronutrient Distribution</span>
                </CardTitle>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {selectedDateFormatted}
                </motion.div>
              </div>
              <CardDescription>Protein, Fat, and Carbs breakdown for your meals.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full px-2 relative overflow-hidden">
              {isLoading ? (
                <div className="h-full w-full bg-muted rounded-lg animate-pulse flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Loading chart data...</span>
                </div>
              ) : macroData.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-muted/30 rounded-lg text-muted-foreground">
                  <PieChartIcon className="h-10 w-10 mb-3 text-muted-foreground/50" />
                  <p className="text-center">No macro data for this day.</p>
                  <p className="text-xs mt-1 text-center max-w-xs">Log some food entries to see your macro distribution.</p>
                </div>
              ) : (
                <>
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
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
                        animationBegin={300}
                        animationDuration={1500}
                        isAnimationActive={true}
                      >
                        {macroData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              index === 0 ? 'hsl(210, 100%, 59%)' : // Protein - Blue
                              index === 1 ? 'hsl(45, 93%, 47%)' :  // Fat - Yellow
                              'hsl(142, 76%, 36%)'                // Carbs - Green
                            } 
                            stroke="hsl(var(--background))" 
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                        }} 
                        formatter={(value: number, name: string) => [`${Math.round(value)}g`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

    