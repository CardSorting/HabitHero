import React, { useState } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { useHabits } from "@/lib/useHabits";
import { useAnalytics } from "@/lib/useAnalytics";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, differenceInDays } from "date-fns";
import { CalendarIcon, TrendingUpIcon, PieChartIcon, BarChart2Icon, ActivityIcon, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { calculateStreak } from "@/lib/utils";

// Custom colors for charts
const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  const [selectedTab, setSelectedTab] = useState("overview");
  const { habits, isLoading } = useHabits();
  
  // Calculate date ranges based on timeframe
  const today = new Date();
  const getDateRange = () => {
    switch (timeframe) {
      case "week":
        return eachDayOfInterval({
          start: subDays(today, 6),
          end: today
        });
      case "month":
        return eachDayOfInterval({
          start: startOfMonth(today),
          end: endOfMonth(today)
        });
      case "year":
        const months = [];
        for (let i = 0; i < 12; i++) {
          const date = new Date(today.getFullYear(), i, 1);
          months.push(date);
        }
        return months;
    }
  };
  
  const dateRange = getDateRange();
  
  // 1. Overview metrics
  const calculateTotalCompletions = () => {
    return habits.reduce((total, habit) => {
      return total + habit.completionRecords.filter(record => record.completed).length;
    }, 0);
  };
  
  const calculateCompletionRate = () => {
    const totalPossible = habits.length * 30; // Assuming monthly view
    const completed = calculateTotalCompletions();
    return totalPossible > 0 ? (completed / totalPossible * 100).toFixed(1) : "0";
  };
  
  const calculateLongestStreak = () => {
    return habits.reduce((max, habit) => {
      return Math.max(max, habit.streak);
    }, 0);
  };
  
  const calculateConsistencyScore = () => {
    // A weighted score based on completion rate and streaks
    const completionRate = parseFloat(calculateCompletionRate());
    const longestStreak = calculateLongestStreak();
    const weightedScore = (completionRate * 0.7) + (longestStreak * 2);
    return Math.min(100, Math.round(weightedScore)).toFixed(0);
  };
  
  // 2. Trend data
  const getTrendData = () => {
    if (timeframe === "year") {
      return dateRange.map(date => {
        const month = format(date, "MMM");
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
        
        const totalPossible = habits.length * daysInMonth;
        let completed = 0;
        
        habits.forEach(habit => {
          completed += habit.completionRecords.filter(record => {
            const recordDate = parseISO(record.date);
            return recordDate.getMonth() === date.getMonth() && 
                  recordDate.getFullYear() === date.getFullYear() && 
                  record.completed;
          }).length;
        });
        
        const completionRate = totalPossible > 0 ? (completed / totalPossible) * 100 : 0;
        
        return {
          name: month,
          value: Math.round(completionRate),
          completed
        };
      });
    } else {
      return dateRange.map(day => {
        const dateStr = format(day, timeframe === "week" ? "EEE" : "dd");
        
        const completedCount = habits.reduce((count, habit) => {
          const isCompleted = habit.completionRecords.some(
            record => isSameDay(new Date(record.date), day) && record.completed
          );
          return isCompleted ? count + 1 : count;
        }, 0);
        
        const completionRate = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
        
        return {
          name: dateStr,
          fullDate: format(day, "MMM dd"),
          value: Math.round(completionRate),
          completed: completedCount
        };
      });
    }
  };
  
  // 3. Habit-specific performance
  const getHabitPerformance = () => {
    return habits.map(habit => {
      const completions = habit.completionRecords.filter(record => record.completed).length;
      const total = 30; // Assuming monthly view for simplicity
      const completionRate = total > 0 ? (completions / total) * 100 : 0;
      
      return {
        name: habit.name,
        value: Math.round(completionRate),
        completions,
        streak: habit.streak
      };
    });
  };
  
  // 4. Category distribution (using frequency as category for demonstration)
  const getCategoryData = () => {
    const categories: Record<string, number> = {};
    
    habits.forEach(habit => {
      const category = habit.frequency;
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += 1;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // 5. Radar chart data for habit attribute comparison
  const getRadarData = () => {
    // Create data for radar chart showing multiple aspects of habit performance
    const habitNames = habits.map(habit => habit.name);
    
    return [
      {
        subject: "Completion",
        ...habitNames.reduce((acc, name, index) => {
          const habit = habits[index];
          const completions = habit.completionRecords.filter(r => r.completed).length;
          const rate = Math.round((completions / 30) * 100);
          return { ...acc, [name]: rate };
        }, {})
      },
      {
        subject: "Streak",
        ...habitNames.reduce((acc, name, index) => {
          const streak = habits[index].streak;
          // Normalize streak to percentage (assuming max streak is 30 days)
          const normalizedStreak = Math.min(100, Math.round((streak / 30) * 100));
          return { ...acc, [name]: normalizedStreak };
        }, {})
      },
      {
        subject: "Consistency",
        ...habitNames.reduce((acc, name, index) => {
          const habit = habits[index];
          // Calculate consistency as percentage of days with completion status (either true or false)
          const daysWithStatus = habit.completionRecords.length;
          const consistency = Math.round((daysWithStatus / 30) * 100);
          return { ...acc, [name]: consistency };
        }, {})
      }
    ];
  };
  
  if (isLoading) {
    return (
      <>
        <Header title="Analytics" />
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 rounded-md mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-[12px]" />
              <Skeleton className="h-24 rounded-[12px]" />
              <Skeleton className="h-24 rounded-[12px]" />
              <Skeleton className="h-24 rounded-[12px]" />
            </div>
            <Skeleton className="h-64 w-full rounded-[12px]" />
          </div>
        </main>
      </>
    );
  }

  // Handle empty state
  if (habits.length === 0) {
    return (
      <>
        <Header title="Analytics" />
        <motion.main 
          className="flex-1 px-6 py-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <BarChart2Icon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No habit data available</h3>
            <p className="text-muted-foreground max-w-sm">
              Start tracking your habits to see detailed analytics and insights about your progress.
            </p>
          </div>
        </motion.main>
      </>
    );
  }
  
  const trendData = getTrendData();
  const habitPerformance = getHabitPerformance();
  const categoryData = getCategoryData();
  const radarData = getRadarData();
  
  return (
    <>
      <Header title="Analytics" />
      <motion.main 
        className="flex-1 px-6 py-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Time frame selector */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Habit Analytics</h2>
          <Select 
            value={timeframe} 
            onValueChange={(value) => setTimeframe(value as "week" | "month" | "year")}
          >
            <SelectTrigger className="w-32 rounded-full h-9">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
              <ActivityIcon className="h-3 w-3" /> Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-1 text-xs">
              <TrendingUpIcon className="h-3 w-3" /> Trends
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-1 text-xs">
              <BarChart2Icon className="h-3 w-3" /> By Habit
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1 text-xs">
              <PieChartIcon className="h-3 w-3" /> Insights
            </TabsTrigger>
          </TabsList>
        
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="rounded-[12px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{calculateCompletionRate()}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Habit completion success
                  </p>
                </CardContent>
              </Card>
              
              <Card className="rounded-[12px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Longest Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{calculateLongestStreak()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consecutive days
                  </p>
                </CardContent>
              </Card>
              
              <Card className="rounded-[12px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Completions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{calculateTotalCompletions()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Habits completed
                  </p>
                </CardContent>
              </Card>
              
              <Card className="rounded-[12px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Consistency Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{calculateConsistencyScore()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Out of 100
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="rounded-[12px]">
                <CardHeader>
                  <CardTitle>
                    {timeframe === 'week' ? 'Weekly' : timeframe === 'month' ? 'Monthly' : 'Yearly'} Overview
                  </CardTitle>
                  <CardDescription>
                    Habit completion rate over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trendData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Completion Rate']}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0 && payload[0].payload.fullDate) {
                              return payload[0].payload.fullDate;
                            }
                            return label;
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="rounded-[12px] mb-6">
                <CardHeader>
                  <CardTitle>Completion Rate Trend</CardTitle>
                  <CardDescription>
                    How your habit completion has changed over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trendData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Completion Rate']}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0 && payload[0].payload.fullDate) {
                              return payload[0].payload.fullDate;
                            }
                            return label;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: "hsl(var(--primary))" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="rounded-[12px]">
                <CardHeader>
                  <CardTitle>Habit Completion Count</CardTitle>
                  <CardDescription>
                    Number of habits completed each day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trendData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}`, 'Habits Completed']}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0 && payload[0].payload.fullDate) {
                              return payload[0].payload.fullDate;
                            }
                            return label;
                          }}
                        />
                        <Bar 
                          dataKey="completed" 
                          fill="hsl(var(--secondary))" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* By Habit Tab */}
          <TabsContent value="habits" className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="rounded-[12px] mb-6">
                <CardHeader>
                  <CardTitle>Habit Performance</CardTitle>
                  <CardDescription>
                    Completion rate by habit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={habitPerformance}
                        margin={{ top: 10, right: 30, left: -20, bottom: 20 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis 
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis 
                          type="category"
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          width={100}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Completion Rate']}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="hsl(var(--primary))" 
                          radius={[0, 4, 4, 0]}
                          maxBarSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="rounded-[12px]">
                <CardHeader>
                  <CardTitle>Habit Streaks</CardTitle>
                  <CardDescription>
                    Current streak for each habit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={habitPerformance}
                        margin={{ top: 10, right: 30, left: -20, bottom: 20 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis 
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <YAxis 
                          type="category"
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          width={100}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}`, 'Days']}
                        />
                        <Bar 
                          dataKey="streak" 
                          fill="hsl(var(--success))" 
                          radius={[0, 4, 4, 0]}
                          maxBarSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="rounded-[12px]">
                  <CardHeader>
                    <CardTitle>Frequency Distribution</CardTitle>
                    <CardDescription>
                      Habits by frequency type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={40}
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={false}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}`, 'Habits']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="rounded-[12px]">
                  <CardHeader>
                    <CardTitle>Habit Performance</CardTitle>
                    <CardDescription>
                      Multi-dimensional analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius={80} data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          
                          {habits.map((habit, index) => (
                            <Radar
                              key={habit.id}
                              name={habit.name}
                              dataKey={habit.name}
                              stroke={COLORS[index % COLORS.length]}
                              fill={COLORS[index % COLORS.length]}
                              fillOpacity={0.2}
                            />
                          ))}
                          
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="rounded-[12px]">
                <CardHeader>
                  <CardTitle>Insights & Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {habits.length > 0 && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Strongest Habit</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-success/10 text-success border-success">
                            {habitPerformance.sort((a, b) => b.value - a.value)[0]?.name || "N/A"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {habitPerformance.sort((a, b) => b.value - a.value)[0]?.value || 0}% completion rate
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Needs Improvement</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
                            {habitPerformance.sort((a, b) => a.value - b.value)[0]?.name || "N/A"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {habitPerformance.sort((a, b) => a.value - b.value)[0]?.value || 0}% completion rate
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Best Day of the Week</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                            {trendData.sort((a, b) => b.value - a.value)[0]?.name || "N/A"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {trendData.sort((a, b) => b.value - a.value)[0]?.value || 0}% completion rate
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-2">Personalized Tips</h4>
                        <ul className="space-y-2">
                          {parseFloat(calculateCompletionRate()) < 50 && (
                            <li className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              Try focusing on fewer habits to improve your completion rate.
                            </li>
                          )}
                          
                          {habitPerformance.some(h => h.value < 30) && (
                            <li className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              Consider adjusting the timing or simplifying some of your lower-performing habits.
                            </li>
                          )}
                          
                          {habits.length > 0 && (
                            <li className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              Schedule your habits during your most productive times of day for better results.
                            </li>
                          )}
                          
                          <li className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            Consider grouping related habits together to build momentum.
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.main>
    </>
  );
};

export default Analytics;