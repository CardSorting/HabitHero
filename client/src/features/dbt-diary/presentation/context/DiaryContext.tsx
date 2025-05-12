// DiaryContext - Context API for managing diary card state
// Presentation layer - this is what the UI components will interact with

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { format } from 'date-fns';
import { 
  DiaryCardData, 
  DateString, 
  defaultDiaryCardData, 
  SleepData 
} from '../../domain/models';
import { DiaryService } from '../../application/DiaryService';
import { ApiDiaryRepository } from '../../infrastructure/ApiDiaryRepository';

const STORAGE_PREFIX = 'dbt-diary-data';

interface LoadStatus {
  [key: string]: boolean;
}

interface DiaryContextType {
  diaryData: DiaryCardData;
  isLoading: boolean;
  hasPendingChanges: boolean;
  
  // Manual data loading
  loadInitialData: () => void;
  loadDay: (date: DateString) => Promise<void>;
  
  // Local state operations
  handleSleepChange: (date: DateString, field: keyof SleepData, value: string) => void;
  handleEmotionChange: (date: DateString, emotion: string, value: string) => void;
  handleUrgeChange: (date: DateString, urge: string, field: 'level' | 'action', value: string) => void;
  handleEventChange: (date: DateString, value: string) => void;
  handleSkillChange: (category: string, skill: string, date: DateString, checked: boolean) => void;
  handleMedicationChange: (date: DateString, value: string) => void;
  
  // Values retrieval
  getSleepValue: (date: DateString, field: keyof SleepData) => string;
  getEmotionValue: (date: DateString, emotion: string) => string;
  getUrgeValue: (date: DateString, urge: string, field: 'level' | 'action') => string;
  getEventValue: (date: DateString) => string;
  getMedicationValue: (date: DateString) => string;
  getSkillChecked: (category: string, skill: string, date: DateString) => boolean;
  
  // Save to server
  saveChanges: () => Promise<void>;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

interface DiaryProviderProps {
  children: ReactNode;
  userId: number;
}

export const DiaryProvider: React.FC<DiaryProviderProps> = ({ children, userId }) => {
  // State
  const [diaryData, setDiaryData] = useState<DiaryCardData>(defaultDiaryCardData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [loadedDates, setLoadedDates] = useState<LoadStatus>({});
  
  // Initialize the diary service with the repository
  const diaryService = new DiaryService(new ApiDiaryRepository(userId), userId);
  
  // Load initial data from session storage
  const loadInitialData = useCallback(() => {
    try {
      const storedData = sessionStorage.getItem(STORAGE_PREFIX);
      if (storedData) {
        setDiaryData(JSON.parse(storedData));
      }
      
      const storedLoadStatus = sessionStorage.getItem(`${STORAGE_PREFIX}-loaded`);
      if (storedLoadStatus) {
        setLoadedDates(JSON.parse(storedLoadStatus));
      }
      
      const pendingChanges = sessionStorage.getItem(`${STORAGE_PREFIX}-pending`);
      if (pendingChanges === 'true') {
        setHasPendingChanges(true);
      }
    } catch (error) {
      console.error('Error loading cached diary data:', error);
    }
  }, []);
  
  // Save all data to session storage
  const saveToSessionStorage = useCallback((data: DiaryCardData, isPending: boolean = hasPendingChanges) => {
    try {
      sessionStorage.setItem(STORAGE_PREFIX, JSON.stringify(data));
      sessionStorage.setItem(`${STORAGE_PREFIX}-pending`, isPending ? 'true' : 'false');
      sessionStorage.setItem(`${STORAGE_PREFIX}-loaded`, JSON.stringify(loadedDates));
    } catch (error) {
      console.error('Error saving to session storage:', error);
    }
  }, [hasPendingChanges, loadedDates]);
  
  // Load data for a specific day from the server
  const loadDay = useCallback(async (date: DateString) => {
    // Skip if already loaded
    if (loadedDates[date]) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get sleep data
      const sleepData = await diaryService.getSleepData(date);
      let updatedData = { ...diaryData };
      
      if (sleepData) {
        updatedData = {
          ...updatedData,
          sleep: {
            ...updatedData.sleep,
            [date]: sleepData
          }
        };
      }
      
      // Get emotions data
      const emotionsData = await diaryService.getEmotions(date);
      if (emotionsData.length > 0) {
        const emotionsMap: { [emotion: string]: string } = {};
        emotionsData.forEach(e => {
          emotionsMap[e.emotion] = e.intensity;
        });
        
        updatedData = {
          ...updatedData,
          emotions: {
            ...updatedData.emotions,
            [date]: emotionsMap
          }
        };
      }
      
      // Get urges data
      const urgesData = await diaryService.getUrges(date);
      if (urgesData.length > 0) {
        const urgesMap: { [urge: string]: { level: string, action: string } } = {};
        urgesData.forEach(u => {
          urgesMap[u.urgeType] = {
            level: u.level,
            action: u.action
          };
        });
        
        updatedData = {
          ...updatedData,
          urges: {
            ...updatedData.urges,
            [date]: urgesMap
          }
        };
      }
      
      // Get skills data
      const skillsData = await diaryService.getSkills(date);
      if (skillsData.length > 0) {
        let updatedSkills = { ...updatedData.skills };
        
        skillsData.forEach(s => {
          if (!updatedSkills[s.category]) {
            updatedSkills[s.category] = {};
          }
          
          if (!updatedSkills[s.category][s.skill]) {
            updatedSkills[s.category][s.skill] = {};
          }
          
          updatedSkills[s.category][s.skill] = {
            ...updatedSkills[s.category][s.skill],
            [date]: s.used
          };
        });
        
        updatedData = {
          ...updatedData,
          skills: updatedSkills
        };
      }
      
      // Get event data
      const eventData = await diaryService.getEvent(date);
      if (eventData) {
        updatedData = {
          ...updatedData,
          events: {
            ...updatedData.events,
            [date]: eventData.eventDescription
          }
        };
      }
      
      // Update state
      setDiaryData(updatedData);
      
      // Mark as loaded
      const newLoadedDates = { ...loadedDates, [date]: true };
      setLoadedDates(newLoadedDates);
      
      // Save to session storage
      saveToSessionStorage(updatedData);
      
    } catch (error) {
      console.error(`Error loading data for date ${date}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [diaryData, diaryService, loadedDates, saveToSessionStorage]);
  
  // Save all changes to the server
  const saveChanges = useCallback(async () => {
    if (!hasPendingChanges) return;
    
    setIsLoading(true);
    
    try {
      // Get all dates that have data
      const dates = new Set<string>();
      
      // Collect dates from all data types
      Object.keys(diaryData.sleep).forEach(date => dates.add(date));
      Object.keys(diaryData.emotions).forEach(date => dates.add(date));
      Object.keys(diaryData.urges).forEach(date => dates.add(date));
      Object.keys(diaryData.events).forEach(date => dates.add(date));
      
      // Add dates from skills
      Object.values(diaryData.skills).forEach(categorySkills => {
        Object.values(categorySkills).forEach(skillDates => {
          Object.keys(skillDates).forEach(date => dates.add(date));
        });
      });
      
      // Create a flat array of all API calls to make
      const apiCalls: Promise<any>[] = [];
      
      // Process each date
      dates.forEach(date => {
        // Only process loaded dates (that we got from the server initially)
        if (!loadedDates[date]) return;
        
        // Sleep data
        const sleepData = diaryData.sleep[date];
        if (sleepData) {
          Object.entries(sleepData).forEach(([field, value]) => {
            if (value) {
              apiCalls.push(
                diaryService.saveSleepData(
                  date as DateString, 
                  field as keyof SleepData, 
                  value.toString(), 
                  sleepData
                )
              );
            }
          });
        }
        
        // Emotions data
        const emotionsData = diaryData.emotions[date];
        if (emotionsData) {
          Object.entries(emotionsData).forEach(([emotion, intensity]) => {
            if (intensity) {
              apiCalls.push(diaryService.saveEmotion(date as DateString, emotion, intensity));
            }
          });
        }
        
        // Urges data
        const urgesData = diaryData.urges[date];
        if (urgesData) {
          Object.entries(urgesData).forEach(([urge, data]) => {
            if (data.level) {
              apiCalls.push(
                diaryService.saveUrge(
                  date as DateString, 
                  urge, 
                  'level', 
                  data.level,
                  data.level,
                  data.action
                )
              );
            }
            
            if (data.action) {
              apiCalls.push(
                diaryService.saveUrge(
                  date as DateString, 
                  urge, 
                  'action', 
                  data.action,
                  data.level,
                  data.action
                )
              );
            }
          });
        }
        
        // Events data
        const eventData = diaryData.events[date];
        if (eventData) {
          apiCalls.push(diaryService.saveEvent(date as DateString, eventData));
        }
      });
      
      // Skills data (needs special handling due to its structure)
      Object.entries(diaryData.skills).forEach(([category, skills]) => {
        Object.entries(skills).forEach(([skill, dates]) => {
          Object.entries(dates).forEach(([date, used]) => {
            // Only process loaded dates
            if (!loadedDates[date]) return;
            
            apiCalls.push(
              diaryService.saveSkill(date as DateString, category, skill, used)
            );
          });
        });
      });
      
      // Execute all API calls in parallel
      await Promise.all(apiCalls);
      
      // Clear pending changes flag
      setHasPendingChanges(false);
      
      // Update session storage
      saveToSessionStorage(diaryData, false);
      
    } catch (error) {
      console.error('Error saving diary data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [diaryData, diaryService, hasPendingChanges, loadedDates, saveToSessionStorage]);
  
  // Local state handlers
  
  // Sleep data handler
  const handleSleepChange = useCallback((date: DateString, field: keyof SleepData, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.sleep[date]?.[field] === value) {
      return;
    }
    
    // Update local state immediately
    const updatedData = {
      ...diaryData,
      sleep: {
        ...diaryData.sleep,
        [date]: {
          ...diaryData.sleep[date],
          [field]: value
        }
      }
    };
    
    setDiaryData(updatedData);
    setHasPendingChanges(true);
    saveToSessionStorage(updatedData, true);
  }, [diaryData, saveToSessionStorage]);
  
  // Emotion data handler
  const handleEmotionChange = useCallback((date: DateString, emotion: string, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.emotions[date]?.[emotion] === value) {
      return;
    }
    
    // Update local state immediately
    const updatedData = {
      ...diaryData,
      emotions: {
        ...diaryData.emotions,
        [date]: {
          ...diaryData.emotions[date],
          [emotion]: value
        }
      }
    };
    
    setDiaryData(updatedData);
    setHasPendingChanges(true);
    saveToSessionStorage(updatedData, true);
  }, [diaryData, saveToSessionStorage]);
  
  // Urge data handler
  const handleUrgeChange = useCallback((date: DateString, urge: string, field: 'level' | 'action', value: string) => {
    // Skip if value hasn't changed
    if (diaryData.urges[date]?.[urge]?.[field] === value) {
      return;
    }
    
    const updatedData = {
      ...diaryData,
      urges: {
        ...diaryData.urges,
        [date]: {
          ...diaryData.urges[date],
          [urge]: {
            ...diaryData.urges[date]?.[urge],
            [field]: value
          }
        }
      }
    };
    
    setDiaryData(updatedData);
    setHasPendingChanges(true);
    saveToSessionStorage(updatedData, true);
  }, [diaryData, saveToSessionStorage]);
  
  // Event data handler
  const handleEventChange = useCallback((date: DateString, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.events[date] === value) {
      return;
    }
    
    const updatedData = {
      ...diaryData,
      events: {
        ...diaryData.events,
        [date]: value
      }
    };
    
    setDiaryData(updatedData);
    setHasPendingChanges(true);
    saveToSessionStorage(updatedData, true);
  }, [diaryData, saveToSessionStorage]);
  
  // Skill data handler
  const handleSkillChange = useCallback((category: string, skill: string, date: DateString, checked: boolean) => {
    // Skip if value hasn't changed
    if (diaryData.skills[category]?.[skill]?.[date] === checked) {
      return;
    }
    
    // Create nested skill structure if not exists
    let updatedSkills = { ...diaryData.skills };
    
    if (!updatedSkills[category]) {
      updatedSkills[category] = {};
    }
    
    if (!updatedSkills[category][skill]) {
      updatedSkills[category][skill] = {};
    }
    
    updatedSkills[category][skill] = {
      ...updatedSkills[category][skill],
      [date]: checked
    };
    
    const updatedData = {
      ...diaryData,
      skills: updatedSkills
    };
    
    setDiaryData(updatedData);
    setHasPendingChanges(true);
    saveToSessionStorage(updatedData, true);
  }, [diaryData, saveToSessionStorage]);
  
  // Medication data handler (local only)
  const handleMedicationChange = useCallback((date: DateString, value: string) => {
    // Skip if value hasn't changed
    if (diaryData.medication[date] === value) {
      return;
    }
    
    const updatedData = {
      ...diaryData,
      medication: {
        ...diaryData.medication,
        [date]: value
      }
    };
    
    setDiaryData(updatedData);
    saveToSessionStorage(updatedData, hasPendingChanges);
  }, [diaryData, hasPendingChanges, saveToSessionStorage]);
  
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
    hasPendingChanges,
    loadInitialData,
    loadDay,
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
    getSkillChecked,
    saveChanges
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