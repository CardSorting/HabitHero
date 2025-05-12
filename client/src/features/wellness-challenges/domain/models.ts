/**
 * Domain models for the wellness challenge system following DDD principles
 */
import { z } from 'zod';

// Type definitions - Value Objects & basic types
export type DateString = string; // ISO 8601 format (YYYY-MM-DD)
export type PositiveNumber = number;
export type UUID = string;

// Enums - Value Objects
export enum ChallengeType {
  EMOTIONS = 'emotions',
  MEDITATION = 'meditation',
  JOURNALING = 'journaling',
  ACTIVITY = 'activity',
  CUSTOM = 'custom',
}

export enum ChallengeFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum EmotionIntensity {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

// Entity models
export interface WellnessChallenge {
  id: number;
  userId: number;
  title: string;
  description?: string;
  challengeType: ChallengeType;
  frequency: ChallengeFrequency;
  startDate: DateString;
  endDate: DateString;
  targetValue: PositiveNumber;
  status: ChallengeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeGoal {
  id: number;
  challengeId: number;
  title: string;
  description?: string;
  targetValue: PositiveNumber;
  createdAt: string;
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

// Extended model with aggregate relationships
export interface WellnessChallengeWithDetails extends WellnessChallenge {
  goals: ChallengeGoal[];
  progressEntries: ChallengeProgress[];
}

// View models (DTOs)
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
}

// Validation schemas
export const createChallengeSchema = z.object({
  userId: z.number().positive(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  challengeType: z.nativeEnum(ChallengeType),
  frequency: z.nativeEnum(ChallengeFrequency),
  startDate: z.string(), // ISO date string
  endDate: z.string(), // ISO date string
  targetValue: z.number().positive(),
});

export const updateChallengeSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  challengeType: z.nativeEnum(ChallengeType).optional(),
  frequency: z.nativeEnum(ChallengeFrequency).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetValue: z.number().positive().optional(),
  status: z.nativeEnum(ChallengeStatus).optional(),
});

export const createChallengeGoalSchema = z.object({
  challengeId: z.number().positive(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  targetValue: z.number().positive(),
});

export const createChallengeProgressSchema = z.object({
  challengeId: z.number().positive(),
  date: z.string(), // ISO date string
  value: z.number().min(0),
  notes: z.string().optional(),
});

// Types based on validation schemas
export type CreateChallengeData = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeData = z.infer<typeof updateChallengeSchema>;
export type CreateChallengeGoalData = z.infer<typeof createChallengeGoalSchema>;
export type CreateChallengeProgressData = z.infer<typeof createChallengeProgressSchema>;