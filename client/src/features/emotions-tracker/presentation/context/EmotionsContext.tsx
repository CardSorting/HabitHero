import React, { createContext, useContext, useState, useCallback } from 'react';
import { Emotion, EmotionEntry, EmotionSummary, EmotionTrend } from '../../domain/models';
import { EmotionCategory } from '../../domain/emotion-categories-analysis';
import { EmotionsService } from '../../application/EmotionsService';
import { ApiEmotionsRepository } from '../../infrastructure/ApiEmotionsRepository';

// Dependencies will be injected through props

// Context interface
export interface EmotionsContextProps {
  // State values
  isLoading: boolean;
  error: string | null;
  
  // Emotion queries
  getAllEmotions: () => Promise<Emotion[]>;
  getEmotionById: (id: string) => Promise<Emotion | null>;
  getEmotionsByCategory: (category: EmotionCategory) => Promise<Emotion[]>;
  
  // Entry queries
  getEmotionsByDate: (date: string) => Promise<EmotionEntry[]>;
  getEmotionsByDateRange: (fromDate: string, toDate: string) => Promise<EmotionEntry[]>;
  getEntryById: (id: string) => Promise<EmotionEntry | null>;
  
  // Entry commands
  trackEmotion: (
    emotionId: string,
    emotionName: string,
    intensity: number,
    date: string,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[],
    categoryId?: string,
    time?: string
  ) => Promise<EmotionEntry>;
  updateEmotionEntry: (id: string, updates: Partial<EmotionEntry>) => Promise<EmotionEntry>;
  deleteEmotionEntry: (id: string) => Promise<boolean>;
  
  // Analytics
  getEmotionSummary: (date: string) => Promise<EmotionSummary>;
  getEmotionTrends: (fromDate: string, toDate: string) => Promise<EmotionTrend[]>;
  getMostFrequentEmotions: (fromDate: string, toDate: string, limit?: number) => Promise<{emotion: string, count: number}[]>;
  getHighestIntensityEmotions: (fromDate: string, toDate: string, limit?: number) => Promise<{emotion: string, intensity: number}[]>;
  getEmotionEntriesForDateRange: (fromDate: string, toDate: string) => Promise<EmotionEntry[]>;
}

// Create the context
const EmotionsContext = createContext<EmotionsContextProps | undefined>(undefined);

// Provider component interface
interface EmotionsProviderProps {
  children: React.ReactNode;
  service: EmotionsService;
}

// Provider component
export const EmotionsProvider: React.FC<EmotionsProviderProps> = ({ children, service }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Emotion queries
  const getAllEmotions = useCallback(async (): Promise<Emotion[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotions = await service.getAllEmotions();
      return emotions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  const getEmotionById = useCallback(async (id: string): Promise<Emotion | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotion = await service.getEmotionById(id);
      return emotion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  const getEmotionsByCategory = useCallback(async (category: EmotionCategory): Promise<Emotion[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotions = await service.getEmotionsByCategory(category);
      return emotions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  // Entry queries
  const getEmotionsByDate = useCallback(async (date: string): Promise<EmotionEntry[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const entries = await service.getEntriesByDate(1, date); // TODO: get real user ID
      return entries;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  const getEmotionsByDateRange = useCallback(async (fromDate: string, toDate: string): Promise<EmotionEntry[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const entries = await service.getEntriesByDateRange(1, fromDate, toDate); // TODO: get real user ID
      return entries;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  const getEntryById = useCallback(async (id: string): Promise<EmotionEntry | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const entry = await service.getEntryById(id);
      return entry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  // Entry commands
  const trackEmotion = useCallback(async (
    emotionId: string,
    emotionName: string,
    intensity: number,
    date: string,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[],
    categoryId?: string,
    time?: string
  ): Promise<EmotionEntry> => {
    setIsLoading(true);
    setError(null);
    try {
      const entry = await service.trackEmotion(
        1, // TODO: get real user ID
        emotionId,
        emotionName,
        intensity,
        date,
        notes,
        triggers,
        copingMechanisms,
        categoryId,
        time
      );
      return entry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err; // Re-throw to allow caller to handle error
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  const updateEmotionEntry = useCallback(async (id: string, updates: Partial<EmotionEntry>): Promise<EmotionEntry> => {
    setIsLoading(true);
    setError(null);
    try {
      const entry = await service.updateEmotionEntry(id, 1, updates); // TODO: get real user ID
      return entry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err; // Re-throw to allow caller to handle error
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  const deleteEmotionEntry = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await service.deleteEmotionEntry(id, 1); // TODO: get real user ID
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  // Analytics
  const getEmotionSummary = useCallback(async (date: string): Promise<EmotionSummary> => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await service.getSummaryForDate(1, date); // TODO: get real user ID
      return summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return {
        date,
        dominantEmotion: null,
        highestIntensity: null,
        averageIntensity: null,
        emotionCount: 0,
        entryIds: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  const getEmotionTrends = useCallback(async (fromDate: string, toDate: string): Promise<EmotionTrend[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const trends = await service.getTrends(1, fromDate, toDate); // TODO: get real user ID
      return trends;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  const getEmotionEntriesForDateRange = useCallback(async (fromDate: string, toDate: string): Promise<EmotionEntry[]> => {
    setIsLoading(true);
    setError(null);
    try {
      // We already have a function for this exact purpose
      return await getEmotionsByDateRange(fromDate, toDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getEmotionsByDateRange]);
  
  const getMostFrequentEmotions = useCallback(async (
    fromDate: string,
    toDate: string,
    limit?: number
  ): Promise<{emotion: string, count: number}[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotions = await service.getMostFrequentEmotions(1, fromDate, toDate, limit); // TODO: get real user ID
      return emotions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  const getHighestIntensityEmotions = useCallback(async (
    fromDate: string,
    toDate: string,
    limit?: number
  ): Promise<{emotion: string, intensity: number}[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotions = await service.getHighestIntensityEmotions(1, fromDate, toDate, limit); // TODO: get real user ID
      return emotions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [service]);
  
  // Context value
  const value: EmotionsContextProps = {
    isLoading,
    error,
    getAllEmotions,
    getEmotionById,
    getEmotionsByCategory,
    getEmotionsByDate,
    getEmotionsByDateRange,
    getEntryById,
    trackEmotion,
    updateEmotionEntry,
    deleteEmotionEntry,
    getEmotionSummary,
    getEmotionTrends,
    getMostFrequentEmotions,
    getHighestIntensityEmotions,
    getEmotionEntriesForDateRange,
  };
  
  return (
    <EmotionsContext.Provider value={value}>
      {children}
    </EmotionsContext.Provider>
  );
};

// Custom hook for consuming the context
// Export as function instead of const for HMR compatibility
export function useEmotions() {
  const context = useContext(EmotionsContext);
  if (context === undefined) {
    throw new Error('useEmotions must be used within an EmotionsProvider');
  }
  return context;
}