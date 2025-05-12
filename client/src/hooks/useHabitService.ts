import { HabitService } from '@/services/HabitService';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from './use-auth';
import { useState, useEffect } from 'react';

/**
 * Custom hook for using the HabitService in React components
 * This follows the Hooks pattern in React and integrates with our Clean Architecture
 */
export function useHabitService() {
  const [habitService] = useState(() => new HabitService(queryClient));
  const { user } = useAuth();
  
  // Get all habits for the current user
  const {
    data: habits = [],
    isLoading: isLoadingHabits,
    isError: isErrorHabits,
    error: habitsError,
    refetch: refetchHabits
  } = habitService.getUserHabits();
  
  // Mutations for various operations
  const createHabitMutation = habitService.useCreateHabit();
  const toggleHabitCompletionMutation = habitService.useToggleHabitCompletion();
  const deleteHabitMutation = habitService.useDeleteHabit();
  
  // Convenience methods that wrap the mutations
  const createHabit = async (habitData: any) => {
    return await createHabitMutation.mutateAsync(habitData);
  };
  
  const toggleHabitCompletion = async (habitId: number, date: string, completed: boolean) => {
    return await toggleHabitCompletionMutation.mutateAsync({
      habitId,
      date,
      completed
    });
  };
  
  const deleteHabit = async (habitId: number) => {
    return await deleteHabitMutation.mutateAsync(habitId);
  };
  
  // Format today's date as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  // Handle habit toggle for today
  const toggleHabit = async (habitId: number, completed: boolean) => {
    return await toggleHabitCompletion(habitId, today, completed);
  };
  
  return {
    // Data
    habits,
    isLoadingHabits,
    isErrorHabits,
    habitsError,
    
    // Operations
    createHabit,
    toggleHabitCompletion,
    toggleHabit,
    deleteHabit,
    
    // Refresh
    refetchHabits,
    
    // Mutation states
    isCreating: createHabitMutation.isPending,
    isToggling: toggleHabitCompletionMutation.isPending,
    isDeleting: deleteHabitMutation.isPending
  };
}