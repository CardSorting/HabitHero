/**
 * API implementation of the wellness challenge repository
 * This concrete implementation communicates with the backend API
 */
import { apiRequest } from '@/lib/queryClient';
import {
  WellnessChallenge,
  WellnessChallengeWithDetails,
  ChallengeGoal,
  ChallengeProgress,
  ChallengeSummary,
  ChallengeStreak,
  ChallengeStatus,
  ChallengeType,
  CreateChallengeData,
  UpdateChallengeData,
  CreateChallengeGoalData,
  CreateChallengeProgressData
} from '../domain/models';
import { WellnessChallengeRepository } from '../domain/WellnessChallengeRepository';

/**
 * Implementation of the repository interface that communicates with the API
 */
export class ApiWellnessChallengeRepository implements WellnessChallengeRepository {
  /**
   * API base path for wellness challenges
   */
  private basePath = '/api/wellness-challenges';
  
  /**
   * Get all challenges
   */
  async getAllChallenges(): Promise<WellnessChallenge[]> {
    return await apiRequest(`${this.basePath}`);
  }
  
  /**
   * Get challenges for a specific user
   */
  async getChallengesByUser(userId: number): Promise<WellnessChallenge[]> {
    return await apiRequest(`${this.basePath}/user/${userId}`);
  }
  
  /**
   * Get challenges with a specific status
   */
  async getChallengesByStatus(status: ChallengeStatus): Promise<WellnessChallenge[]> {
    return await apiRequest(`${this.basePath}/status/${status}`);
  }
  
  /**
   * Get challenges of a specific type
   */
  async getChallengesByType(type: ChallengeType): Promise<WellnessChallenge[]> {
    return await apiRequest(`${this.basePath}/type/${type}`);
  }
  
  /**
   * Get active challenges for a user
   */
  async getActiveChallengesForUser(userId: number): Promise<WellnessChallenge[]> {
    return await apiRequest(`${this.basePath}/user/${userId}/active`);
  }
  
  /**
   * Get a challenge by ID with its goals and progress
   */
  async getChallengeById(id: number): Promise<WellnessChallengeWithDetails> {
    return await apiRequest(`${this.basePath}/${id}`);
  }
  
  /**
   * Get challenge summary statistics
   */
  async getChallengeSummary(userId: number): Promise<ChallengeSummary> {
    return await apiRequest(`${this.basePath}/summary/${userId}`);
  }
  
  /**
   * Get streak information for a challenge
   */
  async getChallengeStreak(challengeId: number): Promise<ChallengeStreak> {
    return await apiRequest(`${this.basePath}/${challengeId}/streak`);
  }
  
  /**
   * Create a new challenge
   */
  async createChallenge(data: CreateChallengeData): Promise<WellnessChallenge> {
    return await apiRequest(`${this.basePath}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  /**
   * Update an existing challenge
   */
  async updateChallenge(id: number, data: UpdateChallengeData): Promise<WellnessChallenge> {
    return await apiRequest(`${this.basePath}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  /**
   * Delete a challenge
   */
  async deleteChallenge(id: number): Promise<boolean> {
    const response = await apiRequest(`${this.basePath}/${id}`, {
      method: 'DELETE',
    });
    
    return response.success || false;
  }
  
  /**
   * Update challenge status
   */
  async updateChallengeStatus(id: number, status: ChallengeStatus): Promise<WellnessChallenge> {
    return await apiRequest(`${this.basePath}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  /**
   * Get goals for a challenge
   */
  async getChallengeGoals(challengeId: number): Promise<ChallengeGoal[]> {
    return await apiRequest(`${this.basePath}/${challengeId}/goals`);
  }
  
  /**
   * Create a goal for a challenge
   */
  async createChallengeGoal(data: CreateChallengeGoalData): Promise<ChallengeGoal> {
    return await apiRequest(`${this.basePath}/goals`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  /**
   * Get all progress entries for a challenge
   */
  async getChallengeProgress(challengeId: number): Promise<ChallengeProgress[]> {
    return await apiRequest(`${this.basePath}/${challengeId}/progress`);
  }
  
  /**
   * Record progress for a challenge
   */
  async recordChallengeProgress(data: CreateChallengeProgressData): Promise<ChallengeProgress> {
    return await apiRequest(`${this.basePath}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  /**
   * Get progress for a specific date
   */
  async getChallengeProgressForDate(challengeId: number, date: string): Promise<ChallengeProgress[]> {
    return await apiRequest(`${this.basePath}/${challengeId}/progress/date/${date}`);
  }
}