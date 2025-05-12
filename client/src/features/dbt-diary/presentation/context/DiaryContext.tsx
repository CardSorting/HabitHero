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

// Track whether data has been fetched for the date
type FetchStatus = {
  [key: string]: {
    sleep?: boolean;
    emotions?: boolean;
    urges?: boolean;
    skills?: boolean;
    events?: boolean;
  }
};

// Track unsaved changes
type PendingSaves = {
  sleep: Map<string, SleepData>;
  emotions: Map<string, { [emotion: string]: string }>;
  urges: Map<string, { [urge: string]: { level: string, action: string } }>;
  skills: Map<string, { category: string, skill: string, used: boolean }[]>;
  events: Map<string, string>;
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
  saveAllChanges: () => Promise<void>;
  hasPendingChanges: boolean;
  loadDataForDate: (date: DateString) => Promise<void>;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

interface DiaryProviderProps {
  children: ReactNode;
  userId: number;
}

export const DiaryProvider: React.FC<DiaryProviderProps> = ({ children, userId }) => {
  const [diaryData, setDiaryData] = useState<DiaryCardData>(defaultDiaryCardData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  
  // Use refs to store state that doesn't need to trigger renders
  const fetchStatusRef = useRef<FetchStatus>({});
  const previousStateRef = useRef<DiaryCardData>(defaultDiaryCardData);
  const pendingSavesRef = useRef<PendingSaves>({
    sleep: new Map(),
    emotions: new Map(),
    urges: new Map(),
    skills: new Map(),
    events: new Map()
  });
  
  // Initialize the diary service with the repository
  const diaryService = new DiaryService(new ApiDiaryRepository(userId), userId);
  
  // Load initial data from localStorage
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const savedData = localStorage.getItem(`dbt-diary-${today}`);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setDiaryData(parsedData);
      } catch (error) {
        console.error('Error parsing saved diary data:', error);
      }
    }
  }, []);
  
  // Load specific data types for a date
  const loadDataForDate = useCallback(async (date: DateString) => {
    // If we've already fetched all data for this date, skip
    if (fetchStatusRef.current[date]?.sleep && 
        fetchStatusRef.current[date]?.emotions && 
        fetchStatusRef.current[date]?.urges && 
        fetchStatusRef.current[date]?.skills && 
        fetchStatusRef.current[date]?.events) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create initial fetch status if it doesn't exist
      if (!fetchStatusRef.current[date]) {
        fetchStatusRef.current[date] = {};
      }
      
      // Load sleep data if not already loaded
      if (!fetchStatusRef.current[date]?.sleep) {
        const sleepData = await diaryService.getSleepData(date);
        if (sleepData) {
          setDiaryData(prev => ({
            ...prev,
            sleep: {
              ...prev.sleep,
              [date]: sleepData
            }
          }));
        }
        fetchStatusRef.current[date].sleep = true;
      }
      
      // Load emotions data if not already loaded
      if (!fetchStatusRef.current[date]?.emotions) {
        const emotionsData = await diaryService.getEmotions(date);
        if (emotionsData.length > 0) {
          const emotionsMap: { [emotion: string]: string } = {};
          emotionsData.forEach(e => {
            emotionsMap[e.emotion] = e.intensity;
          });
          
          setDiaryData(prev => ({
            ...prev,
            emotions: {
              ...prev.emotions,
              [date]: emotionsMap
            }
          }));
        }
        fetchStatusRef.current[date].emotions = true;
      }
      
      // Load urges data if not already loaded
      if (!fetchStatusRef.current[date]?.urges) {
        const urgesData = await diaryService.getUrges(date);
        if (urgesData.length > 0) {
          const urgesMap: { [urge: string]: { level: string, action: string } } = {};
          urgesData.forEach(u => {
            urgesMap[u.urgeType] = {
              level: u.level,
              action: u.action
            };
          });
          
          setDiaryData(prev => ({
            ...prev,
            urges: {
              ...prev.urges,
              [date]: urgesMap
            }
          }));
        }
        fetchStatusRef.current[date].urges = true;
      }
      
      // Load skills data if not already loaded
      if (!fetchStatusRef.current[date]?.skills) {
        const skillsData = await diaryService.getSkills(date);
        if (skillsData.length > 0) {
          const skillsMap: { [category: string]: { [skill: string]: { [date: string]: boolean } } } = {};
          
          skillsData.forEach(s => {
            if (!skillsMap[s.category]) {
              skillsMap[s.category] = {};
            }
            
            if (!skillsMap[s.category][s.skill]) {
              skillsMap[s.category][s.skill] = {};
            }
            
            skillsMap[s.category][s.skill][date] = s.used;
          });
          
          setDiaryData(prev => {
            const newSkills = {...prev.skills};
            
            // Merge skill data
            Object.entries(skillsMap).forEach(([category, skills]) => {
              if (!newSkills[category]) {
                newSkills[category] = {};
              }
              
              Object.entries(skills).forEach(([skill, dates]) => {
                if (!newSkills[category][skill]) {
                  newSkills[category][skill] = {};
                }
                
                Object.assign(newSkills[category][skill], dates);
              });
            });
            
            return {
              ...prev,
              skills: newSkills
            };
          });
        }
        fetchStatusRef.current[date].skills = true;
      }
      
      // Load events data if not already loaded
      if (!fetchStatusRef.current[date]?.events) {
        const eventData = await diaryService.getEvent(date);
        if (eventData) {
          setDiaryData(prev => ({
            ...prev,
            events: {
              ...prev.events,
              [date]: eventData.eventDescription
            }
          }));
        }
        fetchStatusRef.current[date].events = true;
      }
      
      // Save to local storage
      const currentState = { ...diaryData };
      localStorage.setItem(`dbt-diary-${date}`, JSON.stringify(currentState));
      
    } catch (error) {
      console.error(`Error loading data for date ${date}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [diaryService, diaryData]);
  
  // Load week data - but only load a minimal amount initially
  const loadWeekData = useCallback(async (dates: DateString[]) => {
    setIsLoading(true);
    
    try {
      // Load data from local storage first for instant display
      const weekKey = dates[0]; // Use the first date as the key
      const savedData = localStorage.getItem(`dbt-diary-${weekKey}`);
      
      if (savedData) {
        setDiaryData(JSON.parse(savedData));
      }
      
      // Just pre-load data for the first date
      // Other dates will be loaded on demand when the user interacts with them
      if (dates.length > 0) {
        await loadDataForDate(dates[0]);
      }
      
    } catch (error) {
      console.error('Error loading week data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadDataForDate]);
  
  // Save all pending changes to the server
  const saveAllChanges = useCallback(async () => {
    if (!hasPendingChanges) return;
    
    setIsLoading(true);
    try {
      // Save sleep data
      const sleepPromises: Promise<any>[] = [];
      pendingSavesRef.current.sleep.forEach((data, date) => {
        // For each field in the sleep data
        Object.entries(data).forEach(([field, value]) => {
          if (value && value.toString().trim() !== '') {
            sleepPromises.push(
              diaryService.saveSleepData(
                date, 
                field as keyof SleepData, 
                value.toString(), 
                diaryData.sleep[date]
              )
            );
          }
        });
      });
      
      // Save emotions data
      const emotionPromises: Promise<any>[] = [];
      pendingSavesRef.current.emotions.forEach((data, date) => {
        Object.entries(data).forEach(([emotion, intensity]) => {
          if (intensity && intensity.trim() !== '') {
            emotionPromises.push(
              diaryService.saveEmotion(date, emotion, intensity)
            );
          }
        });
      });
      
      // Save urges data
      const urgePromises: Promise<any>[] = [];
      pendingSavesRef.current.urges.forEach((data, date) => {
        Object.entries(data).forEach(([urge, details]) => {
          // Only save if either level or action has a value
          if ((details.level && details.level.trim() !== '') || 
              (details.action && details.action.trim() !== '')) {
            
            urgePromises.push(
              diaryService.saveUrge(
                date, 
                urge, 
                'level', 
                details.level, 
                details.level, 
                details.action
              )
            );
            
            // Only save action if it has a value
            if (details.action && details.action.trim() !== '') {
              urgePromises.push(
                diaryService.saveUrge(
                  date, 
                  urge, 
                  'action', 
                  details.action, 
                  details.level, 
                  details.action
                )
              );
            }
          }
        });
      });
      
      // Save skills data
      const skillPromises: Promise<any>[] = [];
      pendingSavesRef.current.skills.forEach((skills, date) => {
        skills.forEach(skill => {
          skillPromises.push(
            diaryService.saveSkill(date, skill.category, skill.skill, skill.used)
          );
        });
      });
      
      // Save events data
      const eventPromises: Promise<any>[] = [];
      pendingSavesRef.current.events.forEach((event, date) => {
        if (event && event.trim() !== '') {
          eventPromises.push(
            diaryService.saveEvent(date, event)
          );
        }
      });
      
      // Wait for all saves to complete
      await Promise.all([
        ...sleepPromises,
        ...emotionPromises,
        ...urgePromises,
        ...skillPromises,
        ...eventPromises
      ]);
      
      // Clear pending saves
      pendingSavesRef.current = {
        sleep: new Map(),
        emotions: new Map(),
        urges: new Map(),
        skills: new Map(),
        events: new Map()
      };
      
      setHasPendingChanges(false);
      
      // Save current state to local storage
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      localStorage.setItem(`dbt-diary-${currentDate}`, JSON.stringify(diaryData));
      
    } catch (error) {
      console.error('Error saving diary data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [diaryService, diaryData, hasPendingChanges]);
  
  // Sleep data handlers
  const handleSleepChange = useCallback((date: DateString, field: keyof SleepData, value: string) => {
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
    
    // Add to pending saves
    const currentSleepData = pendingSavesRef.current.sleep.get(date) || {};
    pendingSavesRef.current.sleep.set(date, {
      ...currentSleepData,
      [field]: value
    });
    
    setHasPendingChanges(true);
  }, [diaryData.sleep]);
  
  // Emotion data handlers
  const handleEmotionChange = useCallback((date: DateString, emotion: string, value: string) => {
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
    
    // Add to pending saves
    const currentEmotions = pendingSavesRef.current.emotions.get(date) || {};
    pendingSavesRef.current.emotions.set(date, {
      ...currentEmotions,
      [emotion]: value
    });
    
    setHasPendingChanges(true);
  }, [diaryData.emotions]);
  
  // Urge data handlers
  const handleUrgeChange = useCallback((date: DateString, urge: string, field: 'level' | 'action', value: string) => {
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
    
    // Add to pending saves
    const currentUrges = pendingSavesRef.current.urges.get(date) || {};
    const currentUrgeData = currentUrges[urge] || { level: '', action: '' };
    
    // Make sure we preserve the other field
    const currentLevel = field === 'level' ? value : (currentUrgeData.level || diaryData.urges[date]?.[urge]?.level || '');
    const currentAction = field === 'action' ? value : (currentUrgeData.action || diaryData.urges[date]?.[urge]?.action || '');
    
    pendingSavesRef.current.urges.set(date, {
      ...currentUrges,
      [urge]: {
        level: currentLevel,
        action: currentAction
      }
    });
    
    setHasPendingChanges(true);
  }, [diaryData.urges]);
  
  // Event data handlers
  const handleEventChange = useCallback((date: DateString, value: string) => {
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
    
    // Add to pending saves
    pendingSavesRef.current.events.set(date, value);
    
    setHasPendingChanges(true);
  }, [diaryData.events]);
  
  // Skill data handlers
  const handleSkillChange = useCallback((category: string, skill: string, date: DateString, checked: boolean) => {
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
    
    // Add to pending saves
    const currentSkills = pendingSavesRef.current.skills.get(date) || [];
    
    // Remove any existing entry for this skill
    const filteredSkills = currentSkills.filter(
      s => !(s.category === category && s.skill === skill)
    );
    
    // Add the new skill change
    filteredSkills.push({
      category,
      skill,
      used: checked
    });
    
    pendingSavesRef.current.skills.set(date, filteredSkills);
    
    setHasPendingChanges(true);
  }, [diaryData.skills]);
  
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
    getSkillChecked,
    saveAllChanges,
    hasPendingChanges,
    loadDataForDate
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