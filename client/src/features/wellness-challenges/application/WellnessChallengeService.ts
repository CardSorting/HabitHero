/**
 * Wellness Challenge Service
 * Main application service that implements use cases and coordinates between command and query handlers
 */

import { 
  ChallengeFrequency, 
  ChallengeStatus, 
  ChallengeType,
  ChallengeGoal,
  ChallengeProgress,
  ChallengeSummary,
  ChallengeStreak,
  DateString,
  Emotion,
  EmotionCategory,
  UserEmotion,
  WellnessChallenge,
  WellnessChallengeWithDetails,
} from '../domain/models';

import { WellnessChallengeCommandHandlers } from './commandHandlers';
import { WellnessChallengeQueryHandlers } from './queryHandlers';
import { ProgressCalculationService, ChallengeStatusService } from '../domain/services';

import {
  CreateChallengeCommand,
  UpdateChallengeCommand,
  DeleteChallengeCommand,
  UpdateChallengeStatusCommand,
  CreateChallengeGoalCommand,
  UpdateChallengeGoalCommand,
  DeleteChallengeGoalCommand,
  RecordChallengeProgressCommand,
  DeleteChallengeProgressCommand,
  CreateUserEmotionCommand,
  UpdateUserEmotionCommand,
  DeleteUserEmotionCommand
} from './commands';

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

/**
 * Main service class for Wellness Challenge system
 * Follows the Facade pattern to provide a simplified interface to the complex subsystem
 */
export class WellnessChallengeService {
  private readonly progressCalculationService: ProgressCalculationService;
  private readonly challengeStatusService: ChallengeStatusService;
  
  constructor(
    private readonly commandHandlers: WellnessChallengeCommandHandlers,
    private readonly queryHandlers: WellnessChallengeQueryHandlers,
    private readonly userId: number
  ) {
    this.progressCalculationService = new ProgressCalculationService();
    this.challengeStatusService = new ChallengeStatusService();
  }
  
  // Use case methods - challenges
  
  async createChallenge(
    title: string,
    type: ChallengeType,
    frequency: ChallengeFrequency,
    startDate: DateString,
    endDate: DateString,
    targetValue: number,
    description?: string
  ): Promise<WellnessChallenge> {
    const command = new CreateChallengeCommand(
      this.userId,
      title,
      description || '',
      type,
      frequency,
      startDate,
      endDate,
      targetValue
    );
    
    return await this.commandHandlers.handleCreateChallenge(command);
  }
  
  async updateChallenge(
    id: number,
    updates: Partial<{
      title: string;
      description: string;
      type: ChallengeType;
      frequency: ChallengeFrequency;
      startDate: DateString;
      endDate: DateString;
      targetValue: number;
    }>
  ): Promise<WellnessChallenge> {
    const command = new UpdateChallengeCommand(
      id,
      updates.title,
      updates.description,
      updates.type,
      updates.frequency,
      updates.startDate,
      updates.endDate,
      updates.targetValue
    );
    
    return await this.commandHandlers.handleUpdateChallenge(command);
  }
  
  async deleteChallenge(id: number): Promise<boolean> {
    const command = new DeleteChallengeCommand(id);
    return await this.commandHandlers.handleDeleteChallenge(command);
  }
  
  async updateChallengeStatus(id: number, status: ChallengeStatus): Promise<WellnessChallenge> {
    // First, validate if the status transition is allowed
    const challenge = await this.getChallengeById(id);
    if (!challenge) {
      throw new Error(`Challenge with ID ${id} not found`);
    }
    
    if (!this.challengeStatusService.canTransitionTo(challenge.status, status)) {
      throw new Error(`Cannot transition from ${challenge.status} to ${status}`);
    }
    
    const command = new UpdateChallengeStatusCommand(id, status);
    return await this.commandHandlers.handleUpdateChallengeStatus(command);
  }
  
  async getChallengeById(id: number): Promise<WellnessChallenge | null> {
    const query = new GetChallengeByIdQuery(id);
    return await this.queryHandlers.handleGetChallengeById(query);
  }
  
  async getMyChallenges(): Promise<WellnessChallenge[]> {
    const query = new GetChallengesForUserQuery(this.userId);
    const challenges = await this.queryHandlers.handleGetChallengesForUser(query);
    
    // Enrich challenges with derived properties
    return await this.enrichChallenges(challenges);
  }
  
  async getChallengesByStatus(status: ChallengeStatus): Promise<WellnessChallenge[]> {
    const query = new GetChallengesByStatusQuery(this.userId, status);
    const challenges = await this.queryHandlers.handleGetChallengesByStatus(query);
    return await this.enrichChallenges(challenges);
  }
  
  async getChallengesByType(type: ChallengeType): Promise<WellnessChallenge[]> {
    const query = new GetChallengesByTypeQuery(this.userId, type);
    const challenges = await this.queryHandlers.handleGetChallengesByType(query);
    return await this.enrichChallenges(challenges);
  }
  
  async getChallengesByFrequency(frequency: ChallengeFrequency): Promise<WellnessChallenge[]> {
    const query = new GetChallengesByFrequencyQuery(this.userId, frequency);
    const challenges = await this.queryHandlers.handleGetChallengesByFrequency(query);
    return await this.enrichChallenges(challenges);
  }
  
  async getChallengesByDateRange(startDate: DateString, endDate: DateString): Promise<WellnessChallenge[]> {
    const query = new GetChallengesByDateRangeQuery(this.userId, startDate, endDate);
    const challenges = await this.queryHandlers.handleGetChallengesByDateRange(query);
    return await this.enrichChallenges(challenges);
  }
  
  async getChallengeWithDetails(id: number): Promise<WellnessChallengeWithDetails | null> {
    const query = new GetChallengeWithDetailsQuery(id);
    const challenge = await this.queryHandlers.handleGetChallengeWithDetails(query);
    
    if (!challenge) return null;
    
    // Enrich with derived properties
    challenge.daysRemaining = this.progressCalculationService.calculateDaysRemaining(challenge);
    challenge.completionPercentage = this.progressCalculationService.calculateCompletionPercentage(
      challenge, 
      challenge.progressEntries
    );
    
    // Check if status transitions should happen automatically
    if (this.challengeStatusService.shouldAutoComplete(challenge, challenge.completionPercentage)) {
      await this.updateChallengeStatus(challenge.id, ChallengeStatus.COMPLETED);
    }
    
    return challenge;
  }
  
  async getChallengeSummary(): Promise<ChallengeSummary> {
    const query = new GetChallengeSummaryQuery(this.userId);
    return await this.queryHandlers.handleGetChallengeSummary(query);
  }
  
  async getChallengeStreak(challengeId: number): Promise<ChallengeStreak> {
    const query = new GetChallengeStreakQuery(challengeId);
    return await this.queryHandlers.handleGetChallengeStreak(query);
  }
  
  // Challenge goals
  
  async createChallengeGoal(
    challengeId: number,
    title: string,
    targetValue: number,
    description?: string
  ): Promise<ChallengeGoal> {
    const command = new CreateChallengeGoalCommand(
      challengeId,
      title,
      description,
      targetValue
    );
    
    return await this.commandHandlers.handleCreateChallengeGoal(command);
  }
  
  async updateChallengeGoal(
    id: number,
    updates: Partial<{
      title: string;
      description: string;
      targetValue: number;
    }>
  ): Promise<ChallengeGoal> {
    const command = new UpdateChallengeGoalCommand(
      id,
      updates.title,
      updates.description,
      updates.targetValue
    );
    
    return await this.commandHandlers.handleUpdateChallengeGoal(command);
  }
  
  async deleteChallengeGoal(id: number): Promise<boolean> {
    const command = new DeleteChallengeGoalCommand(id);
    return await this.commandHandlers.handleDeleteChallengeGoal(command);
  }
  
  async getChallengeGoalById(id: number): Promise<ChallengeGoal | null> {
    const query = new GetChallengeGoalByIdQuery(id);
    return await this.queryHandlers.handleGetChallengeGoalById(query);
  }
  
  async getGoalsForChallenge(challengeId: number): Promise<ChallengeGoal[]> {
    const query = new GetGoalsForChallengeQuery(challengeId);
    return await this.queryHandlers.handleGetGoalsForChallenge(query);
  }
  
  // Challenge progress
  
  async recordProgress(
    challengeId: number,
    date: DateString,
    value: number,
    notes?: string
  ): Promise<ChallengeProgress> {
    const command = new RecordChallengeProgressCommand(
      challengeId,
      date,
      value,
      notes
    );
    
    return await this.commandHandlers.handleRecordChallengeProgress(command);
  }
  
  async deleteProgress(id: number): Promise<boolean> {
    const command = new DeleteChallengeProgressCommand(id);
    return await this.commandHandlers.handleDeleteChallengeProgress(command);
  }
  
  async getProgressById(id: number): Promise<ChallengeProgress | null> {
    const query = new GetChallengeProgressByIdQuery(id);
    return await this.queryHandlers.handleGetChallengeProgressById(query);
  }
  
  async getProgressForChallenge(challengeId: number): Promise<ChallengeProgress[]> {
    const query = new GetProgressForChallengeQuery(challengeId);
    return await this.queryHandlers.handleGetProgressForChallenge(query);
  }
  
  async getProgressForDate(challengeId: number, date: DateString): Promise<ChallengeProgress | null> {
    const query = new GetProgressForDateQuery(challengeId, date);
    return await this.queryHandlers.handleGetProgressForDate(query);
  }
  
  async getProgressForDateRange(
    challengeId: number,
    startDate: DateString,
    endDate: DateString
  ): Promise<ChallengeProgress[]> {
    const query = new GetProgressForDateRangeQuery(challengeId, startDate, endDate);
    return await this.queryHandlers.handleGetProgressForDateRange(query);
  }
  
  // Emotion categories
  
  async getAllEmotionCategories(): Promise<EmotionCategory[]> {
    const query = new GetAllEmotionCategoriesQuery();
    return await this.queryHandlers.handleGetAllEmotionCategories(query);
  }
  
  async getEmotionCategoryById(id: number): Promise<EmotionCategory | null> {
    const query = new GetEmotionCategoryByIdQuery(id);
    return await this.queryHandlers.handleGetEmotionCategoryById(query);
  }
  
  // Emotions
  
  async getAllEmotions(): Promise<Emotion[]> {
    const query = new GetAllEmotionsQuery();
    return await this.queryHandlers.handleGetAllEmotions(query);
  }
  
  async getEmotionById(id: number): Promise<Emotion | null> {
    const query = new GetEmotionByIdQuery(id);
    return await this.queryHandlers.handleGetEmotionById(query);
  }
  
  async getEmotionsByCategory(categoryId: number): Promise<Emotion[]> {
    const query = new GetEmotionsByCategoryQuery(categoryId);
    return await this.queryHandlers.handleGetEmotionsByCategory(query);
  }
  
  async getEmotionsWithCategories(): Promise<Emotion[]> {
    const query = new GetEmotionsWithCategoriesQuery();
    return await this.queryHandlers.handleGetEmotionsWithCategories(query);
  }
  
  // User emotions
  
  async createUserEmotion(
    categoryId: number,
    name: string,
    description?: string
  ): Promise<UserEmotion> {
    const command = new CreateUserEmotionCommand(
      this.userId,
      categoryId,
      name,
      description
    );
    
    return await this.commandHandlers.handleCreateUserEmotion(command);
  }
  
  async updateUserEmotion(
    id: number,
    updates: Partial<{
      name: string;
      categoryId: number;
      description: string;
    }>
  ): Promise<UserEmotion> {
    const command = new UpdateUserEmotionCommand(
      id,
      updates.name,
      updates.categoryId,
      updates.description
    );
    
    return await this.commandHandlers.handleUpdateUserEmotion(command);
  }
  
  async deleteUserEmotion(id: number): Promise<boolean> {
    const command = new DeleteUserEmotionCommand(id);
    return await this.commandHandlers.handleDeleteUserEmotion(command);
  }
  
  async getUserEmotions(): Promise<UserEmotion[]> {
    const query = new GetUserEmotionsQuery(this.userId);
    return await this.queryHandlers.handleGetUserEmotions(query);
  }
  
  async getUserEmotionById(id: number): Promise<UserEmotion | null> {
    const query = new GetUserEmotionByIdQuery(id);
    return await this.queryHandlers.handleGetUserEmotionById(query);
  }
  
  async getUserEmotionsByCategory(categoryId: number): Promise<UserEmotion[]> {
    const query = new GetUserEmotionsByCategoryQuery(this.userId, categoryId);
    return await this.queryHandlers.handleGetUserEmotionsByCategory(query);
  }
  
  async getUserEmotionsWithCategories(): Promise<UserEmotion[]> {
    const query = new GetUserEmotionsWithCategoriesQuery(this.userId);
    return await this.queryHandlers.handleGetUserEmotionsWithCategories(query);
  }
  
  // Helper methods
  
  private async enrichChallenges(challenges: WellnessChallenge[]): Promise<WellnessChallenge[]> {
    const enrichedChallenges: WellnessChallenge[] = [];
    
    for (const challenge of challenges) {
      // Get progress entries for the challenge
      const progressQuery = new GetProgressForChallengeQuery(challenge.id);
      const progressEntries = await this.queryHandlers.handleGetProgressForChallenge(progressQuery);
      
      // Calculate derived properties
      challenge.daysRemaining = this.progressCalculationService.calculateDaysRemaining(challenge);
      challenge.completionPercentage = this.progressCalculationService.calculateCompletionPercentage(
        challenge, 
        progressEntries
      );
      
      // Check if status transitions should happen automatically
      if (challenge.status === ChallengeStatus.ACTIVE) {
        if (this.challengeStatusService.shouldAutoComplete(challenge, challenge.completionPercentage)) {
          await this.updateChallengeStatus(challenge.id, ChallengeStatus.COMPLETED);
          challenge.status = ChallengeStatus.COMPLETED;
        } else if (progressEntries.length > 0) {
          const lastProgressDate = progressEntries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date;
            
          if (this.challengeStatusService.shouldMarkAbandoned(challenge, lastProgressDate)) {
            await this.updateChallengeStatus(challenge.id, ChallengeStatus.ABANDONED);
            challenge.status = ChallengeStatus.ABANDONED;
          }
        }
      }
      
      enrichedChallenges.push(challenge);
    }
    
    return enrichedChallenges;
  }
}