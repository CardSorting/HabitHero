/**
 * Repository interface for wellness challenges
 * Following the repository pattern from DDD, this defines the interface
 * for data access operations without committing to a specific implementation
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
} from './models';

/**
 * Repository interface for wellness challenges
 * Defines data access methods without implementation details
 */
export interface WellnessChallengeRepository {
  /**
   * Get all challenges
   */
  getAllChallenges(): Promise<WellnessChallenge[]>;
  
  /**
   * Get challenges for specific user
   */
  getChallengesByUser(userId: number): Promise<WellnessChallenge[]>;
  
  /**
   * Get challenges with specific status
   */
  getChallengesByStatus(status: ChallengeStatus): Promise<WellnessChallenge[]>;
  
  /**
   * Get challenges of specific type
   */
  getChallengesByType(type: ChallengeType): Promise<WellnessChallenge[]>;
  
  /**
   * Get active challenges for user
   */
  getActiveChallengesForUser(userId: number): Promise<WellnessChallenge[]>;
  
  /**
   * Get a challenge by ID with its goals and progress
   */
  getChallengeById(id: number): Promise<WellnessChallengeWithDetails>;
  
  /**
   * Get challenge summary statistics
   */
  getChallengeSummary(userId: number): Promise<ChallengeSummary>;
  
  /**
   * Get streak information for a challenge
   */
  getChallengeStreak(challengeId: number): Promise<ChallengeStreak>;
  
  /**
   * Create a new challenge
   */
  createChallenge(data: CreateChallengeData): Promise<WellnessChallenge>;
  
  /**
   * Update an existing challenge
   */
  updateChallenge(id: number, data: UpdateChallengeData): Promise<WellnessChallenge>;
  
  /**
   * Delete a challenge
   */
  deleteChallenge(id: number): Promise<boolean>;
  
  /**
   * Update challenge status
   */
  updateChallengeStatus(id: number, status: ChallengeStatus): Promise<WellnessChallenge>;
  
  /**
   * Get goals for a challenge
   */
  getChallengeGoals(challengeId: number): Promise<ChallengeGoal[]>;
  
  /**
   * Create a goal for a challenge
   */
  createChallengeGoal(data: CreateChallengeGoalData): Promise<ChallengeGoal>;
  
  /**
   * Get all progress entries for a challenge
   */
  getChallengeProgress(challengeId: number): Promise<ChallengeProgress[]>;
  
  /**
   * Record progress for a challenge
   */
  recordChallengeProgress(data: CreateChallengeProgressData): Promise<ChallengeProgress>;
  
  /**
   * Get progress for a specific date
   */
  getChallengeProgressForDate(challengeId: number, date: string): Promise<ChallengeProgress[]>;
}