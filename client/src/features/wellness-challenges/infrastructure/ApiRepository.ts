/**
 * API Repository implementations
 * These classes are responsible for communicating with the API endpoints
 */

import { apiRequest } from '@/lib/queryClient';
import {
  DateString,
  WellnessChallenge,
  ChallengeGoal,
  ChallengeProgress,
  EmotionCategory,
  Emotion,
  UserEmotion,
  WellnessChallengeWithDetails,
  ChallengeSummary,
  ChallengeStreak,
  ChallengeType,
  ChallengeFrequency,
  ChallengeStatus
} from '../domain/models';

import {
  IWellnessChallengeRepository,
  IChallengeGoalRepository,
  IChallengeProgressRepository,
  IEmotionCategoryRepository,
  IEmotionRepository,
  IUserEmotionRepository
} from '../domain/repositories';

/**
 * Base API Repository that implements common CRUD operations
 */
abstract class BaseApiRepository<T, ID> {
  constructor(protected baseUrl: string) {}
  
  async findById(id: ID): Promise<T | null> {
    try {
      return await apiRequest<T>(`${this.baseUrl}/${id}`, { method: 'GET' });
    } catch (error) {
      console.error(`Error fetching by ID (${id}):`, error);
      return null;
    }
  }
  
  async findAll(): Promise<T[]> {
    try {
      return await apiRequest<T[]>(this.baseUrl, { method: 'GET' });
    } catch (error) {
      console.error('Error fetching all items:', error);
      return [];
    }
  }
  
  async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    return await apiRequest<T>(this.baseUrl, {
      method: 'POST',
      data: entity
    });
  }
  
  async update(id: ID, entity: Partial<T>): Promise<T> {
    return await apiRequest<T>(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      data: entity
    });
  }
  
  async delete(id: ID): Promise<boolean> {
    try {
      await apiRequest(`${this.baseUrl}/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error(`Error deleting item (${id}):`, error);
      return false;
    }
  }
}

/**
 * Wellness Challenge Repository implementation
 */
export class ApiWellnessChallengeRepository 
  extends BaseApiRepository<WellnessChallenge, number> 
  implements IWellnessChallengeRepository {
  
  constructor() {
    super('/api/wellness-challenges');
  }
  
  async findByUserId(userId: number): Promise<WellnessChallenge[]> {
    try {
      return await apiRequest<WellnessChallenge[]>(`${this.baseUrl}?userId=${userId}`, { method: 'GET' });
    } catch (error) {
      console.error(`Error fetching challenges for user (${userId}):`, error);
      return [];
    }
  }
  
  async findByDateRange(startDate: DateString, endDate: DateString, userId: number): Promise<WellnessChallenge[]> {
    try {
      return await apiRequest<WellnessChallenge[]>(
        `${this.baseUrl}/date-range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching challenges by date range:`, error);
      return [];
    }
  }
  
  async findByType(type: ChallengeType, userId: number): Promise<WellnessChallenge[]> {
    try {
      return await apiRequest<WellnessChallenge[]>(
        `${this.baseUrl}/type/${type}?userId=${userId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching challenges by type (${type}):`, error);
      return [];
    }
  }
  
  async findByStatus(status: ChallengeStatus, userId: number): Promise<WellnessChallenge[]> {
    try {
      return await apiRequest<WellnessChallenge[]>(
        `${this.baseUrl}/status/${status}?userId=${userId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching challenges by status (${status}):`, error);
      return [];
    }
  }
  
  async findByFrequency(frequency: ChallengeFrequency, userId: number): Promise<WellnessChallenge[]> {
    try {
      return await apiRequest<WellnessChallenge[]>(
        `${this.baseUrl}/frequency/${frequency}?userId=${userId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching challenges by frequency (${frequency}):`, error);
      return [];
    }
  }
  
  async getChallengeWithDetails(id: number): Promise<WellnessChallengeWithDetails | null> {
    try {
      return await apiRequest<WellnessChallengeWithDetails>(
        `${this.baseUrl}/${id}/details`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching challenge details (${id}):`, error);
      return null;
    }
  }
  
  async getChallengeSummary(userId: number): Promise<ChallengeSummary> {
    try {
      return await apiRequest<ChallengeSummary>(
        `${this.baseUrl}/summary?userId=${userId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching challenge summary:`, error);
      return {
        totalChallenges: 0,
        activeChallenges: 0,
        completedChallenges: 0,
        abandonedChallenges: 0,
        averageCompletionRate: 0
      };
    }
  }
  
  async getChallengeStreak(challengeId: number): Promise<ChallengeStreak> {
    try {
      return await apiRequest<ChallengeStreak>(
        `${this.baseUrl}/${challengeId}/streak`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching challenge streak:`, error);
      return {
        challengeId,
        currentStreak: 0,
        longestStreak: 0
      };
    }
  }
  
  async updateStatus(id: number, status: ChallengeStatus): Promise<WellnessChallenge> {
    return await apiRequest<WellnessChallenge>(
      `${this.baseUrl}/${id}/status`,
      {
        method: 'POST',
        data: { status }
      }
    );
  }
}

/**
 * Challenge Goal Repository implementation
 */
export class ApiChallengeGoalRepository 
  extends BaseApiRepository<ChallengeGoal, number> 
  implements IChallengeGoalRepository {
  
  constructor() {
    super('/api/wellness-challenges/goals');
  }
  
  async findByChallengeId(challengeId: number): Promise<ChallengeGoal[]> {
    try {
      return await apiRequest<ChallengeGoal[]>(
        `${this.baseUrl}?challengeId=${challengeId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching goals for challenge (${challengeId}):`, error);
      return [];
    }
  }
  
  async bulkCreate(goals: Omit<ChallengeGoal, 'id' | 'createdAt'>[]): Promise<ChallengeGoal[]> {
    return await apiRequest<ChallengeGoal[]>(
      `${this.baseUrl}/bulk`,
      {
        method: 'POST',
        data: { goals }
      }
    );
  }
}

/**
 * Challenge Progress Repository implementation
 */
export class ApiChallengeProgressRepository 
  extends BaseApiRepository<ChallengeProgress, number> 
  implements IChallengeProgressRepository {
  
  constructor() {
    super('/api/wellness-challenges/progress');
  }
  
  async findByChallengeId(challengeId: number): Promise<ChallengeProgress[]> {
    try {
      return await apiRequest<ChallengeProgress[]>(
        `${this.baseUrl}?challengeId=${challengeId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching progress for challenge (${challengeId}):`, error);
      return [];
    }
  }
  
  async findByDate(date: DateString, challengeId: number): Promise<ChallengeProgress | null> {
    try {
      return await apiRequest<ChallengeProgress>(
        `${this.baseUrl}/date?challengeId=${challengeId}&date=${date}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching progress for date (${date}):`, error);
      return null;
    }
  }
  
  async findByDateRange(startDate: DateString, endDate: DateString, challengeId: number): Promise<ChallengeProgress[]> {
    try {
      return await apiRequest<ChallengeProgress[]>(
        `${this.baseUrl}/date-range?challengeId=${challengeId}&startDate=${startDate}&endDate=${endDate}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching progress by date range:`, error);
      return [];
    }
  }
  
  async upsertProgress(challengeId: number, date: DateString, value: number, notes?: string): Promise<ChallengeProgress> {
    return await apiRequest<ChallengeProgress>(
      `${this.baseUrl}/upsert`,
      {
        method: 'POST',
        data: { challengeId, date, value, notes }
      }
    );
  }
}

/**
 * Emotion Category Repository implementation
 */
export class ApiEmotionCategoryRepository 
  extends BaseApiRepository<EmotionCategory, number> 
  implements IEmotionCategoryRepository {
  
  constructor() {
    super('/api/emotion-categories');
  }
  
  async findByName(name: string): Promise<EmotionCategory | null> {
    try {
      const categories = await this.findAll();
      return categories.find(category => category.name.toLowerCase() === name.toLowerCase()) || null;
    } catch (error) {
      console.error(`Error fetching emotion category by name (${name}):`, error);
      return null;
    }
  }
}

/**
 * Emotion Repository implementation
 */
export class ApiEmotionRepository 
  extends BaseApiRepository<Emotion, number> 
  implements IEmotionRepository {
  
  constructor() {
    super('/api/emotions');
  }
  
  async findByCategoryId(categoryId: number): Promise<Emotion[]> {
    try {
      return await apiRequest<Emotion[]>(
        `${this.baseUrl}?categoryId=${categoryId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching emotions for category (${categoryId}):`, error);
      return [];
    }
  }
  
  async findByName(name: string): Promise<Emotion | null> {
    try {
      const emotions = await this.findAll();
      return emotions.find(emotion => emotion.name.toLowerCase() === name.toLowerCase()) || null;
    } catch (error) {
      console.error(`Error fetching emotion by name (${name}):`, error);
      return null;
    }
  }
  
  async getEmotionsWithCategories(): Promise<Emotion[]> {
    try {
      return await apiRequest<Emotion[]>(
        `${this.baseUrl}/with-categories`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching emotions with categories:`, error);
      return [];
    }
  }
}

/**
 * User Emotion Repository implementation
 */
export class ApiUserEmotionRepository 
  extends BaseApiRepository<UserEmotion, number> 
  implements IUserEmotionRepository {
  
  constructor() {
    super('/api/user-emotions');
  }
  
  async findByUserId(userId: number): Promise<UserEmotion[]> {
    try {
      return await apiRequest<UserEmotion[]>(
        `${this.baseUrl}?userId=${userId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching user emotions (${userId}):`, error);
      return [];
    }
  }
  
  async findByUserIdAndCategoryId(userId: number, categoryId: number): Promise<UserEmotion[]> {
    try {
      return await apiRequest<UserEmotion[]>(
        `${this.baseUrl}?userId=${userId}&categoryId=${categoryId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching user emotions by category:`, error);
      return [];
    }
  }
  
  async getUserEmotionsWithCategories(userId: number): Promise<UserEmotion[]> {
    try {
      return await apiRequest<UserEmotion[]>(
        `${this.baseUrl}/with-categories?userId=${userId}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error(`Error fetching user emotions with categories:`, error);
      return [];
    }
  }
}