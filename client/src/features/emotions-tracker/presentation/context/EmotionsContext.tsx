import React, { createContext, useContext, useState, useCallback } from 'react';
import { Emotion, EmotionCategory, EmotionEntry, EmotionSummary, EmotionTrend } from '../../domain/models';
import { EmotionsService } from '../../application/EmotionsService';
import { ApiEmotionsRepository } from '../../infrastructure/ApiEmotionsRepository';

// Initialize dependencies
const emotionsRepository = new ApiEmotionsRepository();
const emotionsService = new EmotionsService(emotionsRepository, emotionsRepository);

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
    categoryId?: string
  ) => Promise<EmotionEntry>;
  updateEmotionEntry: (id: string, updates: Partial<EmotionEntry>) => Promise<EmotionEntry>;
  deleteEmotionEntry: (id: string) => Promise<boolean>;
  
  // Analytics
  getEmotionSummary: (date: string) => Promise<EmotionSummary>;
  getEmotionTrends: (fromDate: string, toDate: string) => Promise<EmotionTrend[]>;
  getMostFrequentEmotions: (fromDate: string, toDate: string, limit?: number) => Promise<{emotion: string, count: number}[]>;
  getHighestIntensityEmotions: (fromDate: string, toDate: string, limit?: number) => Promise<{emotion: string, intensity: number}[]>;
}

// Create the context
const EmotionsContext = createContext<EmotionsContextProps | undefined>(undefined);

// Provider component
export const EmotionsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Emotion queries
  const getAllEmotions = useCallback(async (): Promise<Emotion[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotions = await emotionsService.getAllEmotions();
      return emotions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getEmotionById = useCallback(async (id: string): Promise<Emotion | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotion = await emotionsService.getEmotionById(id);
      return emotion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getEmotionsByCategory = useCallback(async (category: EmotionCategory): Promise<Emotion[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotions = await emotionsService.getEmotionsByCategory(category);
      return emotions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Entry queries
  const getEmotionsByDate = useCallback(async (date: string): Promise<EmotionEntry[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const entries = await emotionsService.getEntriesByDate(1, date); // TODO: get real user ID
      return entries;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getEmotionsByDateRange = useCallback(async (fromDate: string, toDate: string): Promise<EmotionEntry[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const entries = await emotionsService.getEntriesByDateRange(1, fromDate, toDate); // TODO: get real user ID
      return entries;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getEntryById = useCallback(async (id: string): Promise<EmotionEntry | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const entry = await emotionsService.getEntryById(id);
      return entry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Entry commands
  const trackEmotion = useCallback(async (
    emotionId: string,
    emotionName: string,
    intensity: number,
    date: string,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[],
    categoryId?: string
  ): Promise<EmotionEntry> => {
    setIsLoading(true);
    setError(null);
    try {
      const entry = await emotionsService.trackEmotion(
        1, // TODO: get real user ID
        emotionId,
        emotionName,
        intensity,
        new Date(date),
        notes,
        triggers,
        copingMechanisms,
        categoryId
      );
      return entry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err; // Re-throw to allow caller to handle error
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateEmotionEntry = useCallback(async (id: string, updates: Partial<EmotionEntry>): Promise<EmotionEntry> => {
    setIsLoading(true);
    setError(null);
    try {
      const entry = await emotionsService.updateEmotionEntry(id, 1, updates); // TODO: get real user ID
      return entry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err; // Re-throw to allow caller to handle error
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteEmotionEntry = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await emotionsService.deleteEmotionEntry(id, 1); // TODO: get real user ID
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Analytics
  const getEmotionSummary = useCallback(async (date: string): Promise<EmotionSummary> => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await emotionsService.getSummaryForDate(1, date); // TODO: get real user ID
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
  }, []);
  
  const getEmotionTrends = useCallback(async (fromDate: string, toDate: string): Promise<EmotionTrend[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const trends = await emotionsService.getTrends(1, fromDate, toDate); // TODO: get real user ID
      return trends;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getMostFrequentEmotions = useCallback(async (
    fromDate: string,
    toDate: string,
    limit?: number
  ): Promise<{emotion: string, count: number}[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotions = await emotionsService.getMostFrequentEmotions(1, fromDate, toDate, limit); // TODO: get real user ID
      return emotions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getHighestIntensityEmotions = useCallback(async (
    fromDate: string,
    toDate: string,
    limit?: number
  ): Promise<{emotion: string, intensity: number}[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const emotions = await emotionsService.getHighestIntensityEmotions(1, fromDate, toDate, limit); // TODO: get real user ID
      return emotions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
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
  };
  
  return (
    <EmotionsContext.Provider value={value}>
      {children}
    </EmotionsContext.Provider>
  );
};

// Custom hook for consuming the context
// Using a function declaration instead of arrow function for consistent component exports
export function useEmotions(): EmotionsContextProps {
  const context = useContext(EmotionsContext);
  if (context === undefined) {
    throw new Error('useEmotions must be used within an EmotionsProvider');
  }
  return context;
}