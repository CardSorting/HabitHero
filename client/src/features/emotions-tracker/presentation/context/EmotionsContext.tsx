// EmotionsContext - Context API for managing emotions tracking state
// Presentation layer - this is what the UI components will interact with

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  DateString, 
  EmotionDTO, 
  EmotionTrackingEntry,
  EmotionSummaryDTO,
  EmotionTrendDTO,
  predefinedEmotions,
  EmotionCategory
} from '../../domain/models';
import { ApiEmotionsRepository } from '../../infrastructure/ApiEmotionsRepository';
import { EmotionsService } from '../../application/EmotionsService';
import { format, subDays, addDays, isToday, startOfWeek, endOfWeek, parseISO } from 'date-fns';

// Define the context interface
interface EmotionsContextType {
  // State getters
  emotions: EmotionDTO[];
  trackedEmotions: EmotionTrackingEntry[];
  summaryData: EmotionSummaryDTO | null;
  trendData: EmotionTrendDTO[];
  selectedDate: Date;
  dateRange: {from: Date, to: Date};
  isLoading: boolean;
  
  // State setters
  setSelectedDate: (date: Date) => void;
  setDateRange: (from: Date, to: Date) => void;
  
  // Actions
  trackEmotion: (
    emotionId: string, 
    intensity: number, 
    notes?: string, 
    triggers?: string[],
    copingMechanisms?: string[]
  ) => Promise<EmotionTrackingEntry>;
  updateEmotionEntry: (
    entryId: number,
    intensity?: number,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[]
  ) => Promise<EmotionTrackingEntry>;
  deleteEmotionEntry: (entryId: number) => Promise<boolean>;
  
  // Helpers
  getEmotionById: (id: string) => EmotionDTO | undefined;
  getEmotionsForDate: (date: Date) => EmotionTrackingEntry[];
  getEmotionsForCategory: (category: EmotionCategory) => EmotionDTO[];
  refreshData: () => Promise<void>;
}

// Create the context with undefined default
const EmotionsContext = createContext<EmotionsContextType | undefined>(undefined);

// Provider props interface
interface EmotionsProviderProps {
  children: ReactNode;
  userId: number;
}

// Simple event emitter for domain events
const eventEmitter = {
  emit: (eventName: string, payload: any) => {
    console.log(`Event: ${eventName}`, payload);
    // Here you could trigger other side effects like notifications
  }
};

// EmotionsProvider component
export const EmotionsProvider: React.FC<EmotionsProviderProps> = ({ children, userId }) => {
  // State
  const [emotions, setEmotions] = useState<EmotionDTO[]>(predefinedEmotions);
  const [trackedEmotions, setTrackedEmotions] = useState<EmotionTrackingEntry[]>([]);
  const [summaryData, setSummaryData] = useState<EmotionSummaryDTO | null>(null);
  const [trendData, setTrendData] = useState<EmotionTrendDTO[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRangeState] = useState<{from: Date, to: Date}>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Create the repository and service
  const emotionsRepository = new ApiEmotionsRepository(userId);
  const emotionsService = new EmotionsService(emotionsRepository, userId, eventEmitter);
  
  // Helper to set date range
  const setDateRange = useCallback((from: Date, to: Date) => {
    setDateRangeState({ from, to });
  }, []);
  
  // Get emotion by ID
  const getEmotionById = useCallback((id: string): EmotionDTO | undefined => {
    return emotions.find(e => e.id === id);
  }, [emotions]);
  
  // Get emotions for a specific date
  const getEmotionsForDate = useCallback((date: Date): EmotionTrackingEntry[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return trackedEmotions.filter(e => format(new Date(e.date), 'yyyy-MM-dd') === dateStr);
  }, [trackedEmotions]);
  
  // Get emotions by category
  const getEmotionsForCategory = useCallback((category: EmotionCategory): EmotionDTO[] => {
    return emotions.filter(e => e.category === category);
  }, [emotions]);
  
  // Track a new emotion
  const trackEmotion = useCallback(async (
    emotionId: string,
    intensity: number,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[]
  ): Promise<EmotionTrackingEntry> => {
    setIsLoading(true);
    
    try {
      const emotion = getEmotionById(emotionId);
      
      if (!emotion) {
        throw new Error(`Emotion with ID ${emotionId} not found`);
      }
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const entry = await emotionsService.trackEmotion(
        dateStr,
        emotionId,
        emotion.name,
        emotion.category,
        intensity,
        notes,
        triggers,
        copingMechanisms
      );
      
      // Update local state
      setTrackedEmotions(prev => [...prev, entry]);
      
      // Refresh summary data
      await refreshSummaryData();
      
      return entry;
    } catch (error) {
      console.error('Error tracking emotion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [emotionsService, getEmotionById, selectedDate]);
  
  // Update an emotion entry
  const updateEmotionEntry = useCallback(async (
    entryId: number,
    intensity?: number,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[]
  ): Promise<EmotionTrackingEntry> => {
    setIsLoading(true);
    
    try {
      const entry = await emotionsService.updateEmotionEntry(
        entryId,
        intensity,
        notes,
        triggers,
        copingMechanisms
      );
      
      // Update local state
      setTrackedEmotions(prev => prev.map(e => (e.id === entryId ? entry : e)));
      
      // Refresh summary data
      await refreshSummaryData();
      
      return entry;
    } catch (error) {
      console.error('Error updating emotion entry:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [emotionsService]);
  
  // Delete an emotion entry
  const deleteEmotionEntry = useCallback(async (entryId: number): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = await emotionsService.deleteEmotionEntry(entryId);
      
      if (success) {
        // Update local state
        setTrackedEmotions(prev => prev.filter(e => e.id !== entryId));
        
        // Refresh summary data
        await refreshSummaryData();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting emotion entry:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [emotionsService]);
  
  // Refresh summary data for the selected date
  const refreshSummaryData = useCallback(async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const summary = await emotionsService.getEmotionSummary(dateStr);
      setSummaryData(summary);
    } catch (error) {
      console.error('Error refreshing summary data:', error);
    }
  }, [emotionsService, selectedDate]);
  
  // Refresh all data (emotions, tracking entries, trends, etc.)
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Load all predefined emotions
      const loadedEmotions = await emotionsService.getAllEmotions();
      setEmotions(loadedEmotions);
      
      // Load tracked emotions for the date range
      const fromStr = format(dateRange.from, 'yyyy-MM-dd');
      const toStr = format(dateRange.to, 'yyyy-MM-dd');
      const entries = await emotionsService.getEmotionEntries(fromStr, toStr);
      setTrackedEmotions(entries);
      
      // Load summary data for the selected date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const summary = await emotionsService.getEmotionSummary(dateStr);
      setSummaryData(summary);
      
      // Load trend data
      const trends = await emotionsService.getEmotionTrends(fromStr, toStr);
      setTrendData(trends);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [emotionsService, dateRange, selectedDate]);
  
  // Initial data loading
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // Create the context value
  const value: EmotionsContextType = {
    emotions,
    trackedEmotions,
    summaryData,
    trendData,
    selectedDate,
    dateRange,
    isLoading,
    setSelectedDate,
    setDateRange,
    trackEmotion,
    updateEmotionEntry,
    deleteEmotionEntry,
    getEmotionById,
    getEmotionsForDate,
    getEmotionsForCategory,
    refreshData
  };
  
  return <EmotionsContext.Provider value={value}>{children}</EmotionsContext.Provider>;
};

// Custom hook for consuming the EmotionsContext
export const useEmotions = (): EmotionsContextType => {
  const context = useContext(EmotionsContext);
  
  if (context === undefined) {
    throw new Error('useEmotions must be used within an EmotionsProvider');
  }
  
  return context;
};