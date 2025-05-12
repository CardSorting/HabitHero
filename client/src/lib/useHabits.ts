import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Habit } from "@/lib/types";
import { startOfDay, format, addDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export function useHabits() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
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
    console.log("Adding habit with data:", habitData);
    try {
      // Ensure userId is included in the habit data
      const dataWithUserId = {
        ...habitData,
        userId: user?.id
      };
      console.log("Adding habit with user ID:", dataWithUserId);
      
      const response = await apiRequest("POST", "/api/habits", dataWithUserId);
      console.log("Habit creation response:", response);
      return response.json();
    } catch (error) {
      console.error("Error in addHabit function:", error);
      throw error;
    }
  };

  const addHabitMutation = useMutation({
    mutationFn: (habitData: any) => addHabit(habitData),
    onSuccess: (data) => {
      console.log("Habit created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
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

  // Add update habit functionality
  const updateHabit = async (id: number, habitData: Partial<Habit>) => {
    const response = await apiRequest("PATCH", `/api/habits/${id}`, habitData);
    return response.json();
  };

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, habitData }: { id: number; habitData: Partial<Habit> }) => 
      updateHabit(id, habitData),
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
    updateHabit: (id: number, habitData: Partial<Habit>) => 
      updateHabitMutation.mutateAsync({ id, habitData }),
    clearAllHabits: () => clearHabitsMutation.mutateAsync(),
    clearHabitsInProgress: () => clearInProgressMutation.mutateAsync(),
  };
}
