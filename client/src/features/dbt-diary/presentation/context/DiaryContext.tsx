// DiaryContext - Context API for managing diary card state
// Presentation layer - this is what the UI components will interact with

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  DiaryCardData, 
  DateString, 
  defaultDiaryCardData, 
  SleepData
} from '../../domain/models';
import { ApiDiaryRepository } from '../../infrastructure/ApiDiaryRepository';
import { DiaryService } from '../../application/DiaryService';

// Storage key for sessionStorage data
const STORAGE_PREFIX = 'dbt-diary-data';

// Define the context interface
interface DiaryContextType {
  diaryData: DiaryCardData;
  isLoading: boolean; 
  hasPendingChanges: boolean;
  serverData: { [date: string]: boolean }; // Track which dates have been fetched from server
  
  // Data update operations (local state only, no API calls)
  handleSleepChange: (date: DateString, field: keyof SleepData, value: string) => void;
  handleEmotionChange: (date: DateString, emotion: string, value: string) => void;
  handleUrgeChange: (date: DateString, urge: string, field: 'level' | 'action', value: string) => void;
  handleEventChange: (date: DateString, value: string) => void;
  handleSkillChange: (category: string, skill: string, date: DateString, checked: boolean) => void;
  handleMedicationChange: (date: DateString, value: string) => void;
  
  // Data retrieval helpers
  getSleepValue: (date: DateString, field: keyof SleepData) => string;
  getEmotionValue: (date: DateString, emotion: string) => string;
  getUrgeValue: (date: DateString, urge: string, field: 'level' | 'action') => string;
  getEventValue: (date: DateString) => string;
  getMedicationValue: (date: DateString) => string;
  getSkillChecked: (category: string, skill: string, date: DateString) => boolean;
  
  // Loading and saving helpers
  setLoading: (isLoading: boolean) => void;
  updateDiaryData: (newData: DiaryCardData) => void;
  markDateLoaded: (date: DateString) => void;
  markAsSaved: () => void;
  clearCache: () => void;
  loadInitialData: () => void;
  saveToLocalStorage: () => void;
  
  // API interaction methods (missing from original interface)
  loadDay: (date: DateString) => Promise<void>;
  saveChanges: () => Promise<void>;
}

// Create the context with undefined default
const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

// Provider props interface
interface DiaryProviderProps {
  children: ReactNode;
  userId: number; // Added userId prop which is being used by DiaryCardContainer
}

// DiaryProvider component
export const DiaryProvider: React.FC<DiaryProviderProps> = ({ children, userId }) => {
  // State
  const [diaryData, setDiaryData] = useState<DiaryCardData>(defaultDiaryCardData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [serverData, setServerData] = useState<{ [date: string]: boolean }>({});
  
  // Create the repository and service
  const diaryRepository = new ApiDiaryRepository(userId);
  const diaryService = new DiaryService(diaryRepository, userId);
  
  // Helper to update loading state
  const updateLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);
  
  // Load initial data from session storage
  const loadInitialData = useCallback(() => {
    try {
      // Load diary data
      const storedData = sessionStorage.getItem(STORAGE_PREFIX);
      if (storedData) {
        setDiaryData(JSON.parse(storedData));
      }
      
      // Load server data status
      const storedServerData = sessionStorage.getItem(`${STORAGE_PREFIX}-server`);
      if (storedServerData) {
        setServerData(JSON.parse(storedServerData));
      }
      
      // Load pending changes status
      const pendingChanges = sessionStorage.getItem(`${STORAGE_PREFIX}-pending`);
      if (pendingChanges === 'true') {
        setHasPendingChanges(true);
      }
    } catch (error) {
      console.error('Error loading cached diary data:', error);
    }
  }, []);
  
  // Save data to session storage
  const saveToLocalStorage = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_PREFIX, JSON.stringify(diaryData));
      sessionStorage.setItem(`${STORAGE_PREFIX}-pending`, hasPendingChanges ? 'true' : 'false');
      sessionStorage.setItem(`${STORAGE_PREFIX}-server`, JSON.stringify(serverData));
    } catch (error) {
      console.error('Error saving to session storage:', error);
    }
  }, [diaryData, hasPendingChanges, serverData]);
  
  // Update diary data (used when loading from server)
  const updateDiaryData = useCallback((newData: DiaryCardData) => {
    setDiaryData(prevData => {
      // Merge the new data with existing data
      const mergedData = { ...prevData };
      
      // Merge sleep data
      mergedData.sleep = { ...mergedData.sleep, ...newData.sleep };
      
      // Merge emotions data
      mergedData.emotions = { ...mergedData.emotions, ...newData.emotions };
      
      // Merge urges data
      mergedData.urges = { ...mergedData.urges, ...newData.urges };
      
      // Merge events data
      mergedData.events = { ...mergedData.events, ...newData.events };
      
      // Merge skills data (more complex due to nested structure)
      Object.entries(newData.skills).forEach(([category, categoryData]) => {
        if (!mergedData.skills[category]) {
          mergedData.skills[category] = {};
        }
        
        Object.entries(categoryData).forEach(([skill, skillData]) => {
          if (!mergedData.skills[category][skill]) {
            mergedData.skills[category][skill] = {};
          }
          
          mergedData.skills[category][skill] = {
            ...mergedData.skills[category][skill],
            ...skillData
          };
        });
      });
      
      // Merge medication data
      mergedData.medication = { ...mergedData.medication, ...newData.medication };
      
      return mergedData;
    });
    
    // Save updated data to session storage
    setTimeout(() => saveToLocalStorage(), 0);
  }, [saveToLocalStorage]);
  
  // Mark a date as loaded from server
  const markDateLoaded = useCallback((date: DateString) => {
    setServerData(prev => {
      const updated = { ...prev, [date]: true };
      
      // Update sessionStorage with the new server data status
      sessionStorage.setItem(`${STORAGE_PREFIX}-server`, JSON.stringify(updated));
      
      return updated;
    });
  }, []);
  
  // Mark all pending changes as saved
  const markAsSaved = useCallback(() => {
    setHasPendingChanges(false);
    
    // Update session storage
    sessionStorage.setItem(`${STORAGE_PREFIX}-pending`, 'false');
  }, []);
  
  // Clear cache
  const clearCache = useCallback(() => {
    sessionStorage.removeItem(STORAGE_PREFIX);
    sessionStorage.removeItem(`${STORAGE_PREFIX}-pending`);
    sessionStorage.removeItem(`${STORAGE_PREFIX}-server`);
    
    setDiaryData(defaultDiaryCardData);
    setHasPendingChanges(false);
    setServerData({});
  }, []);
  
  // Sleep data handler
  const handleSleepChange = useCallback((date: DateString, field: keyof SleepData, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.sleep[date]?.[field] === value) {
      return;
    }
    
    // Update local state immediately
    setDiaryData(prev => {
      const updated = {
        ...prev,
        sleep: {
          ...prev.sleep,
          [date]: {
            ...prev.sleep[date],
            [field]: value
          }
        }
      };
      
      return updated;
    });
    
    // Mark as having pending changes
    setHasPendingChanges(true);
    
    // Schedule saving to session storage
    setTimeout(() => saveToLocalStorage(), 0);
  }, [diaryData.sleep, saveToLocalStorage]);
  
  // Emotion data handler
  const handleEmotionChange = useCallback((date: DateString, emotion: string, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.emotions[date]?.[emotion] === value) {
      return;
    }
    
    // Update local state immediately
    setDiaryData(prev => {
      const updated = {
        ...prev,
        emotions: {
          ...prev.emotions,
          [date]: {
            ...prev.emotions[date],
            [emotion]: value
          }
        }
      };
      
      return updated;
    });
    
    // Mark as having pending changes
    setHasPendingChanges(true);
    
    // Schedule saving to session storage
    setTimeout(() => saveToLocalStorage(), 0);
  }, [diaryData.emotions, saveToLocalStorage]);
  
  // Urge data handler
  const handleUrgeChange = useCallback((date: DateString, urge: string, field: 'level' | 'action', value: string) => {
    // Skip if value hasn't changed
    if (diaryData.urges[date]?.[urge]?.[field] === value) {
      return;
    }
    
    setDiaryData(prev => {
      const updated = {
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
      };
      
      return updated;
    });
    
    // Mark as having pending changes
    setHasPendingChanges(true);
    
    // Schedule saving to session storage
    setTimeout(() => saveToLocalStorage(), 0);
  }, [diaryData.urges, saveToLocalStorage]);
  
  // Event data handler
  const handleEventChange = useCallback((date: DateString, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.events[date] === value) {
      return;
    }
    
    setDiaryData(prev => {
      const updated = {
        ...prev,
        events: {
          ...prev.events,
          [date]: value
        }
      };
      
      return updated;
    });
    
    // Mark as having pending changes
    setHasPendingChanges(true);
    
    // Schedule saving to session storage
    setTimeout(() => saveToLocalStorage(), 0);
  }, [diaryData.events, saveToLocalStorage]);
  
  // Skill data handler
  const handleSkillChange = useCallback((category: string, skill: string, date: DateString, checked: boolean) => {
    // Skip if value hasn't changed
    if (diaryData.skills[category]?.[skill]?.[date] === checked) {
      return;
    }
    
    setDiaryData(prev => {
      // Create a deep copy of the skills structure
      const updatedSkills = { ...prev.skills };
      
      // Create category if it doesn't exist
      if (!updatedSkills[category]) {
        updatedSkills[category] = {};
      }
      
      // Create skill if it doesn't exist
      if (!updatedSkills[category][skill]) {
        updatedSkills[category][skill] = {};
      }
      
      // Update the checked status for this date
      updatedSkills[category][skill] = {
        ...updatedSkills[category][skill],
        [date]: checked
      };
      
      // Return the updated diary data
      return {
        ...prev,
        skills: updatedSkills
      };
    });
    
    // Mark as having pending changes
    setHasPendingChanges(true);
    
    // Schedule saving to session storage
    setTimeout(() => saveToLocalStorage(), 0);
  }, [diaryData.skills, saveToLocalStorage]);
  
  // Medication data handler (local only)
  const handleMedicationChange = useCallback((date: DateString, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.medication[date] === value) {
      return;
    }
    
    setDiaryData(prev => ({
      ...prev,
      medication: {
        ...prev.medication,
        [date]: value
      }
    }));
    
    // Schedule saving to session storage
    setTimeout(() => saveToLocalStorage(), 0);
  }, [diaryData.medication, saveToLocalStorage]);
  
  // Getters for diary data values
  
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

  // Create the context value object
  const value = {
    diaryData,
    isLoading,
    hasPendingChanges,
    serverData,
    setLoading: updateLoading,
    updateDiaryData,
    markDateLoaded,
    markAsSaved,
    clearCache,
    loadInitialData,
    saveToLocalStorage,
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