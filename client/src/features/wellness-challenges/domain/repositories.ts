/**
 * Repository interfaces for the wellness challenges feature
 * Following the Clean Architecture pattern with repository interfaces in the domain layer
 */

import { 
  ChallengeCategory, 
  ChallengeId, 
  ChallengeStatus, 
  ChallengeSummary, 
  ChallengeStreak, 
  UserId, 
  UserChallengeProgress, 
  WellnessChallenge 
} from './models';

/**
 * Repository interface for wellness challenges
 */
export interface WellnessChallengeRepository {
  // Queries
  getById(id: ChallengeId): Promise<WellnessChallenge | null>;
  getAllByCategory(category: ChallengeCategory): Promise<WellnessChallenge[]>;
  getAllByStatus(status: ChallengeStatus): Promise<WellnessChallenge[]>;
  getActiveChallenges(userId: UserId): Promise<WellnessChallenge[]>;
  searchChallenges(query: string): Promise<WellnessChallenge[]>;
  
  // Commands
  save(challenge: WellnessChallenge): Promise<WellnessChallenge>;
  activateChallenge(id: ChallengeId, userId: UserId): Promise<WellnessChallenge>;
  abandonChallenge(id: ChallengeId, userId: UserId): Promise<WellnessChallenge>;
  delete(id: ChallengeId): Promise<boolean>;
}

/**
 * Repository interface for user challenge progress
 */
export interface UserChallengeProgressRepository {
  // Queries
  getProgressForChallenge(challengeId: ChallengeId, userId: UserId): Promise<UserChallengeProgress[]>;
  getProgressForDate(date: Date, userId: UserId): Promise<UserChallengeProgress[]>;
  
  // Commands
  saveProgress(progress: UserChallengeProgress): Promise<UserChallengeProgress>;
  deleteProgress(challengeId: ChallengeId, userId: UserId, date: Date): Promise<boolean>;
}

/**
 * Repository interface for challenge analytics
 */
export interface ChallengeAnalyticsRepository {
  // Queries
  getChallengeStreak(challengeId: ChallengeId, userId: UserId): Promise<ChallengeStreak>;
  getChallengeSummary(userId: UserId): Promise<ChallengeSummary>;
  getCompletionRateByCategory(category: ChallengeCategory, userId: UserId): Promise<number>;
}

/**
 * Data Source interface for pre-defined wellness challenges
 * This makes adding challenges maintainable by providing a clear interface
 */
export interface WellnessChallengeDataSource {
  getChallengesByCategory(category: ChallengeCategory): Promise<WellnessChallenge[]>;
  getAllChallenges(): Promise<WellnessChallenge[]>;
}