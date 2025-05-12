// DiaryContext - Context API for managing diary card state
// Presentation layer - this is what the UI components will interact with

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { format } from 'date-fns';
import { 
  DiaryCardData, 
  DateString, 
  defaultDiaryCardData, 
  SleepData 
} from '../../domain/models';
import { DiaryService } from '../../application/DiaryService';
import { ApiDiaryRepository } from '../../infrastructure/ApiDiaryRepository';

// Utility function to check deep equality of objects
const isDeepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (obj1 === null || obj2 === null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isDeepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

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
  
  // Use refs to store previous values for comparison
  const previousStateRef = useRef<DiaryCardData>(defaultDiaryCardData);
  const pendingUpdatesRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Initialize the diary service with the repository
  const diaryService = new DiaryService(new ApiDiaryRepository(userId), userId);
  
  // Cancel any pending update
  const cancelPendingUpdate = useCallback((key: string) => {
    if (pendingUpdatesRef.current.has(key)) {
      clearTimeout(pendingUpdatesRef.current.get(key)!);
      pendingUpdatesRef.current.delete(key);
    }
  }, []);
  
  // Schedule a debounced API update
  const scheduleUpdate = useCallback((key: string, updateFn: () => Promise<void>, delay = 500) => {
    // Cancel any existing update for this key
    cancelPendingUpdate(key);
    
    // Schedule new update
    const timeoutId = setTimeout(async () => {
      try {
        await updateFn();
      } catch (error) {
        console.error(`Error in scheduled update for ${key}:`, error);
      } finally {
        pendingUpdatesRef.current.delete(key);
      }
    }, delay);
    
    pendingUpdatesRef.current.set(key, timeoutId);
  }, [cancelPendingUpdate]);
  
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
      
      // Only update state if data is different
      if (!isDeepEqual(apiData, diaryData)) {
        setDiaryData(apiData);
        
        // Save to local storage for offline access
        localStorage.setItem(`dbt-diary-${weekKey}`, JSON.stringify(apiData));
      }
    } catch (error) {
      console.error('Error loading week data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [diaryService, diaryData]);
  
  // Save diary data to local storage when it changes
  useEffect(() => {
    // This is a backup mechanism
    if (!isDeepEqual(diaryData, previousStateRef.current)) {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      localStorage.setItem(`dbt-diary-${currentDate}`, JSON.stringify(diaryData));
      
      // Update the previous state reference
      previousStateRef.current = JSON.parse(JSON.stringify(diaryData));
    }
  }, [diaryData]);
  
  // Sleep data handlers
  const handleSleepChange = useCallback(async (date: DateString, field: keyof SleepData, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.sleep[date]?.[field] === value) {
      return;
    }
    
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
    
    // Empty values should not be saved to reduce API calls
    if (value.trim() === '') {
      return;
    }
    
    // Create a unique key for this update
    const updateKey = `sleep_${date}_${field}`;
    
    // Schedule the API call
    scheduleUpdate(updateKey, async () => {
      try {
        await diaryService.saveSleepData(
          date, 
          field, 
          value, 
          diaryData.sleep[date]
        );
      } catch (error) {
        console.error('Error saving sleep data:', error);
      }
    });
  }, [diaryService, diaryData.sleep, scheduleUpdate]);
  
  // Emotion data handlers
  const handleEmotionChange = useCallback(async (date: DateString, emotion: string, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.emotions[date]?.[emotion] === value) {
      return;
    }
    
    // Update local state immediately for responsiveness
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
    
    // Empty values should not be saved to reduce API calls
    if (value.trim() === '') {
      return;
    }
    
    // Create a unique key for this update
    const updateKey = `emotion_${date}_${emotion}`;
    
    // Schedule the API call
    scheduleUpdate(updateKey, async () => {
      try {
        await diaryService.saveEmotion(date, emotion, value);
      } catch (error) {
        console.error('Error saving emotion data:', error);
      }
    });
  }, [diaryService, diaryData.emotions, scheduleUpdate]);
  
  // Urge data handlers
  const handleUrgeChange = useCallback(async (date: DateString, urge: string, field: 'level' | 'action', value: string) => {
    // Skip if value hasn't changed
    if (diaryData.urges[date]?.[urge]?.[field] === value) {
      return;
    }
    
    // Update local state immediately for responsiveness
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
    
    // Empty values should not be saved to reduce API calls
    if (value.trim() === '') {
      return;
    }
    
    // Create a unique key for this update
    const updateKey = `urge_${date}_${urge}_${field}`;
    
    // Schedule the API call
    scheduleUpdate(updateKey, async () => {
      try {
        // Get current values
        const currentLevel = diaryData.urges[date]?.[urge]?.level || '';
        const currentAction = diaryData.urges[date]?.[urge]?.action || '';
        
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
    });
  }, [diaryService, diaryData.urges, scheduleUpdate]);
  
  // Event data handlers
  const handleEventChange = useCallback(async (date: DateString, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.events[date] === value) {
      return;
    }
    
    // Update local state immediately for responsiveness
    setDiaryData(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [date]: value
      }
    }));
    
    // Empty values should not be saved to reduce API calls
    if (value.trim() === '') {
      return;
    }
    
    // Create a unique key for this update
    const updateKey = `event_${date}`;
    
    // Schedule the API call
    scheduleUpdate(updateKey, async () => {
      try {
        await diaryService.saveEvent(date, value);
      } catch (error) {
        console.error('Error saving event data:', error);
      }
    });
  }, [diaryService, diaryData.events, scheduleUpdate]);
  
  // Skill data handlers
  const handleSkillChange = useCallback(async (category: string, skill: string, date: DateString, checked: boolean) => {
    // Skip if value hasn't changed
    if (diaryData.skills[category]?.[skill]?.[date] === checked) {
      return;
    }
    
    // Update local state immediately for responsiveness
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
    
    // Create a unique key for this update
    const updateKey = `skill_${date}_${category}_${skill}`;
    
    // Schedule the API call
    scheduleUpdate(updateKey, async () => {
      try {
        await diaryService.saveSkill(date, category, skill, checked);
      } catch (error) {
        console.error('Error saving skill data:', error);
      }
    });
  }, [diaryService, diaryData.skills, scheduleUpdate]);
  
  // Medication data handlers (local only since there's no API endpoint)
  const handleMedicationChange = useCallback((date: DateString, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.medication[date] === value) {
      return;
    }
    
    // Update local state only (no API call needed)
    setDiaryData(prev => ({
      ...prev,
      medication: {
        ...prev.medication,
        [date]: value
      }
    }));
  }, [diaryData.medication]);
  
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
  
  // Cleanup function to cancel all pending updates when the component unmounts
  useEffect(() => {
    return () => {
      // Cancel all pending updates
      const keys = Array.from(pendingUpdatesRef.current.keys());
      keys.forEach(key => {
        cancelPendingUpdate(key);
      });
    };
  }, [cancelPendingUpdate]);

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