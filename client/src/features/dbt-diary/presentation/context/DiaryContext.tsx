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
  handleEventChange: (date: DateString, value: string) => void;
  handleSkillChange: (category: string, skill: string, date: DateString, checked: boolean) => void;
  handleMedicationChange: (date: DateString, value: string) => void;
  
  // Data retrieval helpers
  getSleepValue: (date: DateString, field: keyof SleepData) => string;
  getEmotionValue: (date: DateString, emotion: string) => string;
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
      
      // Merge urges data removed
      
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
    console.log(`Sleep change triggered - Date: ${date}, Field: ${field}, Value: ${value}`);
    
    // Skip if value hasn't changed
    if (diaryData.sleep[date]?.[field] === value) {
      console.log('Value unchanged, skipping update');
      return;
    }
    
    console.log('Updating sleep data in state', { 
      current: diaryData.sleep[date]?.[field], 
      new: value 
    });
    
    // Update local state immediately
    setDiaryData(prev => {
      // Ensure we have an object for this date
      const dateData = prev.sleep[date] || {
        hoursSlept: '',
        troubleFalling: '',
        troubleStaying: '',
        troubleWaking: ''
      };
      
      const updated = {
        ...prev,
        sleep: {
          ...prev.sleep,
          [date]: {
            ...dateData,
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
    console.log(`Emotion change triggered - Date: ${date}, Emotion: ${emotion}, Value: ${value}`);
    
    // Skip if value hasn't changed
    if (diaryData.emotions[date]?.[emotion] === value) {
      console.log('Emotion value unchanged, skipping update');
      return;
    }
    
    console.log('Updating emotion data in state', { 
      current: diaryData.emotions[date]?.[emotion], 
      new: value 
    });
    
    // Update local state immediately
    setDiaryData(prev => {
      // Ensure we have an object for this date
      const dateEmotions = prev.emotions[date] || {};
      
      const updated = {
        ...prev,
        emotions: {
          ...prev.emotions,
          [date]: {
            ...dateEmotions,
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
  
  // Urge data handler removed
  
  // Event data handler
  const handleEventChange = useCallback((date: DateString, value: string) => {
    console.log(`Event change triggered - Date: ${date}, Value: ${value}`);
    
    // Skip if value hasn't changed
    if (diaryData.events[date] === value) {
      console.log('Event value unchanged, skipping update');
      return;
    }
    
    console.log('Updating event data in state', { 
      current: diaryData.events[date], 
      new: value 
    });
    
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
    console.log(`Skill change triggered - Category: ${category}, Skill: ${skill}, Date: ${date}, Checked: ${checked}`);
    
    // Skip if value hasn't changed
    if (diaryData.skills[category]?.[skill]?.[date] === checked) {
      console.log('Skill value unchanged, skipping update');
      return;
    }
    
    console.log('Updating skill data in state', { 
      category,
      skill,
      date,
      current: diaryData.skills[category]?.[skill]?.[date], 
      new: checked 
    });
    
    setDiaryData(prev => {
      // Create a deep copy of the skills structure
      const updatedSkills = { ...prev.skills };
      
      // Create category if it doesn't exist
      if (!updatedSkills[category]) {
        console.log(`Creating new category: ${category}`);
        updatedSkills[category] = {};
      }
      
      // Create skill if it doesn't exist
      if (!updatedSkills[category][skill]) {
        console.log(`Creating new skill: ${skill} in category ${category}`);
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
    console.log(`Medication change triggered - Date: ${date}, Value: ${value}`);
    
    // Skip if value hasn't changed
    if (diaryData.medication[date] === value) {
      console.log('Medication value unchanged, skipping update');
      return;
    }
    
    console.log('Updating medication data in state', { 
      current: diaryData.medication[date], 
      new: value 
    });
    
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
    console.log(`Getting sleep value for date: ${date}, field: ${field}`);
    return diaryData.sleep[date]?.[field] || '';
  }, [diaryData.sleep]);
  
  const getEmotionValue = useCallback((date: DateString, emotion: string): string => {
    console.log(`Getting emotion value for date: ${date}, emotion: ${emotion}`);
    return diaryData.emotions[date]?.[emotion] || '';
  }, [diaryData.emotions]);
  
  // getUrgeValue removed
  
  const getEventValue = useCallback((date: DateString): string => {
    console.log(`Getting event value for date: ${date}`);
    return diaryData.events[date] || '';
  }, [diaryData.events]);
  
  const getMedicationValue = useCallback((date: DateString): string => {
    console.log(`Getting medication value for date: ${date}`);
    return diaryData.medication[date] || '';
  }, [diaryData.medication]);
  
  const getSkillChecked = useCallback((category: string, skill: string, date: DateString): boolean => {
    console.log(`Getting skill checked status for category: ${category}, skill: ${skill}, date: ${date}`);
    return diaryData.skills[category]?.[skill]?.[date] || false;
  }, [diaryData.skills]);

  // Load data for a specific day from the server
  const loadDay = useCallback(async (date: DateString) => {
    console.log(`Loading data for date: ${date}`);
    
    // Skip if already loaded or currently loading
    if (serverData[date] || isLoading) {
      console.log(`Data for ${date} already loaded or currently loading`);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Initialize empty data structures for this date even if no data is returned
      // This helps ensure all fields are properly initialized
      setDiaryData(prev => {
        const updated = { ...prev };
        
        // Initialize sleep data
        if (!updated.sleep[date]) {
          updated.sleep[date] = {
            hoursSlept: '',
            troubleFalling: '',
            troubleStaying: '',
            troubleWaking: ''
          };
        }
        
        // Initialize emotions data
        if (!updated.emotions[date]) {
          updated.emotions[date] = {};
        }
        
        // Initialize events data
        if (!updated.events[date]) {
          updated.events[date] = '';
        }
        
        // Initialize medication data
        if (!updated.medication[date]) {
          updated.medication[date] = '';
        }
        
        return updated;
      });
      
      // Get sleep data
      console.log(`Fetching sleep data for ${date}`);
      const sleepData = await diaryService.getSleepData(date);
      if (sleepData) {
        console.log(`Received sleep data for ${date}:`, sleepData);
        setDiaryData(prev => ({
          ...prev,
          sleep: {
            ...prev.sleep,
            [date]: sleepData
          }
        }));
      } else {
        console.log(`No sleep data returned for ${date}`);
      }
      
      // Get emotions data
      console.log(`Fetching emotions data for ${date}`);
      const emotions = await diaryService.getEmotions(date);
      if (emotions.length > 0) {
        console.log(`Received emotions data for ${date}:`, emotions);
        const emotionsMap: { [emotion: string]: string } = {};
        emotions.forEach(entry => {
          emotionsMap[entry.emotion] = entry.intensity;
        });
        
        setDiaryData(prev => ({
          ...prev,
          emotions: {
            ...prev.emotions,
            [date]: emotionsMap
          }
        }));
      } else {
        console.log(`No emotions data returned for ${date}`);
      }
      
      // Urges data loading removed
      
      // Get skills data
      console.log(`Fetching skills data for ${date}`);
      const skills = await diaryService.getSkills(date);
      if (skills.length > 0) {
        console.log(`Received skills data for ${date}:`, skills);
        const updatedSkills = { ...diaryData.skills };
        
        skills.forEach(entry => {
          if (!updatedSkills[entry.category]) {
            updatedSkills[entry.category] = {};
          }
          
          if (!updatedSkills[entry.category][entry.skill]) {
            updatedSkills[entry.category][entry.skill] = {};
          }
          
          updatedSkills[entry.category][entry.skill][date] = entry.used;
        });
        
        setDiaryData(prev => ({
          ...prev,
          skills: updatedSkills
        }));
      } else {
        console.log(`No skills data returned for ${date}`);
      }
      
      // Get event data
      console.log(`Fetching event data for ${date}`);
      const event = await diaryService.getEvent(date);
      if (event) {
        console.log(`Received event data for ${date}:`, event);
        setDiaryData(prev => ({
          ...prev,
          events: {
            ...prev.events,
            [date]: event.eventDescription || ''
          }
        }));
      } else {
        console.log(`No event data returned for ${date}`);
      }
      
      // Mark date as loaded from server
      markDateLoaded(date);
      console.log(`Data loading complete for ${date}`);
      
    } catch (error) {
      console.error(`Error loading data for ${date}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [diaryData.skills, diaryService, isLoading, markDateLoaded, serverData]);
  
  // Save all pending changes to the server
  const saveChanges = useCallback(async () => {
    console.log('saveChanges called, hasPendingChanges:', hasPendingChanges);
    console.log('Current diaryData state:', JSON.stringify(diaryData, null, 2));
    
    if (!hasPendingChanges) {
      console.log('No pending changes to save, returning early');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Gather all dates with pending changes - include all data sources
      const dates = Object.keys(diaryData.sleep)
        .concat(Object.keys(diaryData.emotions))
        .concat(Object.keys(diaryData.events))
        .concat(Object.keys(diaryData.medication))
        .filter((date, index, self) => self.indexOf(date) === index) as DateString[];
      
      console.log(`Found ${dates.length} dates with data to save:`, dates);
      
      // Process each date
      for (const date of dates) {
        console.log(`Processing date: ${date}`);
        
        try {
          // Save sleep data if it exists
          if (diaryData.sleep[date]) {
            console.log(`Processing sleep data for ${date}:`, diaryData.sleep[date]);
            const sleepData = diaryData.sleep[date];
            for (const field of Object.keys(sleepData) as Array<keyof SleepData>) {
              try {
                if (sleepData[field]) {
                  console.log(`Saving sleep field ${field}: ${sleepData[field]}`);
                  await diaryService.saveSleepData(date, field, sleepData[field], sleepData);
                  console.log(`Successfully saved sleep field ${field}`);
                }
              } catch (fieldError) {
                console.error(`Error saving sleep field ${field}:`, fieldError);
              }
            }
          } else {
            console.log(`No sleep data to save for ${date}`);
          }
          
          // Save emotions data
          if (diaryData.emotions[date]) {
            const emotions = diaryData.emotions[date];
            console.log(`Processing emotions data for ${date}:`, emotions);
            
            for (const [emotion, intensity] of Object.entries(emotions)) {
              try {
                if (intensity) {
                  console.log(`Saving emotion ${emotion} with intensity ${intensity}`);
                  await diaryService.saveEmotion(date, emotion, intensity);
                  console.log(`Successfully saved emotion ${emotion}`);
                } else {
                  console.log(`Skipping empty emotion: ${emotion}`);
                }
              } catch (emotionError) {
                console.error(`Error saving emotion ${emotion}:`, emotionError);
              }
            }
          } else {
            console.log(`No emotions data to save for ${date}`);
          }
          
          // Urges section removed
          
          // Save skills data
          console.log(`Processing skills data for ${date}`);
          let skillCount = 0;
          
          for (const category in diaryData.skills) {
            for (const skill in diaryData.skills[category]) {
              try {
                if (diaryData.skills[category][skill][date] !== undefined) {
                  const used = diaryData.skills[category][skill][date];
                  console.log(`Saving skill ${category}.${skill}: ${used}`);
                  await diaryService.saveSkill(date, category, skill, used);
                  console.log(`Successfully saved skill ${category}.${skill}`);
                  skillCount++;
                }
              } catch (skillError) {
                console.error(`Error saving skill ${category}.${skill}:`, skillError);
              }
            }
          }
          
          if (skillCount === 0) {
            console.log(`No skills data to save for ${date}`);
          }
          
          // Save event data
          if (diaryData.events[date]) {
            try {
              console.log(`Saving event for ${date}: ${diaryData.events[date]}`);
              await diaryService.saveEvent(date, diaryData.events[date]);
              console.log(`Successfully saved event for ${date}`);
            } catch (eventError) {
              console.error(`Error saving event for ${date}:`, eventError);
            }
          } else {
            console.log(`No event data to save for ${date}`);
          }
        } catch (dateError) {
          console.error(`Error processing date ${date}:`, dateError);
          // Continue with next date even if this one fails
        }
      }
      
      // Mark all changes as saved
      markAsSaved();
      console.log('All changes saved successfully');
      
    } catch (error) {
      console.error('Error in saveChanges:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [diaryData, diaryService, hasPendingChanges, markAsSaved]);
  
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
    handleEventChange,
    handleSkillChange,
    handleMedicationChange,
    getSleepValue,
    getEmotionValue,
    getEventValue,
    getMedicationValue,
    getSkillChecked,
    // Add the missing methods
    loadDay,
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