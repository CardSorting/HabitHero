import { apiRequest } from '@/lib/queryClient';
import { Habit, InsertHabit } from '@/lib/types';
import { useMutation, useQuery, QueryClient } from '@tanstack/react-query';

/**
 * Service for interacting with the Habit API
 * Following Clean Architecture principles on the client side
 */
export class HabitService {
  private queryClient: QueryClient;
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }
  
  /**
   * Get all habits for the current user
   */
  getUserHabits() {
    return useQuery({
      queryKey: ['/api/habits'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/habits');
        const data = await response.json();
        return data as Habit[];
      }
    });
  }
  
  /**
   * Get a habit by ID
   */
  getHabitById(id: number) {
    return useQuery({
      queryKey: ['/api/habits', id],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/habits/${id}`);
        const data = await response.json();
        return data as Habit;
      },
      enabled: !!id
    });
  }
  
  /**
   * Create a new habit
   */
  useCreateHabit() {
    return useMutation({
      mutationFn: async (habitData: InsertHabit) => {
        const response = await apiRequest('POST', '/api/habits', habitData);
        const data = await response.json();
        return data as Habit;
      },
      onSuccess: () => {
        // Invalidate habits query to refresh the list
        this.queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      }
    });
  }
  
  /**
   * Toggle habit completion for a specific date
   */
  useToggleHabitCompletion() {
    return useMutation({
      mutationFn: async ({ 
        habitId, 
        date, 
        completed 
      }: { 
        habitId: number; 
        date: string; 
        completed: boolean 
      }) => {
        const response = await apiRequest('POST', `/api/habits/${habitId}/toggle`, { date, completed });
        const data = await response.json();
        return data as Habit;
      },
      onSuccess: (data) => {
        // Invalidate specific habit query to refresh it
        this.queryClient.invalidateQueries({ queryKey: ['/api/habits', data.id] });
        // Also invalidate the all habits query
        this.queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      }
    });
  }
  
  /**
   * Delete a habit
   */
  useDeleteHabit() {
    return useMutation({
      mutationFn: async (habitId: number) => {
        const response = await apiRequest('DELETE', `/api/habits/${habitId}`);
        return response.json();
      },
      onSuccess: () => {
        // Invalidate habits query to refresh the list
        this.queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      }
    });
  }
}