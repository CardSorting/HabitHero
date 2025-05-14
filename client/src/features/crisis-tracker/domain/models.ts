/**
 * Domain models for the Crisis Events feature
 * Following DDD principles, these models represent the core business entities and value objects
 */

// Type aliases for primitive types with semantic meaning
export type DateString = string;
export type TimeString = string; // Format: HH:MM:SS
export type ID = number;

// Crisis Intensity enum - mirrors the DB enum
export enum CrisisIntensity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  EXTREME = 'extreme'
}

// Crisis Type enum - mirrors the DB enum
export enum CrisisType {
  PANIC_ATTACK = 'panic_attack',
  EMOTIONAL_CRISIS = 'emotional_crisis',
  SUICIDAL_THOUGHTS = 'suicidal_thoughts',
  SELF_HARM_URGE = 'self_harm_urge',
  SUBSTANCE_URGE = 'substance_urge',
  OTHER = 'other'
}

// Core domain entity for Crisis Event
export interface CrisisEvent {
  id: ID;
  userId: ID;
  type: CrisisType;
  date: DateString;
  time?: TimeString;
  intensity: CrisisIntensity;
  duration?: number; // in minutes
  notes?: string;
  symptoms?: string[];
  triggers?: string[];
  copingStrategiesUsed?: string[];
  copingStrategyEffectiveness?: number; // 1-10 scale
  helpSought: boolean;
  medication: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Data structure for creating a new crisis event
export interface CreateCrisisEventData {
  userId: ID;
  type: CrisisType;
  date: DateString;
  time?: TimeString;
  intensity: CrisisIntensity;
  duration?: number;
  notes?: string;
  symptoms?: string[];
  triggers?: string[];
  copingStrategiesUsed?: string[];
  copingStrategyEffectiveness?: number;
  helpSought: boolean;
  medication: boolean;
}

// Data structure for updating an existing crisis event
export interface UpdateCrisisEventData {
  id: ID;
  type?: CrisisType;
  date?: DateString;
  time?: TimeString;
  intensity?: CrisisIntensity;
  duration?: number;
  notes?: string;
  symptoms?: string[];
  triggers?: string[];
  copingStrategiesUsed?: string[];
  copingStrategyEffectiveness?: number;
  helpSought?: boolean;
  medication?: boolean;
}

// Analytics value objects
export interface CrisisAnalytics {
  totalEvents: number;
  byType: Record<string, number>;
  byIntensity: Record<string, number>;
  commonTriggers: string[];
  commonSymptoms: string[];
  effectiveCopingStrategies: string[];
  averageDuration: number;
}

export interface CrisisTimePeriodSummary {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: DateString;
  endDate: DateString;
  count: number;
  averageIntensity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Common symptom categories for panic/crisis tracking
export const CommonPanicSymptoms = [
  'Shortness of breath',
  'Racing heart',
  'Chest pain',
  'Feeling of choking',
  'Nausea',
  'Dizziness',
  'Trembling or shaking',
  'Sweating',
  'Chills or hot flashes',
  'Numbness or tingling',
  'Feeling of unreality',
  'Fear of losing control',
  'Fear of dying',
];

// Common crisis triggers
export const CommonCrisisTriggers = [
  'Social situation',
  'Work stress',
  'Relationship conflict',
  'Financial pressure',
  'Health concerns',
  'Past trauma reminder',
  'Substance use',
  'Sleep deprivation',
  'Medication change',
  'Sensory overload',
  'Uncertainty',
  'Criticism or rejection',
  'Physical pain',
  'Negative news/media',
];

// Common coping strategies
export const CommonCopingStrategies = [
  'Deep breathing',
  'Progressive muscle relaxation',
  'Grounding techniques',
  'Mindfulness meditation',
  'Distraction activities',
  'Physical exercise',
  'Talking to a friend/therapist',
  'Cold water on face/hands',
  'Using PRN medication',
  'Self-soothing with comfort items',
  'Journaling',
  'Positive self-talk',
  'Opposite action (DBT)',
  'TIPP skills (DBT)',
];