/**
 * Custom React hook for Crisis Tracker functionality
 * Provides UI layer with access to application services
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCrisisRepository } from '../../infrastructure/CrisisRepository';
import { CrisisService } from '../../application/CrisisService';
import { 
  CrisisEvent, 
  CrisisIntensity, 
  CrisisType,
  DateString, 
  TimeString,
  ID
} from '../../domain/models';
import { useToast } from '@/hooks/use-toast';

// Initialize the repository and service
const crisisRepository = new ApiCrisisRepository();
const crisisService = new CrisisService(crisisRepository);

export function useCrisisTracker(userId: ID) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Queries
  const { 
    data: crisisEvents,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useQuery({
    queryKey: ['/api/crisis-events'],
    queryFn: () => crisisService.getCrisisEvents(userId),
  });
  
  const getCrisisEventsByDateRange = useCallback((startDate: DateString, endDate: DateString) => {
    return useQuery({
      queryKey: ['/api/crisis-events/range', startDate, endDate],
      queryFn: () => crisisService.getCrisisEventsByDateRange(userId, startDate, endDate),
    });
  }, [userId]);
  
  const getCrisisEventById = useCallback((id: ID) => {
    return useQuery({
      queryKey: ['/api/crisis-events', id],
      queryFn: () => crisisService.getCrisisEventById(id),
    });
  }, []);
  
  const getAnalytics = useCallback((startDate?: DateString, endDate?: DateString) => {
    return useQuery({
      queryKey: ['/api/crisis-events/analytics/summary', startDate, endDate],
      queryFn: () => crisisService.getCrisisAnalytics(userId, startDate, endDate),
    });
  }, [userId]);
  
  const getTimePeriodSummary = useCallback((period: 'day' | 'week' | 'month' | 'year') => {
    return useQuery({
      queryKey: ['/api/crisis-events/analytics/period', period],
      queryFn: () => crisisService.getCrisisTimePeriodSummary(userId, period),
    });
  }, [userId]);
  
  // Mutations
  const createCrisisMutation = useMutation({
    mutationFn: (data: {
      crisisType: CrisisType;
      date: DateString;
      intensity: CrisisIntensity;
      time?: TimeString;
      duration?: number;
      notes?: string;
      symptoms?: string[];
      triggers?: string[];
      copingStrategiesUsed?: string[];
      copingStrategyEffectiveness?: number;
      helpSought?: boolean;
      medication?: boolean;
    }) => {
      return crisisService.createCrisisEvent(
        userId,
        data.crisisType,
        data.date,
        data.intensity,
        data.time,
        data.duration,
        data.notes,
        data.symptoms,
        data.triggers,
        data.copingStrategiesUsed,
        data.copingStrategyEffectiveness,
        data.helpSought || false,
        data.medication || false
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-events'] });
      toast({
        title: "Success",
        description: "Crisis event recorded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record crisis event",
        variant: "destructive",
      });
    }
  });
  
  const updateCrisisMutation = useMutation({
    mutationFn: (data: {
      id: ID;
      crisisType?: CrisisType;
      date?: DateString;
      time?: TimeString;
      intensity?: CrisisIntensity;
      duration?: number;
      notes?: string;
      symptoms?: string[];
      triggers?: string[];
      copingStrategiesUsed?: string[];
      copingStrategyEffectiveness?: number;
      helpSought?: boolean;
      medication?: boolean;
    }) => {
      return crisisService.updateCrisisEvent(
        data.id,
        data.crisisType,
        data.date,
        data.time,
        data.intensity,
        data.duration,
        data.notes,
        data.symptoms,
        data.triggers,
        data.copingStrategiesUsed,
        data.copingStrategyEffectiveness,
        data.helpSought,
        data.medication
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-events', variables.id] });
      toast({
        title: "Success",
        description: "Crisis event updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update crisis event",
        variant: "destructive",
      });
    }
  });
  
  const deleteCrisisMutation = useMutation({
    mutationFn: (id: ID) => {
      return crisisService.deleteCrisisEvent(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-events', id] });
      toast({
        title: "Success",
        description: "Crisis event deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete crisis event",
        variant: "destructive",
      });
    }
  });
  
  return {
    // Queries
    crisisEvents,
    isLoadingEvents,
    eventsError,
    getCrisisEventsByDateRange,
    getCrisisEventById,
    getAnalytics,
    getTimePeriodSummary,
    
    // Mutations
    createCrisis: createCrisisMutation.mutate,
    updateCrisis: updateCrisisMutation.mutate,
    deleteCrisis: deleteCrisisMutation.mutate,
    isCreating: createCrisisMutation.isPending,
    isUpdating: updateCrisisMutation.isPending,
    isDeleting: deleteCrisisMutation.isPending,
  };
}