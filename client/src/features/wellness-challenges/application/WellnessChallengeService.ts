/**
 * Service layer for Wellness Challenge feature
 * Implements use cases by coordinating domain objects and repositories
 */
import { 
  WellnessChallenge, 
  WellnessChallengeWithDetails, 
  ChallengeGoal, 
  ChallengeProgress, 
  ChallengeSummary,
  ChallengeStreak,
  ChallengeType,
  ChallengeFrequency,
  ChallengeStatus,
  CreateChallengeData,
  UpdateChallengeData,
  CreateChallengeGoalData,
  CreateChallengeProgressData
} from '../domain/models';
import { WellnessChallengeRepository } from '../domain/WellnessChallengeRepository';

/**
 * Service for managing wellness challenges
 * Orchestrates operations between UI and repositories
 */
export class WellnessChallengeService {
  constructor(private repository: WellnessChallengeRepository) {}
  
  // Challenge retrieval methods
  async getChallengeById(id: number): Promise<WellnessChallengeWithDetails> {
    return this.repository.getChallengeById(id);
  }
  
  async getChallengesForUser(userId: number): Promise<WellnessChallenge[]> {
    return this.repository.getChallengesForUser(userId);
  }
  
  async getChallengesByStatus(userId: number, status: ChallengeStatus): Promise<WellnessChallenge[]> {
    return this.repository.getChallengesByStatus(userId, status);
  }
  
  async getChallengesByType(userId: number, type: ChallengeType): Promise<WellnessChallenge[]> {
    return this.repository.getChallengesByType(userId, type);
  }
  
  async getChallengesByFrequency(userId: number, frequency: ChallengeFrequency): Promise<WellnessChallenge[]> {
    return this.repository.getChallengesByFrequency(userId, frequency);
  }
  
  async getChallengesByDateRange(userId: number, startDate: string, endDate: string): Promise<WellnessChallenge[]> {
    return this.repository.getChallengesByDateRange(userId, startDate, endDate);
  }
  
  // Challenge management methods
  async createChallenge(data: CreateChallengeData): Promise<WellnessChallenge> {
    // Any pre-processing or validation could happen here
    return this.repository.createChallenge(data);
  }
  
  async updateChallenge(id: number, data: UpdateChallengeData): Promise<WellnessChallenge> {
    return this.repository.updateChallenge(id, data);
  }
  
  async deleteChallenge(id: number): Promise<boolean> {
    return this.repository.deleteChallenge(id);
  }
  
  async updateChallengeStatus(id: number, status: ChallengeStatus): Promise<WellnessChallenge> {
    return this.repository.updateChallengeStatus(id, status);
  }
  
  async markChallengeComplete(id: number): Promise<WellnessChallenge> {
    return this.repository.updateChallengeStatus(id, ChallengeStatus.COMPLETED);
  }
  
  async abandonChallenge(id: number): Promise<WellnessChallenge> {
    return this.repository.updateChallengeStatus(id, ChallengeStatus.ABANDONED);
  }
  
  // Goals related methods
  async createChallengeGoal(data: CreateChallengeGoalData): Promise<ChallengeGoal> {
    return this.repository.createChallengeGoal(data);
  }
  
  async getGoalsForChallenge(challengeId: number): Promise<ChallengeGoal[]> {
    return this.repository.getGoalsForChallenge(challengeId);
  }
  
  // Progress related methods
  async recordChallengeProgress(data: CreateChallengeProgressData): Promise<ChallengeProgress> {
    return this.repository.recordChallengeProgress(data);
  }
  
  async getProgressForChallenge(challengeId: number): Promise<ChallengeProgress[]> {
    return this.repository.getProgressForChallenge(challengeId);
  }
  
  async getProgressForDate(userId: number, date: string): Promise<ChallengeProgress[]> {
    return this.repository.getProgressForDate(userId, date);
  }
  
  /**
   * Calculate current progress percentage for a challenge
   */
  async getProgressPercentage(challengeId: number): Promise<number> {
    try {
      // Get challenge details and progress
      const challenge = await this.getChallengeById(challengeId);
      const progress = await this.getProgressForChallenge(challengeId);
      
      // Calculate total progress value
      const totalProgress = progress.reduce((sum, entry) => sum + entry.value, 0);
      
      // Calculate percentage based on challenge target
      const percentage = (totalProgress / challenge.targetValue) * 100;
      
      // Cap at 100%
      return Math.min(percentage, 100);
    } catch (error) {
      console.error("Error calculating progress percentage:", error);
      return 0;
    }
  }
  
  // Analytics related methods
  async getChallengeSummary(userId: number): Promise<ChallengeSummary> {
    return this.repository.getChallengeSummary(userId);
  }
  
  async getChallengeStreak(challengeId: number): Promise<ChallengeStreak> {
    return this.repository.getChallengeStreak(challengeId);
  }
}