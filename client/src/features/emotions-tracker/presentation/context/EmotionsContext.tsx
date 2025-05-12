import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { 
  Emotion, 
  EmotionCategory, 
  EmotionEntry, 
  EmotionSummary, 
  EmotionTrend 
} from '../../domain/models';
import { ApiEmotionsRepository } from '../../infrastructure/ApiEmotionsRepository';
import { EmotionsService } from '../../application/EmotionsService';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface EmotionsContextProps {
  // Emotions state
  emotions: Emotion[];
  loadingEmotions: boolean;
  
  // Current date
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  
  // Entries
  entries: EmotionEntry[];
  loadingEntries: boolean;
  
  // Summary
  summary: EmotionSummary | null;
  loadingSummary: boolean;
  
  // Trends
  trends: EmotionTrend[];
  loadingTrends: boolean;
  
  // Statistics
  frequentEmotions: {emotion: string, count: number}[];
  highIntensityEmotions: {emotion: string, intensity: number}[];
  loadingStatistics: boolean;
  
  // Date ranges for analytics
  dateRange: {from: Date, to: Date};
  setDateRange: (range: {from: Date, to: Date}) => void;
  
  // Functions to interact with the service
  trackEmotion: (
    emotionId: string,
    emotionName: string,
    categoryId: string,
    intensity: number,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[]
  ) => Promise<void>;
  
  updateEntry: (
    id: string,
    updates: {
      intensity?: number;
      notes?: string;
      triggers?: string[];
      copingMechanisms?: string[];
    }
  ) => Promise<void>;
  
  deleteEntry: (id: string) => Promise<void>;
  
  // Filter by category
  getEmotionsByCategory: (category: EmotionCategory) => Emotion[];
  
  // Refresh data
  refreshEntries: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  refreshTrends: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
}

const EmotionsContext = createContext<EmotionsContextProps | undefined>(undefined);

export const useEmotions = () => {
  const context = useContext(EmotionsContext);
  if (!context) {
    throw new Error('useEmotions must be used within an EmotionsProvider');
  }
  return context;
};

interface EmotionsProviderProps {
  children: ReactNode;
}

export const EmotionsProvider: React.FC<EmotionsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize repositories and service
  const emotionsRepository = new ApiEmotionsRepository();
  const entriesRepository = new ApiEmotionsRepository();
  const emotionsService = new EmotionsService(emotionsRepository, entriesRepository);
  
  // State variables
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [loadingEmotions, setLoadingEmotions] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  
  const [summary, setSummary] = useState<EmotionSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  
  const [trends, setTrends] = useState<EmotionTrend[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  
  const [frequentEmotions, setFrequentEmotions] = useState<{emotion: string, count: number}[]>([]);
  const [highIntensityEmotions, setHighIntensityEmotions] = useState<{emotion: string, intensity: number}[]>([]);
  const [loadingStatistics, setLoadingStatistics] = useState(true);
  
  // Default date range for analytics: last 7 days
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    return { from, to };
  });
  
  // Fetch all emotions on mount
  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        setLoadingEmotions(true);
        const allEmotions = await emotionsService.getAllEmotions();
        setEmotions(allEmotions);
      } catch (error) {
        console.error('Error fetching emotions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load emotions data',
          variant: 'destructive',
        });
      } finally {
        setLoadingEmotions(false);
      }
    };
    
    fetchEmotions();
  }, []);
  
  // Fetch entries for the selected date
  useEffect(() => {
    if (user) {
      refreshEntries();
      refreshSummary();
    }
  }, [user, selectedDate]);
  
  // Fetch trends and statistics when date range changes
  useEffect(() => {
    if (user) {
      refreshTrends();
      refreshStatistics();
    }
  }, [user, dateRange]);
  
  // Function to track a new emotion
  const trackEmotion = async (
    emotionId: string,
    emotionName: string,
    categoryId: string,
    intensity: number,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[]
  ) => {
    if (!user) return;
    
    try {
      await emotionsService.trackEmotion(
        user.id,
        emotionId,
        emotionName,
        intensity,
        selectedDate,
        notes,
        triggers,
        copingMechanisms,
        categoryId
      );
      
      // Refresh data
      await refreshEntries();
      await refreshSummary();
      
      toast({
        title: 'Emotion tracked',
        description: 'Your emotion has been successfully recorded',
      });
    } catch (error) {
      console.error('Error tracking emotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to track emotion',
        variant: 'destructive',
      });
    }
  };
  
  // Function to update an existing entry
  const updateEntry = async (
    id: string,
    updates: {
      intensity?: number;
      notes?: string;
      triggers?: string[];
      copingMechanisms?: string[];
    }
  ) => {
    if (!user) return;
    
    try {
      await emotionsService.updateEmotionEntry(id, user.id, updates);
      
      // Refresh data
      await refreshEntries();
      await refreshSummary();
      
      toast({
        title: 'Entry updated',
        description: 'Your emotion entry has been updated',
      });
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update entry',
        variant: 'destructive',
      });
    }
  };
  
  // Function to delete an entry
  const deleteEntry = async (id: string) => {
    if (!user) return;
    
    try {
      await emotionsService.deleteEmotionEntry(id, user.id);
      
      // Refresh data
      await refreshEntries();
      await refreshSummary();
      
      toast({
        title: 'Entry deleted',
        description: 'Your emotion entry has been deleted',
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };
  
  // Function to get emotions by category
  const getEmotionsByCategory = (category: EmotionCategory): Emotion[] => {
    return emotions.filter(emotion => emotion.category === category);
  };
  
  // Refresh functions
  const refreshEntries = async () => {
    if (!user) return;
    
    try {
      setLoadingEntries(true);
      const userEntries = await emotionsService.getEntriesByDate(user.id, selectedDate);
      setEntries(userEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoadingEntries(false);
    }
  };
  
  const refreshSummary = async () => {
    if (!user) return;
    
    try {
      setLoadingSummary(true);
      const dateSummary = await emotionsService.getSummaryForDate(user.id, selectedDate);
      setSummary(dateSummary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };
  
  const refreshTrends = async () => {
    if (!user) return;
    
    try {
      setLoadingTrends(true);
      const emotionTrends = await emotionsService.getTrends(user.id, dateRange.from, dateRange.to);
      setTrends(emotionTrends);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoadingTrends(false);
    }
  };
  
  const refreshStatistics = async () => {
    if (!user) return;
    
    try {
      setLoadingStatistics(true);
      const frequent = await emotionsService.getMostFrequentEmotions(
        user.id, 
        dateRange.from, 
        dateRange.to, 
        5
      );
      const highIntensity = await emotionsService.getHighestIntensityEmotions(
        user.id, 
        dateRange.from, 
        dateRange.to, 
        5
      );
      
      setFrequentEmotions(frequent);
      setHighIntensityEmotions(highIntensity);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoadingStatistics(false);
    }
  };
  
  const contextValue: EmotionsContextProps = {
    emotions,
    loadingEmotions,
    selectedDate,
    setSelectedDate,
    entries,
    loadingEntries,
    summary,
    loadingSummary,
    trends,
    loadingTrends,
    frequentEmotions,
    highIntensityEmotions,
    loadingStatistics,
    dateRange,
    setDateRange,
    trackEmotion,
    updateEntry,
    deleteEntry,
    getEmotionsByCategory,
    refreshEntries,
    refreshSummary,
    refreshTrends,
    refreshStatistics,
  };
  
  return (
    <EmotionsContext.Provider value={contextValue}>
      {children}
    </EmotionsContext.Provider>
  );
};