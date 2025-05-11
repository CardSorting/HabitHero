import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useHabits } from "@/lib/useHabits";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

const DailySummary: React.FC = () => {
  const { habits, isLoading } = useHabits();
  const today = new Date();
  
  // Count completed habits for today
  const completedHabits = habits.filter(habit => 
    habit.completionRecords.some(
      record => isSameDay(new Date(record.date), today) && record.completed
    )
  ).length;
  
  const completionRate = habits.length > 0 
    ? Math.round((completedHabits / habits.length) * 100) 
    : 0;
  
  // Get the longest current streak across all habits
  const longestStreak = habits.reduce((max, habit) => 
    habit.streak > max ? habit.streak : max, 0);
  
  if (isLoading) {
    return (
      <Card className="rounded-[12px] bg-muted/30 h-48 animate-pulse" />
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <Card className="rounded-[12px] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-1">
                {format(today, "EEEE")}
              </h2>
              <p className="text-muted-foreground">
                {format(today, "MMMM d, yyyy")}
              </p>
              
              <div className="flex items-center mt-6 gap-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completion</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-semibold mr-1">{completedHabits}</span>
                    <span className="text-muted-foreground">/{habits.length}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Best Streak</p>
                  <div className="flex items-center">
                    <span className="text-3xl font-semibold">{longestStreak}</span>
                    <span className="text-muted-foreground ml-1">days</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative ml-4">
              <ProgressRing 
                value={completionRate} 
                size={120} 
                strokeWidth={12}
                fgColor={getColorByCompletion(completionRate)}
                showLabel={true}
                animate={true}
              />
              <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2",
                  completionRate >= 100 
                    ? "border-success bg-success text-white" 
                    : "border-muted-foreground bg-background text-muted-foreground"
                )}>
                  {completionRate >= 100 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary message based on completion */}
          <div className="mt-6 pt-4 border-t">
            {habits.length === 0 ? (
              <p className="text-muted-foreground">
                Add your first habit to start tracking your progress
              </p>
            ) : completionRate === 100 ? (
              <p className="text-success">
                Excellent! You've completed all your habits for today.
              </p>
            ) : completionRate >= 50 ? (
              <p className="text-primary">
                Good progress! Keep going to complete your remaining habits.
              </p>
            ) : completedHabits > 0 ? (
              <p className="text-muted-foreground">
                You're making progress. Focus on completing more habits today.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Time to start your day. Complete your first habit!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper function to get color based on completion rate
function getColorByCompletion(rate: number): string {
  if (rate >= 100) return "hsl(var(--success))";
  if (rate >= 75) return "hsl(var(--primary))";
  if (rate >= 50) return "hsl(var(--primary))";
  if (rate >= 25) return "hsl(var(--warning, 38 92% 50%))";
  return "hsl(var(--muted-foreground))";
}

export default DailySummary;