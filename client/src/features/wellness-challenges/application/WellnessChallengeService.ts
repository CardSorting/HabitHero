/**
 * Service for coordinating wellness challenge operations
 * This layer follows Clean Architecture principles and implements application logic 
 * that operates on the domain models via the repositories
 */
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
 * Service that coordinates operations between the UI and repositories
 * Implements application logic and orchestrates domain operations
 */
export class WellnessChallengeService {
  /**
   * Initialize with the repository dependency
   */
  constructor(private repository: WellnessChallengeRepository) {}
  
  /**
   * Get all challenges in the system
   */
  async getAllChallenges(): Promise<WellnessChallenge[]> {
    return this.repository.getAllChallenges();
  }
  
  /**
   * Get challenges for a specific user
   */
  async getChallengesForUser(userId: number): Promise<WellnessChallenge[]> {
    return this.repository.getChallengesByUser(userId);
  }
  
  /**
   * Get challenges by status
   */
  async getChallengesByStatus(status: ChallengeStatus): Promise<WellnessChallenge[]> {
    return this.repository.getChallengesByStatus(status);
  }
  
  /**
   * Get challenges by type
   */
  async getChallengesByType(type: ChallengeType): Promise<WellnessChallenge[]> {
    return this.repository.getChallengesByType(type);
  }
  
  /**
   * Get active challenges for a user
   */
  async getActiveChallengesForUser(userId: number): Promise<WellnessChallenge[]> {
    return this.repository.getActiveChallengesForUser(userId);
  }
  
  /**
   * Get detailed challenge by ID
   */
  async getChallengeById(id: number): Promise<WellnessChallengeWithDetails> {
    return this.repository.getChallengeById(id);
  }
  
  /**
   * Get challenge summary statistics
   */
  async getChallengeSummary(userId: number): Promise<ChallengeSummary> {
    return this.repository.getChallengeSummary(userId);
  }
  
  /**
   * Get streak information for a challenge
   */
  async getChallengeStreak(challengeId: number): Promise<ChallengeStreak> {
    return this.repository.getChallengeStreak(challengeId);
  }
  
  /**
   * Create a new challenge
   */
  async createChallenge(data: CreateChallengeData): Promise<WellnessChallenge> {
    // Any additional business logic before creating
    return this.repository.createChallenge(data);
  }
  
  /**
   * Update an existing challenge
   */
  async updateChallenge(id: number, data: UpdateChallengeData): Promise<WellnessChallenge> {
    // Any additional business logic before updating
    return this.repository.updateChallenge(id, data);
  }
  
  /**
   * Delete a challenge
   */
  async deleteChallenge(id: number): Promise<boolean> {
    return this.repository.deleteChallenge(id);
  }
  
  /**
   * Update challenge status
   */
  async updateChallengeStatus(id: number, status: ChallengeStatus): Promise<WellnessChallenge> {
    return this.repository.updateChallengeStatus(id, status);
  }
  
  /**
   * Get goals for a challenge
   */
  async getChallengeGoals(challengeId: number): Promise<ChallengeGoal[]> {
    return this.repository.getChallengeGoals(challengeId);
  }
  
  /**
   * Create a goal for a challenge
   */
  async createChallengeGoal(data: CreateChallengeGoalData): Promise<ChallengeGoal> {
    return this.repository.createChallengeGoal(data);
  }
  
  /**
   * Get all progress entries for a challenge
   */
  async getChallengeProgress(challengeId: number): Promise<ChallengeProgress[]> {
    return this.repository.getChallengeProgress(challengeId);
  }
  
  /**
   * Record progress for a challenge
   */
  async recordChallengeProgress(data: CreateChallengeProgressData): Promise<ChallengeProgress> {
    // Any additional validation or business logic
    return this.repository.recordChallengeProgress(data);
  }
  
  /**
   * Get progress for a specific date
   */
  async getChallengeProgressForDate(challengeId: number, date: string): Promise<ChallengeProgress[]> {
    return this.repository.getChallengeProgressForDate(challengeId, date);
  }
}