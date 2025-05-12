// Query handlers for the emotions tracker (read operations)
// Following CQRS pattern, queries handle data retrieval

import { 
  DateString, 
  EmotionDTO, 
  EmotionTrackingEntry,
  EmotionSummaryDTO,
  EmotionTrendDTO
} from '../domain/models';
import { IEmotionsRepository } from '../domain/repositories';

// Query classes
export class GetAllEmotionsQuery {
  constructor() {}
}

export class GetEmotionByIdQuery {
  constructor(public readonly id: string) {}
}

export class GetEmotionEntriesQuery {
  constructor(
    public readonly userId: number,
    public readonly dateFrom: DateString,
    public readonly dateTo: DateString
  ) {}
}

export class GetEmotionEntryQuery {
  constructor(public readonly id: number) {}
}

export class GetEmotionSummaryQuery {
  constructor(
    public readonly userId: number,
    public readonly date: DateString
  ) {}
}

export class GetEmotionTrendsQuery {
  constructor(
    public readonly userId: number,
    public readonly dateFrom: DateString,
    public readonly dateTo: DateString
  ) {}
}

export class GetMostFrequentEmotionsQuery {
  constructor(
    public readonly userId: number,
    public readonly dateFrom: DateString,
    public readonly dateTo: DateString,
    public readonly limit: number = 5
  ) {}
}

export class GetHighestIntensityEmotionsQuery {
  constructor(
    public readonly userId: number,
    public readonly dateFrom: DateString,
    public readonly dateTo: DateString,
    public readonly limit: number = 5
  ) {}
}

// Query handlers
export class EmotionQueryHandlers {
  private repository: IEmotionsRepository;
  
  constructor(repository: IEmotionsRepository) {
    this.repository = repository;
  }
  
  // Get all predefined emotions
  async handleGetAllEmotions(query: GetAllEmotionsQuery): Promise<EmotionDTO[]> {
    return await this.repository.getEmotions();
  }
  
  // Get a specific emotion by ID
  async handleGetEmotionById(query: GetEmotionByIdQuery): Promise<EmotionDTO | null> {
    return await this.repository.getEmotionById(query.id);
  }
  
  // Get emotion tracking entries for a user in a date range
  async handleGetEmotionEntries(query: GetEmotionEntriesQuery): Promise<EmotionTrackingEntry[]> {
    return await this.repository.getEmotionEntries(
      query.userId,
      query.dateFrom,
      query.dateTo
    );
  }
  
  // Get a specific emotion tracking entry by ID
  async handleGetEmotionEntry(query: GetEmotionEntryQuery): Promise<EmotionTrackingEntry | null> {
    return await this.repository.getEmotionEntry(query.id);
  }
  
  // Get emotion summary for a specific date
  async handleGetEmotionSummary(query: GetEmotionSummaryQuery): Promise<EmotionSummaryDTO> {
    return await this.repository.getEmotionSummary(query.userId, query.date);
  }
  
  // Get emotion trends over a date range
  async handleGetEmotionTrends(query: GetEmotionTrendsQuery): Promise<EmotionTrendDTO[]> {
    return await this.repository.getEmotionTrends(
      query.userId,
      query.dateFrom,
      query.dateTo
    );
  }
  
  // Get most frequently logged emotions
  async handleGetMostFrequentEmotions(query: GetMostFrequentEmotionsQuery): Promise<{emotionId: string, count: number}[]> {
    return await this.repository.getMostFrequentEmotions(
      query.userId,
      query.dateFrom,
      query.dateTo,
      query.limit
    );
  }
  
  // Get emotions with highest intensity
  async handleGetHighestIntensityEmotions(query: GetHighestIntensityEmotionsQuery): Promise<{emotionId: string, maxIntensity: number}[]> {
    return await this.repository.getHighestIntensityEmotions(
      query.userId,
      query.dateFrom,
      query.dateTo,
      query.limit
    );
  }
}