/**
 * Hook for accessing client analytics data
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTherapistService } from './useTherapistContext';
import { useAuth } from '@/hooks/use-auth';
import { ID, DateString, ClientAnalytics } from '../../domain/entities';

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
    analytics,
    isLoadingAnalytics,
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