// Repository interfaces for DBT Diary
// Following DDD, these define the contracts for data access

import { 
  DateString, 
  SleepData, 
  EmotionEntry, 
  UrgeEntry, 
  SkillEntry, 
  EventEntry,
  SleepEntry
} from './models';

// Repository interfaces
export interface IDiaryRepository {
  // Sleep
  getSleepData(date: DateString): Promise<SleepData | null>;
  saveSleepData(entry: SleepEntry): Promise<SleepData>;
  
  // Emotions
  getEmotions(date: DateString): Promise<EmotionEntry[]>;
  saveEmotion(entry: EmotionEntry): Promise<EmotionEntry>;
  
  // Urges
  getUrges(date: DateString): Promise<UrgeEntry[]>;
  saveUrge(entry: UrgeEntry): Promise<UrgeEntry>;
  
  // Skills
  getSkills(date: DateString): Promise<SkillEntry[]>;
  saveSkill(entry: SkillEntry): Promise<SkillEntry>;
  
  // Events
  getEvent(date: DateString): Promise<EventEntry | null>;
  saveEvent(entry: EventEntry): Promise<EventEntry>;
}