import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { useHabits } from "./useHabits";

interface HabitPerformance {
  id: number;
  name: string;
  completionRate: number;
  streak: number;
}

interface AnalyticsData {
  totalHabits: number;
  totalCompletions: number;
  completionRate: number;
  longestStreak: number;
  bestHabit: HabitPerformance | null;
  worstHabit: HabitPerformance | null;
  habitPerformance: HabitPerformance[];
}

export function useAnalytics() {
  const { habits, isLoading: habitsLoading } = useHabits();
  
  // Fetch analytics data from the API
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
    enabled: !habitsLoading && habits.length > 0
  });

  // Calculate trend data based on timeframe
  const getTrendData = (timeframe: "week" | "month" | "year") => {
    if (!habits || habits.length === 0) return [];
    
    const today = new Date();
    let dateRange;
    
    // Get date range based on timeframe
    switch (timeframe) {
      case "week":
        dateRange = eachDayOfInterval({
          start: subDays(today, 6),
          end: today
        });
        break;
      case "month":
        dateRange = eachDayOfInterval({
          start: startOfMonth(today),
          end: endOfMonth(today)
        });
        break;
      case "year":
        // For year, we'll use the months as data points
        dateRange = Array.from({ length: 12 }, (_, i) => new Date(today.getFullYear(), i, 1));
        break;
    }
    
    return dateRange.map(date => {
      let label;
      if (timeframe === "week") {
        label = format(date, "EEE");
      } else if (timeframe === "month") {
        label = format(date, "d");
      } else {
        label = format(date, "MMM");
      }
      
      const completedCount = habits.reduce((count, habit) => {
        let isCompleted;
        
        if (timeframe === "year") {
          // For yearly view, check if there are any completions in this month
          const month = date.getMonth();
          const year = date.getFullYear();
          isCompleted = habit.completionRecords.some(
            record => {
              const recordDate = new Date(record.date);
              return recordDate.getMonth() === month && 
                     recordDate.getFullYear() === year && 
                     record.completed;
            }
          );
        } else {
          // For weekly/monthly view, check specific day
          isCompleted = habit.completionRecords.some(
            record => isSameDay(new Date(record.date), date) && record.completed
          );
        }
        
        return isCompleted ? count + 1 : count;
      }, 0);
      
      const completionRate = habits.length > 0 ? 
        (completedCount / habits.length) * 100 : 0;
      
      return {
        name: label,
        value: Math.round(completionRate),
        completed: completedCount,
        date: date.toISOString(),
        fullDate: format(date, "MMM dd, yyyy")
      };
    });
  };
  
  // Calculate habit-specific performance
  const getHabitPerformance = () => {
    if (!habits || habits.length === 0) return [];
    
    return habits.map(habit => {
      const completions = habit.completionRecords.filter(record => record.completed).length;
      const total = 30; // Assuming monthly view for simplicity
      const completionRate = total > 0 ? (completions / total) * 100 : 0;
      
      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        value: Math.round(completionRate),
        completions,
        streak: habit.streak
      };
    });
  };

  // Generate heatmap data for calendar view
  const getHeatmapData = () => {
    if (!habits || habits.length === 0) return {};
    
    const heatmapData: Record<string, number> = {};
    
    habits.forEach(habit => {
      habit.completionRecords.forEach(record => {
        if (record.completed) {
          const dateStr = format(new Date(record.date), "yyyy-MM-dd");
          if (!heatmapData[dateStr]) {
            heatmapData[dateStr] = 0;
          }
          heatmapData[dateStr] += 1;
        }
      });
    });
    
    return heatmapData;
  };
  
  return {
    analyticsData,
    isLoading: habitsLoading || analyticsLoading,
    getTrendData,
    getHabitPerformance,
    getHeatmapData
  };
}