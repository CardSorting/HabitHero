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
        console.log("HabitService: Creating habit with data:", habitData);
        
        try {
          console.log("HabitService: Before API request");
          const response = await apiRequest('POST', '/api/habits', habitData);
          console.log("HabitService: API Response received:", response);
          
          if (!response.ok) {
            // Try to get error details
            const errorText = await response.text();
            console.error("HabitService: API Error Response:", response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log("HabitService: Parsed response data:", data);
          return data as Habit;
        } catch (error) {
          console.error("HabitService: Error in createHabit mutation:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        console.log("HabitService: Habit created successfully:", data);
        // Invalidate habits query to refresh the list
        this.queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      },
      onError: (error) => {
        console.error("HabitService: Error in mutation handler:", error);
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