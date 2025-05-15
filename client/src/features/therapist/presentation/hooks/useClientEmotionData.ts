/**
 * Hook for accessing client emotion data directly from the emotions API
 */
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ID, DateString } from '../../domain/entities';

interface EmotionEntry {
  id: number;
  userId: number;
  date: string;
  emotionName: string;
  intensity: number;
  notes?: string;
  category?: string;
  createdAt: string;
}

interface EmotionTrend {
  date: string;
  emotions: Record<string, { count: number, averageIntensity: number }>;
  overallMood: string;
  dominantEmotion: string;
}

interface FrequentEmotion {
  emotion: string;
  count: number;
}

interface IntensityEmotion {
  emotion: string;
  intensity: number;
}

/**
 * Hook to directly access client emotion data from the regular client endpoints
 */
export const useClientEmotionData = (clientId: ID) => {
  // Default to the last 30 days
  const [dateRange, setDateRange] = useState<{
    startDate: DateString;
    endDate: DateString;
  }>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Query for emotion trends
  const {
    data: trendsData,
    isLoading: isTrendsLoading,
    error: trendsError,
    refetch: refetchTrends
  } = useQuery({
    queryKey: ['/api/emotions/analytics/trends', dateRange.startDate, dateRange.endDate, clientId],
    queryFn: async () => {
      // Log the actual params we're sending to help debug
      console.log(`Fetching emotion trends for userId=${clientId}, from=${dateRange.startDate}, to=${dateRange.endDate}`);
      const response = await fetch(`/api/emotions/analytics/trends?userId=${clientId}&from=${dateRange.startDate}&to=${dateRange.endDate}`);
      
      // Log response status to help debug
      console.log(`Emotion trends response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch emotion trends');
      }
      const data = await response.json();
      console.log('Trends data received:', data);
      return data as EmotionTrend[];
    },
    enabled: !!clientId && Number(clientId) > 0
  });

  // Query for frequent emotions
  const {
    data: frequentEmotions,
    isLoading: isFrequentLoading,
    error: frequentError
  } = useQuery({
    queryKey: ['/api/emotions/analytics/frequent', dateRange.startDate, dateRange.endDate, clientId],
    queryFn: async () => {
      console.log(`Fetching frequent emotions for userId=${clientId}`);
      const response = await fetch(`/api/emotions/analytics/frequent?userId=${clientId}&from=${dateRange.startDate}&to=${dateRange.endDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch frequent emotions');
      }
      const data = await response.json();
      console.log('Frequent emotions data:', data);
      return data as FrequentEmotion[];
    },
    enabled: !!clientId && Number(clientId) > 0
  });

  // Query for highest intensity emotions
  const {
    data: highIntensityEmotions,
    isLoading: isIntensityLoading,
    error: intensityError
  } = useQuery({
    queryKey: ['/api/emotions/analytics/highest-intensity', dateRange.startDate, dateRange.endDate, clientId],
    queryFn: async () => {
      console.log(`Fetching high intensity emotions for userId=${clientId}`);
      const response = await fetch(`/api/emotions/analytics/highest-intensity?userId=${clientId}&from=${dateRange.startDate}&to=${dateRange.endDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch highest intensity emotions');
      }
      const data = await response.json();
      console.log('High intensity emotions data:', data);
      return data as IntensityEmotion[];
    },
    enabled: !!clientId && Number(clientId) > 0
  });

  // Query for emotion entries
  const {
    data: entries,
    isLoading: isEntriesLoading,
    error: entriesError
  } = useQuery({
    queryKey: ['/api/emotions/entries/range', dateRange.startDate, dateRange.endDate, clientId],
    queryFn: async () => {
      console.log(`Fetching emotion entries for userId=${clientId}`);
      const response = await fetch(`/api/emotions/entries/range?userId=${clientId}&from=${dateRange.startDate}&to=${dateRange.endDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch emotion entries');
      }
      const data = await response.json();
      console.log('Emotion entries data:', data);
      return data as EmotionEntry[];
    },
    enabled: !!clientId && Number(clientId) > 0
  });

  // Function to set a new date range
  const setEmotionsDateRange = (startDate: DateString, endDate: DateString) => {
    setDateRange({ startDate, endDate });
  };

  // Function to set the date range to the last N days
  const setLastNDays = (days: number) => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ startDate, endDate });
  };

  // Get emotion intensity averages by date
  const getEmotionIntensityTrend = () => {
    if (!trendsData) return [];
    
    return trendsData.map(day => {
      // Calculate overall average intensity across all emotions
      let totalIntensity = 0;
      let count = 0;
      
      Object.values(day.emotions).forEach(({ averageIntensity, count: emotionCount }) => {
        totalIntensity += (averageIntensity * emotionCount);
        count += emotionCount;
      });
      
      const averageIntensity = count > 0 ? totalIntensity / count : 0;
      
      return {
        date: day.date,
        intensity: averageIntensity
      };
    });
  };

  // Get top emotions by frequency
  const getTopEmotionsByFrequency = () => {
    if (!frequentEmotions) return [];
    
    return frequentEmotions.slice(0, 5).map(({ emotion, count }) => ({
      name: emotion,
      value: count
    }));
  };

  // Get emotions by intensity
  const getEmotionsByIntensity = () => {
    if (!highIntensityEmotions) return [];
    
    return highIntensityEmotions.slice(0, 5).map(({ emotion, intensity }) => ({
      name: emotion,
      value: intensity
    }));
  };

  const isLoading = isTrendsLoading || isFrequentLoading || isIntensityLoading || isEntriesLoading;
  const error = trendsError || frequentError || intensityError || entriesError;

  // Function to get all emotion entries
  const getAllEmotionEntries = () => {
    return entries || [];
  };

  return {
    // Raw data
    trends: trendsData,
    frequentEmotions,
    highIntensityEmotions,
    entries,
    isLoading,
    error,
    refetch: refetchTrends,
    
    // Date range controls
    dateRange,
    setEmotionsDateRange,
    setLastNDays,
    
    // Processed data getters
    getEmotionIntensityTrend,
    getTopEmotionsByFrequency,
    getEmotionsByIntensity,
    getAllEmotionEntries
  };
};