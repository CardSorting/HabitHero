import { 
  Emotion, 
  EmotionCategory, 
  EmotionEntry, 
  EmotionSummary, 
  EmotionTrend 
} from './models';

/**
 * IEmotionsRepository
 * Repository interface for emotion operations
 */
export interface IEmotionsRepository {
  /**
   * Get a list of all predefined emotions
   */
  getEmotions(): Promise<Emotion[]>;
  
  /**
   * Get a specific emotion by its ID
   * @param id Emotion ID
   */
  getEmotionById(id: string): Promise<Emotion | null>;
  
  /**
   * Get emotions by category
   * @param category Emotion category
   */
  getEmotionsByCategory(category: EmotionCategory): Promise<Emotion[]>;
}

/**
 * IEmotionEntriesRepository
 * Repository interface for emotion tracking entries operations
 */
export interface IEmotionEntriesRepository {
  /**
   * Get all emotion entries for a user
   * @param userId User ID
   */
  getEntriesByUser(userId: number): Promise<EmotionEntry[]>;
  
  /**
   * Get emotion entries for a specific date
   * @param userId User ID
   * @param date Date string in YYYY-MM-DD format
   */
  getEntriesByDate(userId: number, date: string): Promise<EmotionEntry[]>;
  
  /**
   * Get emotion entries within a date range
   * @param userId User ID
   * @param fromDate Start date string in YYYY-MM-DD format
   * @param toDate End date string in YYYY-MM-DD format
   */
  getEntriesByDateRange(userId: number, fromDate: string, toDate: string): Promise<EmotionEntry[]>;
  
  /**
   * Get a specific emotion entry by ID
   * @param id Entry ID
   */
  getEntryById(id: string): Promise<EmotionEntry | null>;
  
  /**
   * Create a new emotion entry
   * @param entry Emotion entry data
   */
  createEntry(entry: Omit<EmotionEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmotionEntry>;
  
  /**
   * Update an existing emotion entry
   * @param id Entry ID
   * @param entry Updated entry data
   */
  updateEntry(id: string, entry: Partial<EmotionEntry>): Promise<EmotionEntry>;
  
  /**
   * Delete an emotion entry
   * @param id Entry ID
   */
  deleteEntry(id: string): Promise<boolean>;
  
  /**
   * Get summary of emotions for a specific date
   * @param userId User ID
   * @param date Date string in YYYY-MM-DD format
   */
  getSummaryForDate(userId: number, date: string): Promise<EmotionSummary>;
  
  /**
   * Get emotion trends over a date range
   * @param userId User ID
   * @param fromDate Start date string in YYYY-MM-DD format
   * @param toDate End date string in YYYY-MM-DD format
   */
  getTrends(userId: number, fromDate: string, toDate: string): Promise<EmotionTrend[]>;
  
  /**
   * Get most frequent emotions over a date range
   * @param userId User ID
   * @param fromDate Start date string in YYYY-MM-DD format
   * @param toDate End date string in YYYY-MM-DD format
   * @param limit Maximum number of emotions to return
   */
  getMostFrequentEmotions(userId: number, fromDate: string, toDate: string, limit?: number): Promise<{emotion: string, count: number}[]>;
  
  /**
   * Get emotions with highest intensity over a date range
   * @param userId User ID
   * @param fromDate Start date string in YYYY-MM-DD format
   * @param toDate End date string in YYYY-MM-DD format
   * @param limit Maximum number of emotions to return
   */
  getHighestIntensityEmotions(userId: number, fromDate: string, toDate: string, limit?: number): Promise<{emotion: string, intensity: number}[]>;
}