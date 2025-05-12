import { format } from 'date-fns';
import { 
  IEmotionsRepository, 
  IEmotionEntriesRepository 
} from '../domain/repositories';
import { 
  Emotion, 
  EmotionCategory, 
  EmotionDate, 
  EmotionEntry, 
  EmotionSummary, 
  EmotionTrend 
} from '../domain/models';
import { 
  TrackEmotionCommand, 
  TrackEmotionCommandHandler,
  UpdateEmotionEntryCommand,
  UpdateEmotionEntryCommandHandler,
  DeleteEmotionEntryCommand,
  DeleteEmotionEntryCommandHandler
} from './commands';
import {
  GetAllEmotionsQuery,
  GetAllEmotionsQueryHandler,
  GetEmotionsByCategoryQuery,
  GetEmotionsByCategoryQueryHandler,
  GetEmotionEntriesByDateQuery,
  GetEmotionEntriesByDateQueryHandler,
  GetEmotionEntriesByDateRangeQuery,
  GetEmotionEntriesByDateRangeQueryHandler,
  GetEmotionSummaryQuery,
  GetEmotionSummaryQueryHandler,
  GetEmotionTrendsQuery,
  GetEmotionTrendsQueryHandler,
  GetMostFrequentEmotionsQuery,
  GetMostFrequentEmotionsQueryHandler,
  GetHighestIntensityEmotionsQuery,
  GetHighestIntensityEmotionsQueryHandler
} from './queries';

/**
 * EmotionsService
 * Service class that acts as a facade to the application layer
 * for the emotion tracking feature
 */
export class EmotionsService {
  private getAllEmotionsQueryHandler: GetAllEmotionsQueryHandler;
  private getEmotionsByCategoryQueryHandler: GetEmotionsByCategoryQueryHandler;
  private getEmotionEntriesByDateQueryHandler: GetEmotionEntriesByDateQueryHandler;
  private getEmotionEntriesByDateRangeQueryHandler: GetEmotionEntriesByDateRangeQueryHandler;
  private getEmotionSummaryQueryHandler: GetEmotionSummaryQueryHandler;
  private getEmotionTrendsQueryHandler: GetEmotionTrendsQueryHandler;
  private getMostFrequentEmotionsQueryHandler: GetMostFrequentEmotionsQueryHandler;
  private getHighestIntensityEmotionsQueryHandler: GetHighestIntensityEmotionsQueryHandler;
  
  private trackEmotionCommandHandler: TrackEmotionCommandHandler;
  private updateEmotionEntryCommandHandler: UpdateEmotionEntryCommandHandler;
  private deleteEmotionEntryCommandHandler: DeleteEmotionEntryCommandHandler;
  
  constructor(
    private emotionsRepository: IEmotionsRepository,
    private entriesRepository: IEmotionEntriesRepository
  ) {
    // Initialize query handlers
    this.getAllEmotionsQueryHandler = new GetAllEmotionsQueryHandler(emotionsRepository);
    this.getEmotionsByCategoryQueryHandler = new GetEmotionsByCategoryQueryHandler(emotionsRepository);
    this.getEmotionEntriesByDateQueryHandler = new GetEmotionEntriesByDateQueryHandler(entriesRepository);
    this.getEmotionEntriesByDateRangeQueryHandler = new GetEmotionEntriesByDateRangeQueryHandler(entriesRepository);
    this.getEmotionSummaryQueryHandler = new GetEmotionSummaryQueryHandler(entriesRepository);
    this.getEmotionTrendsQueryHandler = new GetEmotionTrendsQueryHandler(entriesRepository);
    this.getMostFrequentEmotionsQueryHandler = new GetMostFrequentEmotionsQueryHandler(entriesRepository);
    this.getHighestIntensityEmotionsQueryHandler = new GetHighestIntensityEmotionsQueryHandler(entriesRepository);
    
    // Initialize command handlers
    this.trackEmotionCommandHandler = new TrackEmotionCommandHandler(entriesRepository);
    this.updateEmotionEntryCommandHandler = new UpdateEmotionEntryCommandHandler(entriesRepository);
    this.deleteEmotionEntryCommandHandler = new DeleteEmotionEntryCommandHandler(entriesRepository);
  }
  
  /**
   * Get all predefined emotions
   */
  async getAllEmotions(): Promise<Emotion[]> {
    const query = new GetAllEmotionsQuery();
    return this.getAllEmotionsQueryHandler.execute(query);
  }
  
  /**
   * Get emotions by category
   * @param category Emotion category
   */
  async getEmotionsByCategory(category: EmotionCategory): Promise<Emotion[]> {
    const query = new GetEmotionsByCategoryQuery(category);
    return this.getEmotionsByCategoryQueryHandler.execute(query);
  }
  
  /**
   * Track a new emotion
   * @param userId User ID
   * @param emotionId Emotion ID
   * @param emotionName Emotion name
   * @param intensity Emotion intensity (1-10)
   * @param date Date when emotion was felt
   * @param notes Optional notes about the emotion
   * @param triggers Optional triggers for the emotion
   * @param copingMechanisms Optional coping mechanisms used
   * @param categoryId Optional category ID
   */
  async trackEmotion(
    userId: number,
    emotionId: string,
    emotionName: string,
    intensity: number,
    date: Date,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[],
    categoryId?: string
  ): Promise<EmotionEntry> {
    const command = new TrackEmotionCommand(
      userId, 
      emotionId, 
      emotionName, 
      intensity, 
      date, 
      notes, 
      triggers, 
      copingMechanisms, 
      categoryId
    );
    return this.trackEmotionCommandHandler.execute(command);
  }
  
  /**
   * Update an existing emotion entry
   * @param id Entry ID
   * @param userId User ID
   * @param updates Updates to apply
   */
  async updateEmotionEntry(
    id: string,
    userId: number,
    updates: {
      intensity?: number;
      notes?: string;
      triggers?: string[];
      copingMechanisms?: string[];
    }
  ): Promise<EmotionEntry> {
    const command = new UpdateEmotionEntryCommand(id, userId, updates);
    return this.updateEmotionEntryCommandHandler.execute(command);
  }
  
  /**
   * Delete an emotion entry
   * @param id Entry ID
   * @param userId User ID
   */
  async deleteEmotionEntry(id: string, userId: number): Promise<boolean> {
    const command = new DeleteEmotionEntryCommand(id, userId);
    return this.deleteEmotionEntryCommandHandler.execute(command);
  }
  
  /**
   * Get emotion entries for a specific date
   * @param userId User ID
   * @param date Date to get entries for
   */
  async getEntriesByDate(userId: number, date: EmotionDate): Promise<EmotionEntry[]> {
    const query = new GetEmotionEntriesByDateQuery(userId, date);
    return this.getEmotionEntriesByDateQueryHandler.execute(query);
  }
  
  /**
   * Get emotion entries for a date range
   * @param userId User ID
   * @param fromDate Start date
   * @param toDate End date
   */
  async getEntriesByDateRange(userId: number, fromDate: EmotionDate, toDate: EmotionDate): Promise<EmotionEntry[]> {
    const query = new GetEmotionEntriesByDateRangeQuery(userId, fromDate, toDate);
    return this.getEmotionEntriesByDateRangeQueryHandler.execute(query);
  }
  
  /**
   * Get summary of emotions for a specific date
   * @param userId User ID
   * @param date Date to get summary for
   */
  async getSummaryForDate(userId: number, date: EmotionDate): Promise<EmotionSummary> {
    const query = new GetEmotionSummaryQuery(userId, date);
    return this.getEmotionSummaryQueryHandler.execute(query);
  }
  
  /**
   * Get emotion trends over a date range
   * @param userId User ID
   * @param fromDate Start date
   * @param toDate End date
   */
  async getTrends(userId: number, fromDate: EmotionDate, toDate: EmotionDate): Promise<EmotionTrend[]> {
    const query = new GetEmotionTrendsQuery(userId, fromDate, toDate);
    return this.getEmotionTrendsQueryHandler.execute(query);
  }
  
  /**
   * Get most frequent emotions over a date range
   * @param userId User ID
   * @param fromDate Start date
   * @param toDate End date
   * @param limit Maximum number of emotions to return
   */
  async getMostFrequentEmotions(
    userId: number, 
    fromDate: EmotionDate, 
    toDate: EmotionDate, 
    limit?: number
  ): Promise<{emotion: string, count: number}[]> {
    const query = new GetMostFrequentEmotionsQuery(userId, fromDate, toDate, limit);
    return this.getMostFrequentEmotionsQueryHandler.execute(query);
  }
  
  /**
   * Get emotions with highest intensity over a date range
   * @param userId User ID
   * @param fromDate Start date
   * @param toDate End date
   * @param limit Maximum number of emotions to return
   */
  async getHighestIntensityEmotions(
    userId: number, 
    fromDate: EmotionDate, 
    toDate: EmotionDate, 
    limit?: number
  ): Promise<{emotion: string, intensity: number}[]> {
    const query = new GetHighestIntensityEmotionsQuery(userId, fromDate, toDate, limit);
    return this.getHighestIntensityEmotionsQueryHandler.execute(query);
  }
}