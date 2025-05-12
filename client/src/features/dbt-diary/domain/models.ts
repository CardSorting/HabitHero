// Domain Models for DBT Diary
// Following DDD principles, these are the core business entities

export type DateString = string; // Format: YYYY-MM-DD

// Value Objects
export interface SleepData {
  hoursSlept: string;
  troubleFalling: string;
  troubleStaying: string;
  troubleWaking: string;
}

export interface EmotionIntensity {
  emotion: string;
  intensity: string;
}

// UrgeData interface removed

export interface SkillUsage {
  category: string;
  skill: string;
  used: boolean;
}

export interface EventData {
  eventDescription: string;
}

// Aggregate Roots
export interface DiaryCardEntry {
  date: DateString;
  userId: number;
}

export interface SleepEntry extends DiaryCardEntry {
  sleepData: SleepData;
}

export interface EmotionEntry extends DiaryCardEntry {
  emotion: string;
  intensity: string;
}

// UrgeEntry interface removed

export interface SkillEntry extends DiaryCardEntry {
  category: string;
  skill: string;
  used: boolean;
}

export interface EventEntry extends DiaryCardEntry {
  eventDescription: string;
}

// DTOs (Data Transfer Objects)
export interface DiaryCardData {
  sleep: Record<DateString, SleepData>;
  medication: Record<DateString, string>;
  emotions: Record<DateString, Record<string, string>>;
  urges: Record<DateString, Record<string, { level: string; action: string }>>;
  events: Record<DateString, string>;
  skills: Record<string, Record<string, Record<DateString, boolean>>>;
}

export const defaultDiaryCardData: DiaryCardData = {
  sleep: {},
  medication: {},
  emotions: {},
  urges: {},
  events: {},
  skills: {
    mindfulness: {},
    distressTolerance: {},
    emotionRegulation: {},
    interpersonalEffectiveness: {}
  }
};