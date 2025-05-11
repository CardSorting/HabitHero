import React from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { useHabits } from "@/lib/useHabits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const Progress: React.FC = () => {
  const { habits, isLoading } = useHabits();
  
  const today = new Date();
  const daysInCurrentMonth = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today)
  });
  
  const monthlyData = daysInCurrentMonth.map(day => {
    const dateStr = format(day, "MMM dd");
    
    const completedCount = habits.reduce((count, habit) => {
      const isCompleted = habit.completionRecords.some(
        record => isSameDay(new Date(record.date), day) && record.completed
      );
      return isCompleted ? count + 1 : count;
    }, 0);
    
    return {
      date: dateStr,
      shortDate: format(day, "dd"),
      completed: completedCount
    };
  });
  
  // Calculate monthly average
  const totalCompletions = monthlyData.reduce((sum, day) => sum + day.completed, 0);
  const averageCompletions = habits.length > 0 
    ? (totalCompletions / (monthlyData.length * habits.length) * 100).toFixed(1) 
    : "0";
  
  // Calculate current streak
  const getCurrentStreak = () => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(habit => habit.streak));
  };

  if (isLoading) {
    return (
      <>
        <Header title="Progress" />
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-36 rounded-[12px]" />
              <Skeleton className="h-36 rounded-[12px]" />
            </div>
            <Skeleton className="h-72 w-full rounded-[12px]" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Progress" />
      <motion.main 
        className="flex-1 px-6 py-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="grid grid-cols-2 gap-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-[12px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageCompletions}%</div>
              <p className="text-xs text-muted-foreground mt-1">Habit completion rate</p>
            </CardContent>
          </Card>
          
          <Card className="rounded-[12px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getCurrentStreak()}</div>
              <p className="text-xs text-muted-foreground mt-1">Consecutive days</p>
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
              <CardTitle>Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="shortDate" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} completed`, 'Habits']}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Bar 
                      dataKey="completed" 
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
      </motion.main>
    </>
  );
};

export default Progress;
