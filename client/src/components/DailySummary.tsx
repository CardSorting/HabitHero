import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useHabits } from "@/lib/useHabits";
import { format, isSameDay } from "date-fns";
import { Award, Calendar, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const DailySummary: React.FC = () => {
  const { habits, isLoading } = useHabits();
  
  if (isLoading) {
    return (
      <Card className="rounded-[12px] bg-muted/30 h-40 animate-pulse" />
    );
  }
  
  // Calculate today's metrics
  const today = new Date();
  
  const todayFormatted = format(today, "yyyy-MM-dd");
  const dayOfWeek = format(today, "EEEE");
  const dateFormatted = format(today, "MMMM d");
  
  // Get habits completed today
  const todayCompletions = habits.map(habit => {
    const isCompleted = habit.completionRecords.some(
      record => isSameDay(new Date(record.date), today) && record.completed
    );
    return {
      ...habit,
      isCompleted
    };
  });
  
  const completedCount = todayCompletions.filter(h => h.isCompleted).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  
  // Calculate longest current streak
  const longestStreak = Math.max(0, ...habits.map(habit => habit.streak));
  
  // Find the habit with the most consistency
  const mostConsistentHabit = habits.length > 0 
    ? habits.reduce((prev, current) => 
        (current.streak > prev.streak) ? current : prev
      ) 
    : null;
  
  // Find next habit to complete (one that isn't completed yet)
  const nextHabit = todayCompletions.find(h => !h.isCompleted);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <Card className="rounded-[12px] overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-primary/10 p-4 pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-lg font-semibold text-primary">{dayOfWeek}</h2>
                <p className="text-sm text-muted-foreground">{dateFormatted}</p>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {format(today, "h:mm a")}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center -mb-12">
              <ProgressRing 
                value={completionRate} 
                size={130} 
                strokeWidth={12}
                fgColor="hsl(var(--primary))"
                bgColor="rgba(255, 255, 255, 0.3)"
                showLabel={true}
                animate={true}
              />
            </div>
          </div>
          
          <div className="pt-16 pb-4 px-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-medium">{completedCount}/{totalHabits}</span>
                <span className="text-xs text-muted-foreground">Habits Completed</span>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10 mb-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <span className="text-xl font-medium">{longestStreak}</span>
                <span className="text-xs text-muted-foreground">Longest Streak</span>
              </div>
            </div>
            
            {/* Highlights Section */}
            <div className="space-y-3">
              {mostConsistentHabit && (
                <div className="flex items-center px-3 py-2.5 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-3">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Best Streak</h4>
                    <p className="text-xs text-muted-foreground">
                      {mostConsistentHabit.name} - {mostConsistentHabit.streak} days
                    </p>
                  </div>
                </div>
              )}
              
              {nextHabit && (
                <div className="flex items-center px-3 py-2.5 bg-primary/5 rounded-lg">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full mr-3",
                    completedCount === totalHabits 
                      ? "bg-success/10" 
                      : "bg-primary/10"
                  )}>
                    <Clock className={cn(
                      "h-4 w-4",
                      completedCount === totalHabits 
                        ? "text-success" 
                        : "text-primary"
                    )} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">
                      {completedCount === totalHabits 
                        ? "All Done!" 
                        : "Up Next"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {completedCount === totalHabits 
                        ? "You've completed all your habits for today" 
                        : nextHabit.name}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Dynamic Insight */}
              <div className="flex items-center px-3 py-2.5 bg-primary/5 rounded-lg">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full mr-3",
                  completionRate >= 70 
                    ? "bg-success/10" 
                    : completionRate >= 30 
                      ? "bg-primary/10" 
                      : "bg-destructive/10"
                )}>
                  <TrendingUp className={cn(
                    "h-4 w-4",
                    completionRate >= 70 
                      ? "text-success" 
                      : completionRate >= 30 
                        ? "text-primary" 
                        : "text-destructive"
                  )} />
                </div>
                <div>
                  <h4 className="text-sm font-medium">
                    {completionRate >= 70 
                      ? "Excellent Progress!" 
                      : completionRate >= 30 
                        ? "Making Progress" 
                        : "Getting Started"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {completionRate >= 70 
                      ? "Keep up the great work with your habits" 
                      : completionRate >= 30 
                        ? "You're building momentum with your habits" 
                        : "Start small and build consistency"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailySummary;