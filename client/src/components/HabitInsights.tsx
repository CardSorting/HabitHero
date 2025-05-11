import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAnalytics } from "@/lib/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Calendar, 
  CheckCircle,
  AlertTriangle 
} from "lucide-react";
import { Link } from "wouter";

interface HabitInsightsProps {
  habitId?: number;
  compact?: boolean;
}

const HabitInsights: React.FC<HabitInsightsProps> = ({ 
  habitId,
  compact = false
}) => {
  const { 
    analyticsData, 
    isLoading, 
    getHabitPerformance 
  } = useAnalytics();
  
  // If a specific habit is provided, filter the insights for just that habit
  const specificHabit = habitId && !isLoading
    ? getHabitPerformance().find(h => h.id === habitId)
    : undefined;
  
  if (isLoading) {
    return (
      <div className={`space-y-4 ${compact ? 'max-w-md' : 'w-full'}`}>
        <Skeleton className="h-12 w-full rounded-[12px]" />
        <Skeleton className="h-24 w-full rounded-[12px]" />
      </div>
    );
  }
  
  // Handle no data case
  if (!analyticsData && !specificHabit) {
    return (
      <div className={`text-center p-4 ${compact ? 'max-w-md' : 'w-full'}`}>
        <p className="text-muted-foreground">
          Not enough data to generate insights yet.
        </p>
      </div>
    );
  }
  
  return (
    <motion.div
      className={`space-y-4 ${compact ? 'max-w-md' : 'w-full'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* For specific habit insights */}
      {specificHabit && (
        <Card className="rounded-[12px]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              <span>Performance Insights</span>
            </CardTitle>
            <CardDescription>
              For {specificHabit.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <div className="flex items-center gap-2">
                <Badge className={
                  specificHabit.value >= 70 
                    ? "bg-success/10 text-success border-success" 
                    : specificHabit.value >= 40 
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-destructive/10 text-destructive border-destructive"
                }>
                  {specificHabit.value}%
                </Badge>
                {specificHabit.value >= 70 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : specificHabit.value < 40 ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : null}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Streak</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                {specificHabit.streak} days
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Completions</span>
              <Badge variant="outline">
                {specificHabit.completions} times
              </Badge>
            </div>
            
            <div className="border-t pt-3 mt-3">
              {specificHabit.value >= 70 ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Great job! You're consistently completing this habit. Keep it up!
                  </p>
                </div>
              ) : specificHabit.value < 40 ? (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm">
                    This habit needs attention. Try setting reminders or making it easier to complete.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm">
                    You're doing okay with this habit. Set a goal to improve consistency.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* General insights (when no specific habit is selected) */}
      {!specificHabit && analyticsData && (
        <Card className="rounded-[12px]">
          <CardHeader className={compact ? "pb-2 px-4 pt-4" : "pb-2"}>
            <CardTitle className={`flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <Award className="h-5 w-5 text-primary" />
              <span>Habit Insights</span>
            </CardTitle>
            {!compact && (
              <CardDescription>
                Your progress at a glance
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className={`space-y-3 ${compact ? "px-4 pt-2 pb-4" : ""}`}>
            {/* Only show in non-compact mode */}
            {!compact && (
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Completion Rate</div>
                  <div className="text-xl font-semibold">{analyticsData.completionRate}%</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Longest Streak</div>
                  <div className="text-xl font-semibold">{analyticsData.longestStreak} days</div>
                </div>
              </div>
            )}
            
            {analyticsData.bestHabit && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Performing</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-success/10 text-success border-success">
                    {analyticsData.bestHabit.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(analyticsData.bestHabit.completionRate)}%
                  </span>
                </div>
              </div>
            )}
            
            {analyticsData.worstHabit && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Needs Improvement</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-destructive/10 text-destructive border-destructive">
                    {analyticsData.worstHabit.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(analyticsData.worstHabit.completionRate)}%
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Habits</span>
              <Badge variant="outline">
                {analyticsData.totalHabits}
              </Badge>
            </div>
            
            {compact && (
              <div className="mt-4 text-center">
                <Link href="/analytics" className="text-sm text-primary hover:underline">
                  View detailed analytics
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default HabitInsights;