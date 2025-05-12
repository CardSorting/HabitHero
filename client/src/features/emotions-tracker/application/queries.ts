import { format } from 'date-fns';
import { 
  IEmotionsRepository,
  IEmotionEntriesRepository 
} from '../domain/repositories';
import { 
  EmotionCategory, 
  EmotionDate, 
  EmotionEntry, 
  EmotionSummary, 
  EmotionTrend,
  Emotion
} from '../domain/models';

/**
 * Query to get all emotions
 */
export class GetAllEmotionsQuery {
  constructor() {}
}

/**
 * GetAllEmotionsQueryHandler
 * Handles the GetAllEmotionsQuery
 */
export class GetAllEmotionsQueryHandler {
  constructor(private emotionsRepository: IEmotionsRepository) {}
  
  /**
   * Execute the query to get all emotions
   */
  async execute(): Promise<Emotion[]> {
    return this.emotionsRepository.getEmotions();
  }
}

/**
 * Query to get emotions by category
 */
export class GetEmotionsByCategoryQuery {
  constructor(public readonly category: EmotionCategory) {}
}

/**
 * GetEmotionsByCategoryQueryHandler
 * Handles the GetEmotionsByCategoryQuery
 */
export class GetEmotionsByCategoryQueryHandler {
  constructor(private emotionsRepository: IEmotionsRepository) {}
  
  /**
   * Execute the query to get emotions by category
   * @param query GetEmotionsByCategoryQuery instance
   */
  async execute(query: GetEmotionsByCategoryQuery): Promise<Emotion[]> {
    return this.emotionsRepository.getEmotionsByCategory(query.category);
  }
}

/**
 * Query to get emotion entries by date
 */
export class GetEmotionEntriesByDateQuery {
  constructor(
    public readonly userId: number,
    public readonly date: EmotionDate
  ) {}
}

/**
 * GetEmotionEntriesByDateQueryHandler
 * Handles the GetEmotionEntriesByDateQuery
 */
export class GetEmotionEntriesByDateQueryHandler {
  constructor(private entriesRepository: IEmotionEntriesRepository) {}
  
  /**
   * Execute the query to get emotion entries by date
   * @param query GetEmotionEntriesByDateQuery instance
   */
  async execute(query: GetEmotionEntriesByDateQuery): Promise<EmotionEntry[]> {
    const dateString = typeof query.date === 'string' 
      ? query.date 
      : format(query.date, 'yyyy-MM-dd');
    
    return this.entriesRepository.getEntriesByDate(query.userId, dateString);
  }
}

/**
 * Query to get emotion entries by date range
 */
export class GetEmotionEntriesByDateRangeQuery {
  constructor(
    public readonly userId: number,
    public readonly fromDate: EmotionDate,
    public readonly toDate: EmotionDate
  ) {}
}

/**
 * GetEmotionEntriesByDateRangeQueryHandler
 * Handles the GetEmotionEntriesByDateRangeQuery
 */
export class GetEmotionEntriesByDateRangeQueryHandler {
  constructor(private entriesRepository: IEmotionEntriesRepository) {}
  
  /**
   * Execute the query to get emotion entries by date range
   * @param query GetEmotionEntriesByDateRangeQuery instance
   */
  async execute(query: GetEmotionEntriesByDateRangeQuery): Promise<EmotionEntry[]> {
    const fromDateString = typeof query.fromDate === 'string' 
      ? query.fromDate 
      : format(query.fromDate, 'yyyy-MM-dd');
    
    const toDateString = typeof query.toDate === 'string' 
      ? query.toDate 
      : format(query.toDate, 'yyyy-MM-dd');
    
    return this.entriesRepository.getEntriesByDateRange(
      query.userId, 
      fromDateString, 
      toDateString
    );
  }
}

/**
 * Query to get emotion summary for a date
 */
export class GetEmotionSummaryQuery {
  constructor(
    public readonly userId: number,
    public readonly date: EmotionDate
  ) {}
}

/**
 * GetEmotionSummaryQueryHandler
 * Handles the GetEmotionSummaryQuery
 */
export class GetEmotionSummaryQueryHandler {
  constructor(private entriesRepository: IEmotionEntriesRepository) {}
  
  /**
   * Execute the query to get emotion summary for a date
   * @param query GetEmotionSummaryQuery instance
   */
  async execute(query: GetEmotionSummaryQuery): Promise<EmotionSummary> {
    const dateString = typeof query.date === 'string' 
      ? query.date 
      : format(query.date, 'yyyy-MM-dd');
    
    return this.entriesRepository.getSummaryForDate(query.userId, dateString);
  }
}

/**
 * Query to get emotion trends over a date range
 */
export class GetEmotionTrendsQuery {
  constructor(
    public readonly userId: number,
    public readonly fromDate: EmotionDate,
    public readonly toDate: EmotionDate
  ) {}
}

/**
 * GetEmotionTrendsQueryHandler
 * Handles the GetEmotionTrendsQuery
 */
export class GetEmotionTrendsQueryHandler {
  constructor(private entriesRepository: IEmotionEntriesRepository) {}
  
  /**
   * Execute the query to get emotion trends over a date range
   * @param query GetEmotionTrendsQuery instance
   */
  async execute(query: GetEmotionTrendsQuery): Promise<EmotionTrend[]> {
    const fromDateString = typeof query.fromDate === 'string' 
      ? query.fromDate 
      : format(query.fromDate, 'yyyy-MM-dd');
    
    const toDateString = typeof query.toDate === 'string' 
      ? query.toDate 
      : format(query.toDate, 'yyyy-MM-dd');
    
    return this.entriesRepository.getTrends(
      query.userId, 
      fromDateString, 
      toDateString
    );
  }
}

/**
 * Query to get most frequent emotions over a date range
 */
export class GetMostFrequentEmotionsQuery {
  constructor(
    public readonly userId: number,
    public readonly fromDate: EmotionDate,
    public readonly toDate: EmotionDate,
    public readonly limit?: number
  ) {}
}

/**
 * GetMostFrequentEmotionsQueryHandler
 * Handles the GetMostFrequentEmotionsQuery
 */
export class GetMostFrequentEmotionsQueryHandler {
  constructor(private entriesRepository: IEmotionEntriesRepository) {}
  
  /**
   * Execute the query to get most frequent emotions over a date range
   * @param query GetMostFrequentEmotionsQuery instance
   */
  async execute(query: GetMostFrequentEmotionsQuery): Promise<{emotion: string, count: number}[]> {
    const fromDateString = typeof query.fromDate === 'string' 
      ? query.fromDate 
      : format(query.fromDate, 'yyyy-MM-dd');
    
    const toDateString = typeof query.toDate === 'string' 
      ? query.toDate 
      : format(query.toDate, 'yyyy-MM-dd');
    
    return this.entriesRepository.getMostFrequentEmotions(
      query.userId, 
      fromDateString, 
      toDateString,
      query.limit
    );
  }
}

/**
 * Query to get highest intensity emotions over a date range
 */
export class GetHighestIntensityEmotionsQuery {
  constructor(
    public readonly userId: number,
    public readonly fromDate: EmotionDate,
    public readonly toDate: EmotionDate,
    public readonly limit?: number
  ) {}
}

/**
 * GetHighestIntensityEmotionsQueryHandler
 * Handles the GetHighestIntensityEmotionsQuery
 */
export class GetHighestIntensityEmotionsQueryHandler {
  constructor(private entriesRepository: IEmotionEntriesRepository) {}
  
  /**
   * Execute the query to get highest intensity emotions over a date range
   * @param query GetHighestIntensityEmotionsQuery instance
   */
  async execute(query: GetHighestIntensityEmotionsQuery): Promise<{emotion: string, intensity: number}[]> {
    const fromDateString = typeof query.fromDate === 'string' 
      ? query.fromDate 
      : format(query.fromDate, 'yyyy-MM-dd');
    
    const toDateString = typeof query.toDate === 'string' 
      ? query.toDate 
      : format(query.toDate, 'yyyy-MM-dd');
    
    return this.entriesRepository.getHighestIntensityEmotions(
      query.userId, 
      fromDateString, 
      toDateString,
      query.limit
    );
  }
}