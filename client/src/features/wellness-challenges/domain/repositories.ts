/**
 * Repository interfaces for the Wellness Challenge system
 * Following the Dependency Inversion principle from SOLID
 */

import {
  WellnessChallenge,
  ChallengeGoal,
  ChallengeProgress,
  EmotionCategory,
  Emotion,
  UserEmotion,
  DateString,
  WellnessChallengeWithDetails,
  ChallengeSummary,
  ChallengeStreak,
  ChallengeType,
  ChallengeFrequency,
  ChallengeStatus
} from './models';

// Base repository interface to enforce common CRUD operations
export interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

// Specific repository interfaces
export interface IWellnessChallengeRepository extends IRepository<WellnessChallenge, number> {
  findByUserId(userId: number): Promise<WellnessChallenge[]>;
  findByDateRange(startDate: DateString, endDate: DateString, userId: number): Promise<WellnessChallenge[]>;
  findByType(type: ChallengeType, userId: number): Promise<WellnessChallenge[]>;
  findByStatus(status: ChallengeStatus, userId: number): Promise<WellnessChallenge[]>;
  findByFrequency(frequency: ChallengeFrequency, userId: number): Promise<WellnessChallenge[]>;
  getChallengeWithDetails(id: number): Promise<WellnessChallengeWithDetails | null>;
  getChallengeSummary(userId: number): Promise<ChallengeSummary>;
  getChallengeStreak(challengeId: number): Promise<ChallengeStreak>;
  updateStatus(id: number, status: ChallengeStatus): Promise<WellnessChallenge>;
}

export interface IChallengeGoalRepository extends IRepository<ChallengeGoal, number> {
  findByChallengeId(challengeId: number): Promise<ChallengeGoal[]>;
  bulkCreate(goals: Omit<ChallengeGoal, 'id' | 'createdAt'>[]): Promise<ChallengeGoal[]>;
}

export interface IChallengeProgressRepository extends IRepository<ChallengeProgress, number> {
  findByChallengeId(challengeId: number): Promise<ChallengeProgress[]>;
  findByDate(date: DateString, challengeId: number): Promise<ChallengeProgress | null>;
  findByDateRange(startDate: DateString, endDate: DateString, challengeId: number): Promise<ChallengeProgress[]>;
  upsertProgress(challengeId: number, date: DateString, value: number, notes?: string): Promise<ChallengeProgress>;
}

export interface IEmotionCategoryRepository extends IRepository<EmotionCategory, number> {
  findByName(name: string): Promise<EmotionCategory | null>;
}

export interface IEmotionRepository extends IRepository<Emotion, number> {
  findByCategoryId(categoryId: number): Promise<Emotion[]>;
  findByName(name: string): Promise<Emotion | null>;
  getEmotionsWithCategories(): Promise<Emotion[]>;
}

export interface IUserEmotionRepository extends IRepository<UserEmotion, number> {
  findByUserId(userId: number): Promise<UserEmotion[]>;
  findByUserIdAndCategoryId(userId: number, categoryId: number): Promise<UserEmotion[]>;
  getUserEmotionsWithCategories(userId: number): Promise<UserEmotion[]>;
}