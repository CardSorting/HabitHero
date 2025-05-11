import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabits } from "@/lib/useHabits";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";

const WeeklyOverview: React.FC = () => {
  const { habits, isLoading } = useHabits();
  
  if (isLoading) {
    return (
      <Card className="rounded-[12px] bg-muted/30 h-48 animate-pulse mt-8" />
    );
  }
  
  const today = new Date();
  const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  
  // Create array for the 7 days of the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfThisWeek, i);
    const dayName = format(date, "EEE").charAt(0); // First letter of day name
    const isToday = isSameDay(date, today);
    
    // Count completed habits for this day
    const completedHabits = habits.filter(habit => 
      habit.completionRecords.some(record => 
        isSameDay(new Date(record.date), date) && record.completed
      )
    ).length;
    
    const completionRate = habits.length > 0 
      ? Math.round((completedHabits / habits.length) * 100) 
      : 0;
    
    return {
      date,
      dayName,
      isToday,
      completedHabits,
      totalHabits: habits.length,
      completionRate
    };
  });
  
  // Calculate week average
  const weekAverage = weekDays.reduce((sum, day) => sum + day.completionRate, 0) / 7;
  
  // Find best and worst days
  const bestDay = [...weekDays].sort((a, b) => b.completionRate - a.completionRate)[0];
  const worstDay = [...weekDays].sort((a, b) => a.completionRate - b.completionRate)[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-8"
    >
      <Card className="rounded-[12px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Week Average</span>
              <span className="text-2xl font-semibold">{Math.round(weekAverage)}%</span>
            </div>
            
            <div className="flex space-x-1 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-success mr-1"></div>
                <span className="text-muted-foreground">Best: {format(bestDay.date, "EEE")}</span>
              </div>
              <span className="text-muted-foreground mx-1">•</span>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-destructive mr-1"></div>
                <span className="text-muted-foreground">Needs work: {format(worstDay.date, "EEE")}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            {weekDays.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex flex-col items-center",
                  day.isToday && "relative"
                )}
              >
                {day.isToday && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
                <ProgressRing 
                  value={day.completionRate} 
                  size={36} 
                  strokeWidth={4}
                  showLabel={false}
                  fgColor={getColorByRate(day.completionRate)}
                  bgColor="hsl(var(--muted))"
                  animate={false}
                />
                <span className={cn(
                  "text-xs mt-2",
                  day.isToday ? "font-medium text-primary" : "text-muted-foreground"
                )}>
                  {day.dayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {day.completedHabits}/{day.totalHabits}
                </span>
              </div>
            ))}
          </div>
          
          {/* Insights based on weekly data */}
          <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
            {weekAverage > 80 ? (
              <p>Excellent week! You're maintaining strong consistency across all your habits.</p>
            ) : weekAverage > 50 ? (
              <p>Good progress this week, with room for improvement on {format(worstDay.date, "EEEE")}.</p>
            ) : (
              <p>Focus on building consistency, especially on {format(bestDay.date, "EEEE")} when you perform best.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper function to get color based on completion rate
function getColorByRate(rate: number): string {
  if (rate >= 80) return "hsl(var(--success))";
  if (rate >= 50) return "hsl(var(--primary))";
  if (rate >= 30) return "hsl(var(--warning, 38 92% 50%))";
  return "hsl(var(--muted-foreground))";
}

export default WeeklyOverview;