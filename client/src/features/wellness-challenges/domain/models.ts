/**
 * Domain models for the wellness challenges feature
 * These models define the core entities and value objects for the domain
 */
import { z } from 'zod';

/**
 * Enum for challenge types
 */
export enum ChallengeType {
  EMOTIONS = 'emotions',
  MEDITATION = 'meditation',
  JOURNALING = 'journaling',
  ACTIVITY = 'activity',
  CUSTOM = 'custom'
}

/**
 * Enum for challenge frequency
 */
export enum ChallengeFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

/**
 * Enum for challenge status
 */
export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

/**
 * Base wellness challenge entity
 */
export interface WellnessChallenge {
  id: number;
  userId: number;
  title: string;
  description?: string;
  challengeType: ChallengeType;
  frequency: ChallengeFrequency;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  targetValue: number;
  streak?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Challenge goal entity
 */
export interface ChallengeGoal {
  id: number;
  challengeId: number;
  description: string;
  targetValue: number;
  isCompleted: boolean;
  createdAt: string;
}

/**
 * Challenge progress entry
 */
export interface ChallengeProgress {
  id: number;
  challengeId: number;
  date: string;
  value: number;
  notes?: string;
  createdAt: string;
}

/**
 * Challenge with its details (goals and progress)
 */
export interface WellnessChallengeWithDetails extends WellnessChallenge {
  goals: ChallengeGoal[];
  progressEntries: ChallengeProgress[];
}

/**
 * Challenge statistics summary
 */
export interface ChallengeSummary {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  abandonedChallenges: number;
  averageCompletionRate: number;
}

/**
 * Challenge streak information
 */
export interface ChallengeStreak {
  challengeId: number;
  currentStreak: number;
  longestStreak: number;
}

/**
 * Challenge analytics
 */
export interface ChallengeAnalytics {
  summary: ChallengeSummary;
  currentStreaks: ChallengeStreak[];
  recentActivity: ChallengeProgress[];
}

/**
 * Validation schemas
 */

/**
 * Schema for creating a new challenge
 */
export const createChallengeSchema = z.object({
  userId: z.number(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  challengeType: z.nativeEnum(ChallengeType),
  frequency: z.nativeEnum(ChallengeFrequency),
  startDate: z.string(),
  endDate: z.string(),
  targetValue: z.number().positive('Target value must be positive')
});

/**
 * Type for creating a challenge
 */
export type CreateChallengeData = z.infer<typeof createChallengeSchema>;

/**
 * Schema for updating a challenge
 */
export const updateChallengeSchema = createChallengeSchema.omit({ userId: true }).partial();

/**
 * Type for updating a challenge
 */
export type UpdateChallengeData = z.infer<typeof updateChallengeSchema>;

/**
 * Schema for creating a goal
 */
export const createChallengeGoalSchema = z.object({
  challengeId: z.number(),
  description: z.string().min(3, 'Description must be at least 3 characters').max(200, 'Description cannot exceed 200 characters'),
  targetValue: z.number().positive('Target value must be positive')
});

/**
 * Type for creating a goal
 */
export type CreateChallengeGoalData = z.infer<typeof createChallengeGoalSchema>;

/**
 * Schema for recording progress
 */
export const createChallengeProgressSchema = z.object({
  challengeId: z.number(),
  date: z.string(),
  value: z.number().min(0, 'Value cannot be negative'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});

/**
 * Type for recording progress
 */
export type CreateChallengeProgressData = z.infer<typeof createChallengeProgressSchema>;