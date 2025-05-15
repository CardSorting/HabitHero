/**
 * Hook for accessing client analytics data
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTherapistService } from './useTherapistContext';
import { useAuth } from '@/hooks/use-auth';
import { ID, DateString, ClientAnalytics } from '../../domain/entities';
import { apiRequest } from '@/lib/queryClient';

interface UseClientAnalyticsProps {
  clientId: ID;
}

/**
 * Hook for accessing analytics data for a client
 */
export const useClientAnalytics = ({ clientId }: UseClientAnalyticsProps) => {
  const { user } = useAuth();
  const therapistService = useTherapistService();
  
  // Default to the last 30 days
  const [dateRange, setDateRange] = useState<{
    startDate: DateString;
    endDate: DateString;
  }>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Therapist ID from authenticated user
  const therapistId = user?.id as ID;

  // Query for fetching analytics for a client
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['/api/therapist/clients', clientId, 'analytics', dateRange.startDate, dateRange.endDate],
    queryFn: () => therapistService.getClientAnalytics(
      therapistId,
      clientId,
      dateRange.startDate,
      dateRange.endDate
    ),
    enabled: !!therapistId && !!clientId
  });

  // Query for fetching crisis events specifically for the client
  const {
    data: crisisEvents,
    isLoading: isLoadingCrisisEvents,
  } = useQuery({
    queryKey: ['/api/crisis-events', 'client', clientId, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      // Make sure we have permission to view this client's data
      const isAuthorized = await therapistService.isAuthorizedForClient(
        therapistId,
        clientId
      );
      
      if (!isAuthorized) {
        throw new Error('Unauthorized to view client data');
      }
      
      console.log('Fetching crisis events for client:', clientId);
      const url = `/api/crisis-events/range?userId=${clientId}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      const result = await apiRequest(url);
      console.log('Crisis events result:', result);
      return result;
    },
    enabled: !!therapistId && !!clientId
  });

  // Combine analytics with crisis events data
  console.log('Original analytics:', analytics);
  console.log('Crisis events data:', crisisEvents);
  
  const combinedAnalytics = analytics ? {
    ...analytics,
    crisisEvents: {
      ...analytics.crisisEvents,
      events: crisisEvents || [],
      count: crisisEvents?.length || (analytics.crisisEvents?.count || 0),
    }
  } : undefined;
  
  console.log('Combined analytics:', combinedAnalytics);
  
  // If analytics already contains events, we don't need to use the separate crisis events query
  if (analytics?.crisisEvents?.events && analytics.crisisEvents.events.length > 0) {
    console.log('Using events from analytics:', analytics.crisisEvents.events);
  }

  // Function to set a new date range
  const setAnalyticsDateRange = (startDate: DateString, endDate: DateString) => {
    setDateRange({ startDate, endDate });
  };

  // Function to set the date range to the last N days
  const setLastNDays = (days: number) => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ startDate, endDate });
  };

  // Data manipulation and formatting functions

  // Get emotion intensity averages by date
  const getEmotionIntensityTrend = (data?: ClientAnalytics) => {
    if (!data || !data.emotionTrends) return [];
    
    return data.emotionTrends.map(trend => ({
      date: trend.date,
      intensity: trend.averageIntensity
    }));
  };

  // Get crisis event counts by type
  const getCrisisEventsByType = (data?: ClientAnalytics) => {
    if (!data || !data.crisisEvents) return [];
    
    return Object.entries(data.crisisEvents.byType).map(([type, count]) => ({
      type,
      count
    }));
  };

  // Get overall treatment plan progress
  const getTreatmentProgress = (data?: ClientAnalytics) => {
    if (!data || !data.treatmentProgress) {
      return { 
        completionRate: 0,
        goalsAchieved: 0,
        totalGoals: 0
      };
    }
    
    const { goalsAchieved, totalGoals } = data.treatmentProgress;
    const completionRate = totalGoals > 0 ? (goalsAchieved / totalGoals) * 100 : 0;
    
    return {
      completionRate,
      goalsAchieved,
      totalGoals
    };
  };

  return {
    // Raw data
    analytics: combinedAnalytics,
    isLoadingAnalytics: isLoadingAnalytics || isLoadingCrisisEvents,
    analyticsError,
    refetchAnalytics,
    
    // Date range controls
    dateRange,
    setAnalyticsDateRange,
    setLastNDays,
    
    // Processed data getters
    getEmotionIntensityTrend,
    getCrisisEventsByType,
    getTreatmentProgress
  };
};