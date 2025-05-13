import { TimePeriod } from '../entities/EmotionTrackingTime';

/**
 * Repository interface for time tracking data
 * Following the Repository pattern from DDD
 */
export interface ITimeTrackingRepository {
  /**
   * Get the distribution of emotions recorded by time period for a date range
   * @param userId User ID
   * @param fromDate Start date in YYYY-MM-DD format
   * @param toDate End date in YYYY-MM-DD format
   * @returns Promise resolving to time distribution data
   */
  getTimeDistribution(
    userId: number, 
    fromDate: string, 
    toDate: string
  ): Promise<TimeDistributionData>;

  /**
   * Get the most common time period when a user records emotions
   * @param userId User ID
   * @param fromDate Start date in YYYY-MM-DD format
   * @param toDate End date in YYYY-MM-DD format
   * @returns Promise resolving to the most common time period
   */
  getMostCommonTimePeriod(
    userId: number, 
    fromDate: string, 
    toDate: string
  ): Promise<TimePeriod | null>;

  /**
   * Get the time period distribution of emotions by category
   * @param userId User ID
   * @param fromDate Start date in YYYY-MM-DD format
   * @param toDate End date in YYYY-MM-DD format
   * @returns Promise resolving to time period distribution by category
   */
  getTimePeriodByCategory(
    userId: number, 
    fromDate: string, 
    toDate: string
  ): Promise<TimePeriodCategoryDistribution>;
}

/**
 * Type representing time distribution data
 */
export type TimeDistributionData = {
  [key in TimePeriod]: number;
};

/**
 * Type representing time distribution by emotion category
 */
export type TimePeriodCategoryDistribution = {
  [key in TimePeriod]: {
    positive: number;
    negative: number;
    neutral: number;
  };
};