/**
 * Query Handlers for the Wellness Challenge system
 * Each handler retrieves data based on a specific query without modifying state
 */

import { 
  IEmotionCategoryRepository,
  IEmotionRepository,
  IChallengeGoalRepository, 
  IChallengeProgressRepository, 
  IUserEmotionRepository, 
  IWellnessChallengeRepository
} from '../domain/repositories';

import {
  GetChallengeByIdQuery,
  GetChallengesForUserQuery,
  GetChallengesByStatusQuery,
  GetChallengesByTypeQuery,
  GetChallengesByFrequencyQuery,
  GetChallengesByDateRangeQuery,
  GetChallengeWithDetailsQuery,
  GetChallengeSummaryQuery,
  GetChallengeStreakQuery,
  GetChallengeGoalByIdQuery,
  GetGoalsForChallengeQuery,
  GetChallengeProgressByIdQuery,
  GetProgressForChallengeQuery,
  GetProgressForDateQuery,
  GetProgressForDateRangeQuery,
  GetAllEmotionCategoriesQuery,
  GetEmotionCategoryByIdQuery,
  GetAllEmotionsQuery,
  GetEmotionByIdQuery,
  GetEmotionsByCategoryQuery,
  GetEmotionsWithCategoriesQuery,
  GetUserEmotionsQuery,
  GetUserEmotionByIdQuery,
  GetUserEmotionsByCategoryQuery,
  GetUserEmotionsWithCategoriesQuery
} from './queries';

import {
  ChallengeGoal,
  ChallengeProgress,
  ChallengeSummary,
  ChallengeStreak,
  Emotion,
  EmotionCategory,
  UserEmotion,
  WellnessChallenge,
  WellnessChallengeWithDetails
} from '../domain/models';

/**
 * Query Handler class following the CQRS pattern
 * Implements a clean separation of concerns by handling only queries
 */
export class WellnessChallengeQueryHandlers {
  constructor(
    private challengeRepository: IWellnessChallengeRepository,
    private goalRepository: IChallengeGoalRepository,
    private progressRepository: IChallengeProgressRepository,
    private emotionCategoryRepository: IEmotionCategoryRepository,
    private emotionRepository: IEmotionRepository,
    private userEmotionRepository: IUserEmotionRepository,
  ) {}
  
  // Challenge Query Handlers
  async handleGetChallengeById(query: GetChallengeByIdQuery): Promise<WellnessChallenge | null> {
    return await this.challengeRepository.findById(query.id);
  }
  
  async handleGetChallengesForUser(query: GetChallengesForUserQuery): Promise<WellnessChallenge[]> {
    return await this.challengeRepository.findByUserId(query.userId);
  }
  
  async handleGetChallengesByStatus(query: GetChallengesByStatusQuery): Promise<WellnessChallenge[]> {
    return await this.challengeRepository.findByStatus(query.status, query.userId);
  }
  
  async handleGetChallengesByType(query: GetChallengesByTypeQuery): Promise<WellnessChallenge[]> {
    return await this.challengeRepository.findByType(query.type, query.userId);
  }
  
  async handleGetChallengesByFrequency(query: GetChallengesByFrequencyQuery): Promise<WellnessChallenge[]> {
    return await this.challengeRepository.findByFrequency(query.frequency, query.userId);
  }
  
  async handleGetChallengesByDateRange(query: GetChallengesByDateRangeQuery): Promise<WellnessChallenge[]> {
    return await this.challengeRepository.findByDateRange(query.startDate, query.endDate, query.userId);
  }
  
  async handleGetChallengeWithDetails(query: GetChallengeWithDetailsQuery): Promise<WellnessChallengeWithDetails | null> {
    return await this.challengeRepository.getChallengeWithDetails(query.id);
  }
  
  async handleGetChallengeSummary(query: GetChallengeSummaryQuery): Promise<ChallengeSummary> {
    return await this.challengeRepository.getChallengeSummary(query.userId);
  }
  
  async handleGetChallengeStreak(query: GetChallengeStreakQuery): Promise<ChallengeStreak> {
    return await this.challengeRepository.getChallengeStreak(query.challengeId);
  }
  
  // Challenge Goal Query Handlers
  async handleGetChallengeGoalById(query: GetChallengeGoalByIdQuery): Promise<ChallengeGoal | null> {
    return await this.goalRepository.findById(query.id);
  }
  
  async handleGetGoalsForChallenge(query: GetGoalsForChallengeQuery): Promise<ChallengeGoal[]> {
    return await this.goalRepository.findByChallengeId(query.challengeId);
  }
  
  // Challenge Progress Query Handlers
  async handleGetChallengeProgressById(query: GetChallengeProgressByIdQuery): Promise<ChallengeProgress | null> {
    return await this.progressRepository.findById(query.id);
  }
  
  async handleGetProgressForChallenge(query: GetProgressForChallengeQuery): Promise<ChallengeProgress[]> {
    return await this.progressRepository.findByChallengeId(query.challengeId);
  }
  
  async handleGetProgressForDate(query: GetProgressForDateQuery): Promise<ChallengeProgress | null> {
    return await this.progressRepository.findByDate(query.date, query.challengeId);
  }
  
  async handleGetProgressForDateRange(query: GetProgressForDateRangeQuery): Promise<ChallengeProgress[]> {
    return await this.progressRepository.findByDateRange(query.startDate, query.endDate, query.challengeId);
  }
  
  // Emotion Category Query Handlers
  async handleGetAllEmotionCategories(query: GetAllEmotionCategoriesQuery): Promise<EmotionCategory[]> {
    return await this.emotionCategoryRepository.findAll();
  }
  
  async handleGetEmotionCategoryById(query: GetEmotionCategoryByIdQuery): Promise<EmotionCategory | null> {
    return await this.emotionCategoryRepository.findById(query.id);
  }
  
  // Emotion Query Handlers
  async handleGetAllEmotions(query: GetAllEmotionsQuery): Promise<Emotion[]> {
    return await this.emotionRepository.findAll();
  }
  
  async handleGetEmotionById(query: GetEmotionByIdQuery): Promise<Emotion | null> {
    return await this.emotionRepository.findById(query.id);
  }
  
  async handleGetEmotionsByCategory(query: GetEmotionsByCategoryQuery): Promise<Emotion[]> {
    return await this.emotionRepository.findByCategoryId(query.categoryId);
  }
  
  async handleGetEmotionsWithCategories(query: GetEmotionsWithCategoriesQuery): Promise<Emotion[]> {
    return await this.emotionRepository.getEmotionsWithCategories();
  }
  
  // User Emotion Query Handlers
  async handleGetUserEmotions(query: GetUserEmotionsQuery): Promise<UserEmotion[]> {
    return await this.userEmotionRepository.findByUserId(query.userId);
  }
  
  async handleGetUserEmotionById(query: GetUserEmotionByIdQuery): Promise<UserEmotion | null> {
    return await this.userEmotionRepository.findById(query.id);
  }
  
  async handleGetUserEmotionsByCategory(query: GetUserEmotionsByCategoryQuery): Promise<UserEmotion[]> {
    return await this.userEmotionRepository.findByUserIdAndCategoryId(query.userId, query.categoryId);
  }
  
  async handleGetUserEmotionsWithCategories(query: GetUserEmotionsWithCategoriesQuery): Promise<UserEmotion[]> {
    return await this.userEmotionRepository.getUserEmotionsWithCategories(query.userId);
  }
}