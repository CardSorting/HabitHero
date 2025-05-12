/**
 * Repository interface for wellness challenges following Clean Architecture principles
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
} from './models';

/**
 * Repository interface providing data access capabilities for wellness challenge domain
 * This enforces the dependency rule of Clean Architecture by having domain not depend on data layer
 */
export interface WellnessChallengeRepository {
  // Challenge retrieval methods
  getChallengeById(id: number): Promise<WellnessChallengeWithDetails>;
  getChallengesForUser(userId: number): Promise<WellnessChallenge[]>;
  getChallengesByStatus(userId: number, status: ChallengeStatus): Promise<WellnessChallenge[]>;
  getChallengesByType(userId: number, type: ChallengeType): Promise<WellnessChallenge[]>;
  getChallengesByFrequency(userId: number, frequency: ChallengeFrequency): Promise<WellnessChallenge[]>;
  getChallengesByDateRange(userId: number, startDate: string, endDate: string): Promise<WellnessChallenge[]>;
  
  // Challenge management methods
  createChallenge(data: CreateChallengeData): Promise<WellnessChallenge>;
  updateChallenge(id: number, data: UpdateChallengeData): Promise<WellnessChallenge>;
  deleteChallenge(id: number): Promise<boolean>;
  updateChallengeStatus(id: number, status: ChallengeStatus): Promise<WellnessChallenge>;
  
  // Goals related methods
  createChallengeGoal(data: CreateChallengeGoalData): Promise<ChallengeGoal>;
  getGoalsForChallenge(challengeId: number): Promise<ChallengeGoal[]>;
  
  // Progress related methods
  recordChallengeProgress(data: CreateChallengeProgressData): Promise<ChallengeProgress>;
  getProgressForChallenge(challengeId: number): Promise<ChallengeProgress[]>;
  getProgressForDate(userId: number, date: string): Promise<ChallengeProgress[]>;
  
  // Analytics related methods
  getChallengeSummary(userId: number): Promise<ChallengeSummary>;
  getChallengeStreak(challengeId: number): Promise<ChallengeStreak>;
}