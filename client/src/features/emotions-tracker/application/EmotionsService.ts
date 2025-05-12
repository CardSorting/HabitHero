// EmotionsService - Application Service
// Acts as a facade over commands and queries for the UI layer

import { 
  DateString, 
  EmotionDTO, 
  EmotionTrackingEntry,
  EmotionSummaryDTO,
  EmotionTrendDTO
} from '../domain/models';
import { IEmotionsRepository } from '../domain/repositories';
import { 
  EmotionCommandHandlers, 
  TrackEmotionCommand, 
  UpdateEmotionEntryCommand, 
  DeleteEmotionEntryCommand 
} from './commands';
import { 
  EmotionQueryHandlers, 
  GetAllEmotionsQuery,
  GetEmotionByIdQuery,
  GetEmotionEntriesQuery,
  GetEmotionEntryQuery,
  GetEmotionSummaryQuery,
  GetEmotionTrendsQuery,
  GetMostFrequentEmotionsQuery,
  GetHighestIntensityEmotionsQuery
} from './queries';

// Interface for emitting domain events
export interface EventEmitter {
  emit(eventName: string, payload: any): void;
}

// Main application service for emotions tracking
export class EmotionsService {
  private commandHandlers: EmotionCommandHandlers;
  private queryHandlers: EmotionQueryHandlers;
  private eventEmitter?: EventEmitter;
  private userId: number;
  
  constructor(repository: IEmotionsRepository, userId: number, eventEmitter?: EventEmitter) {
    this.commandHandlers = new EmotionCommandHandlers(repository);
    this.queryHandlers = new EmotionQueryHandlers(repository);
    this.eventEmitter = eventEmitter;
    this.userId = userId;
  }
  
  // Command methods
  
  // Track a new emotion
  async trackEmotion(
    date: DateString,
    emotionId: string,
    emotionName: string,
    categoryId: string,
    intensity: number,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[]
  ): Promise<EmotionTrackingEntry> {
    const command = new TrackEmotionCommand(
      this.userId,
      date,
      emotionId,
      emotionName,
      categoryId,
      intensity,
      notes,
      triggers,
      copingMechanisms
    );
    
    const { entry, events } = await this.commandHandlers.handleTrackEmotion(command);
    
    // Emit events if we have an event emitter
    if (this.eventEmitter) {
      events.forEach(event => {
        this.eventEmitter?.emit(event.eventName, event);
      });
    }
    
    return entry;
  }
  
  // Update an emotion entry
  async updateEmotionEntry(
    id: number,
    intensity?: number,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[]
  ): Promise<EmotionTrackingEntry> {
    const command = new UpdateEmotionEntryCommand(
      id,
      intensity,
      notes,
      triggers,
      copingMechanisms
    );
    
    const { entry, events } = await this.commandHandlers.handleUpdateEmotionEntry(command);
    
    // Emit events if we have an event emitter
    if (this.eventEmitter) {
      events.forEach(event => {
        this.eventEmitter?.emit(event.eventName, event);
      });
    }
    
    return entry;
  }
  
  // Delete an emotion entry
  async deleteEmotionEntry(id: number): Promise<boolean> {
    const command = new DeleteEmotionEntryCommand(id);
    return await this.commandHandlers.handleDeleteEmotionEntry(command);
  }
  
  // Query methods
  
  // Get all predefined emotions
  async getAllEmotions(): Promise<EmotionDTO[]> {
    const query = new GetAllEmotionsQuery();
    return await this.queryHandlers.handleGetAllEmotions(query);
  }
  
  // Get emotion by ID
  async getEmotionById(id: string): Promise<EmotionDTO | null> {
    const query = new GetEmotionByIdQuery(id);
    return await this.queryHandlers.handleGetEmotionById(query);
  }
  
  // Get emotion entries for a date range
  async getEmotionEntries(dateFrom: DateString, dateTo: DateString): Promise<EmotionTrackingEntry[]> {
    const query = new GetEmotionEntriesQuery(this.userId, dateFrom, dateTo);
    return await this.queryHandlers.handleGetEmotionEntries(query);
  }
  
  // Get a specific emotion entry
  async getEmotionEntry(id: number): Promise<EmotionTrackingEntry | null> {
    const query = new GetEmotionEntryQuery(id);
    return await this.queryHandlers.handleGetEmotionEntry(query);
  }
  
  // Get emotion summary for a specific date
  async getEmotionSummary(date: DateString): Promise<EmotionSummaryDTO> {
    const query = new GetEmotionSummaryQuery(this.userId, date);
    return await this.queryHandlers.handleGetEmotionSummary(query);
  }
  
  // Get emotion trends over a date range
  async getEmotionTrends(dateFrom: DateString, dateTo: DateString): Promise<EmotionTrendDTO[]> {
    const query = new GetEmotionTrendsQuery(this.userId, dateFrom, dateTo);
    return await this.queryHandlers.handleGetEmotionTrends(query);
  }
  
  // Get most frequently logged emotions
  async getMostFrequentEmotions(dateFrom: DateString, dateTo: DateString, limit: number = 5): Promise<{emotionId: string, count: number}[]> {
    const query = new GetMostFrequentEmotionsQuery(this.userId, dateFrom, dateTo, limit);
    return await this.queryHandlers.handleGetMostFrequentEmotions(query);
  }
  
  // Get emotions with highest intensity
  async getHighestIntensityEmotions(dateFrom: DateString, dateTo: DateString, limit: number = 5): Promise<{emotionId: string, maxIntensity: number}[]> {
    const query = new GetHighestIntensityEmotionsQuery(this.userId, dateFrom, dateTo, limit);
    return await this.queryHandlers.handleGetHighestIntensityEmotions(query);
  }
}