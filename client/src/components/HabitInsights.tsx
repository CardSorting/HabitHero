import React from "react";
import { useHabits } from "@/lib/useHabits";
import { useAnalytics } from "@/lib/useAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, isSameDay, differenceInDays } from "date-fns";
import { ChevronUp, ChevronDown, Zap, Calendar, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HabitInsightsProps {
  habitId?: number;
  compact?: boolean;
}

const HabitInsights: React.FC<HabitInsightsProps> = ({ habitId, compact = false }) => {
  const { habits } = useHabits();
  const { analyticsData, isLoading } = useAnalytics();
  
  // If habitId is provided, only show insights for that habit
  const filteredHabits = habitId 
    ? habits.filter(h => h.id === habitId)
    : habits;
  
  if (isLoading || habits.length === 0) {
    return (
      <Card className={cn(
        "rounded-[12px] bg-muted/30",
        compact ? "h-32" : "h-52",
        "animate-pulse"
      )} />
    );
  }
  
  // Get data for completion trend over time (last 14 days)
  const today = new Date();
  const trendData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(today, 13 - i);
    const startOfDayDate = startOfDay(date);
    
    // Count completions for this day across all filtered habits
    const completedCount = filteredHabits.filter(habit => 
      habit.completionRecords.some(
        record => isSameDay(new Date(record.date), date) && record.completed
      )
    ).length;
    
    const totalCount = filteredHabits.length;
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    return {
      date: startOfDayDate,
      label: format(date, "MMM d"),
      shortLabel: format(date, "d"),
      value: completionRate
    };
  });
  
  // Calculate trend direction (improving, declining, or stable)
  const firstWeekAvg = trendData.slice(0, 7).reduce((sum, day) => sum + day.value, 0) / 7;
  const secondWeekAvg = trendData.slice(7).reduce((sum, day) => sum + day.value, 0) / 7;
  const trendDiff = secondWeekAvg - firstWeekAvg;
  const trendDirection = trendDiff > 5 ? "improving" : trendDiff < -5 ? "declining" : "stable";
  
  // Find best streak
  const bestStreak = filteredHabits.reduce((max, habit) => Math.max(max, habit.streak), 0);
  
  // Get most consistent habit if not showing single habit
  let mostConsistentHabit = null;
  if (!habitId && analyticsData?.habitPerformance?.length > 0) {
    mostConsistentHabit = analyticsData.habitPerformance.sort((a, b) => b.completionRate - a.completionRate)[0];
  }
  
  // Calculate current consistency streak
  let currentConsistencyStreak = 0;
  for (let i = 0; i < 14; i++) {
    const date = subDays(today, i);
    const allCompleted = filteredHabits.every(habit => 
      habit.completionRecords.some(
        record => isSameDay(new Date(record.date), date) && record.completed
      )
    );
    
    if (allCompleted) {
      currentConsistencyStreak++;
    } else {
      break;
    }
  }
  
  // Calculate time patterns - when habits are most likely to be completed
  const timePatterns = compact ? null : filteredHabits.flatMap(habit => 
    habit.completionRecords
      .filter(record => record.completed && differenceInDays(today, new Date(record.date)) <= 30)
      .map(record => ({
        date: new Date(record.date),
        habitId: habit.id,
        habitName: habit.name
      }))
  );
  
  // Render compact version for dashboard
  if (compact) {
    return (
      <Card className="rounded-[12px]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Insights</h3>
            <span className={cn(
              "text-xs rounded-full px-2 py-0.5 flex items-center",
              trendDirection === "improving" 
                ? "bg-success/10 text-success" 
                : trendDirection === "declining" 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-muted text-muted-foreground"
            )}>
              {trendDirection === "improving" ? (
                <><ChevronUp className="h-3 w-3 mr-1" /> Improving</>
              ) : trendDirection === "declining" ? (
                <><ChevronDown className="h-3 w-3 mr-1" /> Declining</>
              ) : (
                <><span className="h-3 w-3 mr-1">•</span> Stable</>
              )}
            </span>
          </div>
          
          <div className="h-[60px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center">
              <Award className="h-3 w-3 text-primary mr-1.5" />
              <span className="text-xs text-muted-foreground">Best streak: {bestStreak} days</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-3 w-3 text-primary mr-1.5" />
              <span className="text-xs text-muted-foreground">Current: {currentConsistencyStreak} days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render full version for habit detail view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Consistency Trend</h3>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Last 14 days</span>
            <span className={cn(
              "text-xs rounded-full px-2 py-0.5 flex items-center",
              trendDirection === "improving" 
                ? "bg-success/10 text-success" 
                : trendDirection === "declining" 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-muted text-muted-foreground"
            )}>
              {trendDirection === "improving" ? (
                <><ChevronUp className="h-3 w-3 mr-1" /> Improving</>
              ) : trendDirection === "declining" ? (
                <><ChevronDown className="h-3 w-3 mr-1" /> Declining</>
              ) : (
                <><span className="h-3 w-3 mr-1">•</span> Stable</>
              )}
            </span>
          </div>
          
          <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="shortLabel" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`${Math.round(Number(value))}%`, "Completion Rate"]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const index = payload[0].payload.label;
                      return index;
                    }
                    return label;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ stroke: "hsl(var(--primary))", fill: "white", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: "hsl(var(--primary))", fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Streak Stats</h4>
          </div>
          <div className="mt-2">
            <div className="mb-2">
              <div className="text-xs text-muted-foreground">Current streak</div>
              <div className="text-2xl font-semibold">{currentConsistencyStreak} days</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Best streak</div>
              <div className="text-2xl font-semibold">{bestStreak} days</div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Performance</h4>
          </div>
          <div className="mt-2">
            <div className="mb-2">
              <div className="text-xs text-muted-foreground">Completion rate</div>
              <div className="text-2xl font-semibold">
                {Math.round(secondWeekAvg)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Compared to previous</div>
              <div className="flex items-center">
                <span className={cn(
                  "text-sm font-medium",
                  trendDiff > 0 ? "text-success" : trendDiff < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {trendDiff > 0 ? "+" : ""}{Math.round(trendDiff)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {mostConsistentHabit && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Most Consistent Habit</h4>
          </div>
          <div className="mt-1">
            <div className="text-lg font-medium">{mostConsistentHabit.name}</div>
            <div className="text-sm text-muted-foreground">
              {Math.round(mostConsistentHabit.completionRate)}% completion rate with a {mostConsistentHabit.streak} day streak
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HabitInsights;