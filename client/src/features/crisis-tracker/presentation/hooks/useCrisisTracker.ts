/**
 * Custom React hook for Crisis Tracker functionality
 * Provides UI layer with access to application services
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { CrisisService } from '../../application/CrisisService';
import { ApiCrisisRepository } from '../../infrastructure/ApiCrisisRepository';
import { CrisisEvent, CrisisType, CrisisIntensity } from '../../domain/models';
import { ID, DateString, TimeString } from '../../domain/CrisisRepository';

export function useCrisisTracker(userId: ID) {
  const queryClient = useQueryClient();
  
  // Initialize services
  const crisisService = useMemo(() => {
    const repository = new ApiCrisisRepository();
    return new CrisisService(repository);
  }, []);

  // Query for fetching all crisis events
  const { 
    data: crisisEvents = [], 
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['/api/crisis-events'],
    queryFn: () => crisisService.getAllCrisisEvents({ userId })
  });

  // Callback for fetching crisis events by date range
  const getCrisisEventsByDateRange = useCallback((startDate: DateString, endDate: DateString) => {
    return crisisService.getCrisisEventsByDateRange({
      userId,
      startDate,
      endDate
    });
  }, [crisisService, userId]);

  // Callback for fetching a single crisis event by ID
  const getCrisisEventById = useCallback((id: ID) => {
    return crisisService.getCrisisEventById({ id });
  }, [crisisService]);

  // Callback for fetching analytics data
  const getAnalytics = useCallback((startDate?: DateString, endDate?: DateString) => {
    return crisisService.getCrisisAnalytics({
      userId,
      startDate,
      endDate
    });
  }, [crisisService, userId]);

  // Mutation for creating crisis events
  const { mutate: createCrisis, isPending: isCreating } = useMutation({
    mutationFn: (data: {
      userId: ID;
      crisisType: CrisisType;
      date: DateString;
      time?: TimeString;
      intensity: CrisisIntensity;
      duration?: number;
      notes?: string;
      symptoms?: string[];
      triggers?: string[];
      copingStrategiesUsed?: string[];
      copingStrategyEffectiveness?: number;
      helpSought: boolean;
      medication: boolean;
    }) => {
      return crisisService.createCrisisEvent({
        userId: data.userId,
        type: data.crisisType,
        date: data.date,
        time: data.time,
        intensity: data.intensity,
        duration: data.duration,
        notes: data.notes,
        symptoms: data.symptoms,
        triggers: data.triggers,
        copingStrategiesUsed: data.copingStrategiesUsed,
        copingStrategyEffectiveness: data.copingStrategyEffectiveness,
        helpSought: data.helpSought,
        medication: data.medication
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-events'] });
    }
  });

  // Mutation for updating crisis events
  const { mutate: updateCrisis, isPending: isUpdating } = useMutation({
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
      return crisisService.updateCrisisEvent({
        id: data.id,
        type: data.crisisType,
        date: data.date,
        time: data.time,
        intensity: data.intensity,
        duration: data.duration,
        notes: data.notes,
        symptoms: data.symptoms,
        triggers: data.triggers,
        copingStrategiesUsed: data.copingStrategiesUsed,
        copingStrategyEffectiveness: data.copingStrategyEffectiveness,
        helpSought: data.helpSought,
        medication: data.medication
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-events'] });
    }
  });

  // Mutation for deleting crisis events
  const { mutate: deleteCrisis, isPending: isDeleting } = useMutation({
    mutationFn: (id: ID) => {
      return crisisService.deleteCrisisEvent({ id });
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-events'] });
    }
  });

  // Return hook interface
  return {
    crisisEvents,
    isLoadingEvents,
    eventsError,
    refetchEvents,
    getCrisisEventsByDateRange,
    getCrisisEventById,
    getAnalytics,
    createCrisis,
    isCreating,
    updateCrisis,
    isUpdating,
    deleteCrisis,
    isDeleting
  };
}