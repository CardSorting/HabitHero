// DiaryContext - Context API for managing diary card state
// Presentation layer - this is what the UI components will interact with

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { format } from 'date-fns';
import { 
  DiaryCardData, 
  DateString, 
  defaultDiaryCardData, 
  SleepData 
} from '../../domain/models';
import { DiaryService } from '../../application/DiaryService';
import { ApiDiaryRepository } from '../../infrastructure/ApiDiaryRepository';

interface DiaryContextType {
  diaryData: DiaryCardData;
  isLoading: boolean;
  loadWeekData: (dates: DateString[]) => Promise<void>;
  handleSleepChange: (date: DateString, field: keyof SleepData, value: string) => void;
  handleEmotionChange: (date: DateString, emotion: string, value: string) => void;
  handleUrgeChange: (date: DateString, urge: string, field: 'level' | 'action', value: string) => void;
  handleEventChange: (date: DateString, value: string) => void;
  handleSkillChange: (category: string, skill: string, date: DateString, checked: boolean) => void;
  handleMedicationChange: (date: DateString, value: string) => void;
  getSleepValue: (date: DateString, field: keyof SleepData) => string;
  getEmotionValue: (date: DateString, emotion: string) => string;
  getUrgeValue: (date: DateString, urge: string, field: 'level' | 'action') => string;
  getEventValue: (date: DateString) => string;
  getMedicationValue: (date: DateString) => string;
  getSkillChecked: (category: string, skill: string, date: DateString) => boolean;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

interface DiaryProviderProps {
  children: ReactNode;
  userId: number;
}

export const DiaryProvider: React.FC<DiaryProviderProps> = ({ children, userId }) => {
  const [diaryData, setDiaryData] = useState<DiaryCardData>(defaultDiaryCardData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Initialize the diary service with the repository
  const diaryService = new DiaryService(new ApiDiaryRepository(userId), userId);
  
  // Load week data
  const loadWeekData = useCallback(async (dates: DateString[]) => {
    setIsLoading(true);
    try {
      // Load data from local storage first for instant display
      const weekKey = dates[0]; // Use the first date as the key
      const savedData = localStorage.getItem(`dbt-diary-${weekKey}`);
      
      if (savedData) {
        setDiaryData(JSON.parse(savedData));
      }
      
      // Then load from API for latest data
      const apiData = await diaryService.getWeekData(dates);
      setDiaryData(apiData);
      
      // Save to local storage for offline access
      localStorage.setItem(`dbt-diary-${weekKey}`, JSON.stringify(apiData));
    } catch (error) {
      console.error('Error loading week data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [diaryService]);
  
  // Save diary data to local storage when it changes
  useEffect(() => {
    // This is a backup mechanism
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    localStorage.setItem(`dbt-diary-${currentDate}`, JSON.stringify(diaryData));
  }, [diaryData]);
  
  // Sleep data handlers
  const handleSleepChange = useCallback(async (date: DateString, field: keyof SleepData, value: string) => {
    // Update local state immediately for responsiveness
    setDiaryData(prev => ({
      ...prev,
      sleep: {
        ...prev.sleep,
        [date]: {
          ...prev.sleep[date],
          [field]: value
        }
      }
    }));
    
    try {
      // Save to server
      await diaryService.saveSleepData(
        date, 
        field, 
        value, 
        diaryData.sleep[date]
      );
    } catch (error) {
      console.error('Error saving sleep data:', error);
    }
  }, [diaryService, diaryData.sleep]);
  
  // Emotion data handlers
  const handleEmotionChange = useCallback(async (date: DateString, emotion: string, value: string) => {
    // Update local state
    setDiaryData(prev => ({
      ...prev,
      emotions: {
        ...prev.emotions,
        [date]: {
          ...prev.emotions[date],
          [emotion]: value
        }
      }
    }));
    
    try {
      // Save to server
      await diaryService.saveEmotion(date, emotion, value);
    } catch (error) {
      console.error('Error saving emotion data:', error);
    }
  }, [diaryService]);
  
  // Urge data handlers
  const handleUrgeChange = useCallback(async (date: DateString, urge: string, field: 'level' | 'action', value: string) => {
    // Update local state
    setDiaryData(prev => ({
      ...prev,
      urges: {
        ...prev.urges,
        [date]: {
          ...prev.urges[date],
          [urge]: {
            ...prev.urges[date]?.[urge],
            [field]: value
          }
        }
      }
    }));
    
    try {
      // Get current values
      const currentLevel = diaryData.urges[date]?.[urge]?.level || '';
      const currentAction = diaryData.urges[date]?.[urge]?.action || '';
      
      // Save to server
      await diaryService.saveUrge(
        date, 
        urge, 
        field, 
        value, 
        currentLevel, 
        currentAction
      );
    } catch (error) {
      console.error('Error saving urge data:', error);
    }
  }, [diaryService, diaryData.urges]);
  
  // Event data handlers
  const handleEventChange = useCallback(async (date: DateString, value: string) => {
    // Update local state
    setDiaryData(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [date]: value
      }
    }));
    
    try {
      // Save to server
      await diaryService.saveEvent(date, value);
    } catch (error) {
      console.error('Error saving event data:', error);
    }
  }, [diaryService]);
  
  // Skill data handlers
  const handleSkillChange = useCallback(async (category: string, skill: string, date: DateString, checked: boolean) => {
    // Update local state
    setDiaryData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: {
          ...prev.skills[category],
          [skill]: {
            ...prev.skills[category]?.[skill],
            [date]: checked
          }
        }
      }
    }));
    
    try {
      // Save to server
      await diaryService.saveSkill(date, category, skill, checked);
    } catch (error) {
      console.error('Error saving skill data:', error);
    }
  }, [diaryService]);
  
  // Medication data handlers (local only since there's no API endpoint)
  const handleMedicationChange = useCallback((date: DateString, value: string) => {
    // Update local state only
    setDiaryData(prev => ({
      ...prev,
      medication: {
        ...prev.medication,
        [date]: value
      }
    }));
  }, []);
  
  // Getters
  const getSleepValue = useCallback((date: DateString, field: keyof SleepData): string => {
    return diaryData.sleep[date]?.[field] || '';
  }, [diaryData.sleep]);
  
  const getEmotionValue = useCallback((date: DateString, emotion: string): string => {
    return diaryData.emotions[date]?.[emotion] || '';
  }, [diaryData.emotions]);
  
  const getUrgeValue = useCallback((date: DateString, urge: string, field: 'level' | 'action'): string => {
    return diaryData.urges[date]?.[urge]?.[field] || '';
  }, [diaryData.urges]);
  
  const getEventValue = useCallback((date: DateString): string => {
    return diaryData.events[date] || '';
  }, [diaryData.events]);
  
  const getMedicationValue = useCallback((date: DateString): string => {
    return diaryData.medication[date] || '';
  }, [diaryData.medication]);
  
  const getSkillChecked = useCallback((category: string, skill: string, date: DateString): boolean => {
    return diaryData.skills[category]?.[skill]?.[date] || false;
  }, [diaryData.skills]);
  
  const value = {
    diaryData,
    isLoading,
    loadWeekData,
    handleSleepChange,
    handleEmotionChange,
    handleUrgeChange,
    handleEventChange,
    handleSkillChange,
    handleMedicationChange,
    getSleepValue,
    getEmotionValue,
    getUrgeValue,
    getEventValue,
    getMedicationValue,
    getSkillChecked
  };
  
  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
};

// Custom hook for consuming the DiaryContext
export const useDiary = (): DiaryContextType => {
  const context = useContext(DiaryContext);
  if (context === undefined) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};