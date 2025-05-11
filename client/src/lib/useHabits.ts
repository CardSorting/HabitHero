import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Habit } from "@/lib/types";
import { startOfDay, format, addDays } from "date-fns";

export function useHabits() {
  const queryClient = useQueryClient();
  
  // Fetch all habits
  const { data: habits = [], isLoading, error } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  // Toggle habit completion for today
  const toggleHabitCompletion = async (habitId: number, completed: boolean) => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    const response = await apiRequest("POST", `/api/habits/${habitId}/toggle`, {
      date: today,
      completed,
    });
    
    return response.json();
  };

  const toggleMutation = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: number; completed: boolean }) => 
      toggleHabitCompletion(habitId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });

  // Add a new habit
  const addHabit = async (habitData: any) => {
    const response = await apiRequest("POST", "/api/habits", habitData);
    return response.json();
  };

  const addHabitMutation = useMutation({
    mutationFn: (habitData: any) => addHabit(habitData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });

  // Clear all habits
  const clearAllHabits = async () => {
    const response = await apiRequest("DELETE", "/api/habits");
    return response.json();
  };

  const clearHabitsMutation = useMutation({
    mutationFn: clearAllHabits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });

  // Clear only in-progress status for the current day
  const clearHabitsInProgress = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const response = await apiRequest("POST", "/api/habits/reset", { date: today });
    return response.json();
  };

  const clearInProgressMutation = useMutation({
    mutationFn: clearHabitsInProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });

  return {
    habits,
    isLoading,
    error,
    toggleHabitCompletion: (habitId: number, completed: boolean) => 
      toggleMutation.mutateAsync({ habitId, completed }),
    addHabit: (habitData: any) => addHabitMutation.mutateAsync(habitData),
    clearAllHabits: () => clearHabitsMutation.mutateAsync(),
    clearHabitsInProgress: () => clearInProgressMutation.mutateAsync(),
  };
}
