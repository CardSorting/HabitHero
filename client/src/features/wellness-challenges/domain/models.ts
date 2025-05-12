/**
 * Models for the Wellness Challenge System using domain-driven design principles
 * These models represent the core business entities and value objects
 */

// Enums and Value Objects
export enum ChallengeFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum ChallengeType {
  EMOTIONS = 'emotions',
  MEDITATION = 'meditation',
  JOURNALING = 'journaling',
  ACTIVITY = 'activity',
  CUSTOM = 'custom'
}

export enum EmotionIntensity {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

// Date value object
export type DateString = string; // YYYY-MM-DD format

// Core Entities
export interface WellnessChallenge {
  id: number;
  userId: number;
  title: string;
  description?: string;
  type: ChallengeType;
  frequency: ChallengeFrequency;
  startDate: DateString;
  endDate: DateString;
  targetValue: number;
  status: ChallengeStatus;
  createdAt: string;
  updatedAt: string;
  
  // Derived properties
  progress?: number;
  completionPercentage?: number;
  daysRemaining?: number;
}

export interface ChallengeGoal {
  id: number;
  challengeId: number;
  title: string;
  description?: string;
  targetValue: number;
  createdAt: string;
  
  // Derived properties
  currentValue?: number;
  isCompleted?: boolean;
}

export interface ChallengeProgress {
  id: number;
  challengeId: number;
  date: DateString;
  value: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmotionCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export interface Emotion {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  createdAt: string;
  
  // Derived properties
  category?: EmotionCategory;
}

export interface UserEmotion {
  id: number;
  userId: number;
  categoryId: number;
  name: string;
  description?: string;
  createdAt: string;
  
  // Derived properties
  category?: EmotionCategory;
}

// Aggregate Roots
export interface WellnessChallengeWithDetails extends WellnessChallenge {
  goals: ChallengeGoal[];
  progressEntries: ChallengeProgress[];
}

// Events
export interface ChallengeCreatedEvent {
  challenge: WellnessChallenge;
  timestamp: string;
}

export interface ChallengeCompletedEvent {
  challengeId: number;
  completionDate: DateString;
  finalProgress: number;
  timestamp: string;
}

export interface DailyProgressUpdatedEvent {
  challengeId: number;
  date: DateString;
  value: number;
  previousValue?: number;
  timestamp: string;
}

// Analytics and Summary Models
export interface ChallengeSummary {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  abandonedChallenges: number;
  averageCompletionRate: number;
}

export interface ChallengeStreak {
  challengeId: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: DateString;
}

export interface EmotionTracking {
  date: DateString;
  emotions: { 
    name: string; 
    intensity: EmotionIntensity;
    category: string;
  }[];
}

// View Models (for UI)
export interface ChallengeCardViewModel {
  id: number;
  title: string;
  type: ChallengeType;
  frequency: ChallengeFrequency;
  progress: number;
  daysRemaining: number;
  progressColor: string;
  status: ChallengeStatus;
}

export interface ChallengeCalendarViewModel {
  date: DateString;
  isCompleted: boolean;
  value: number;
  targetValue: number;
  notes?: string;
}

export interface EmotionCalendarViewModel {
  date: DateString;
  emotions: string[];
  dominantEmotion?: string;
  dominantCategory?: string;
  colorCode: string;
}