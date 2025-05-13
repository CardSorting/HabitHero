import { TimePeriod } from '../../domain/entities/EmotionTrackingTime';
import { 
  ITimeTrackingRepository, 
  TimeDistributionData, 
  TimePeriodCategoryDistribution 
} from '../../domain/repositories/ITimeTrackingRepository';
import { EmotionEntry } from '../../domain/models';

/**
 * Implementation of the ITimeTrackingRepository that uses the API
 * Implements the Repository pattern and follows DIP (Dependency Inversion Principle)
 */
export class ApiTimeTrackingRepository implements ITimeTrackingRepository {
  /**
   * Get the distribution of emotions recorded by time period
   * @param userId User ID
   * @param fromDate Start date in YYYY-MM-DD format
   * @param toDate End date in YYYY-MM-DD format
   * @returns Promise resolving to time distribution data
   */
  async getTimeDistribution(
    userId: number, 
    fromDate: string, 
    toDate: string
  ): Promise<TimeDistributionData> {
    try {
      // Fetch emotion entries for the date range
      const entries = await this.getEmotionEntriesForDateRange(userId, fromDate, toDate);
      
      // Calculate time distribution
      return this.calculateTimeDistribution(entries);
    } catch (error) {
      console.error('Error getting time distribution:', error);
      // Return default distribution with zeros
      return this.getDefaultDistribution();
    }
  }

  /**
   * Get the most common time period when a user records emotions
   * @param userId User ID
   * @param fromDate Start date in YYYY-MM-DD format
   * @param toDate End date in YYYY-MM-DD format
   * @returns Promise resolving to the most common time period
   */
  async getMostCommonTimePeriod(
    userId: number, 
    fromDate: string, 
    toDate: string
  ): Promise<TimePeriod | null> {
    try {
      const distribution = await this.getTimeDistribution(userId, fromDate, toDate);
      
      // Find the time period with the highest count
      let maxCount = 0;
      let mostCommonPeriod: TimePeriod | null = null;
      
      Object.entries(distribution).forEach(([period, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonPeriod = period as TimePeriod;
        }
      });
      
      return mostCommonPeriod;
    } catch (error) {
      console.error('Error getting most common time period:', error);
      return null;
    }
  }

  /**
   * Get the time period distribution of emotions by category
   * @param userId User ID
   * @param fromDate Start date in YYYY-MM-DD format
   * @param toDate End date in YYYY-MM-DD format
   * @returns Promise resolving to time period distribution by category
   */
  async getTimePeriodByCategory(
    userId: number, 
    fromDate: string, 
    toDate: string
  ): Promise<TimePeriodCategoryDistribution> {
    try {
      // Fetch emotion entries for the date range
      const entries = await this.getEmotionEntriesForDateRange(userId, fromDate, toDate);
      
      // Calculate distribution by category
      return this.calculateTimePeriodByCategory(entries);
    } catch (error) {
      console.error('Error getting time period by category:', error);
      // Return default distribution with zeros
      return this.getDefaultCategoryDistribution();
    }
  }

  /**
   * Helper method to get emotion entries for a date range
   * @private
   */
  private async getEmotionEntriesForDateRange(
    userId: number, 
    fromDate: string, 
    toDate: string
  ): Promise<EmotionEntry[]> {
    const response = await fetch(`/api/emotions/entries/range?from=${fromDate}&to=${toDate}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch emotion entries');
    }
    
    return await response.json();
  }

  /**
   * Helper method to calculate time distribution from entries
   * @private
   */
  private calculateTimeDistribution(entries: EmotionEntry[]): TimeDistributionData {
    const distribution = this.getDefaultDistribution();
    
    if (!entries || entries.length === 0) {
      return distribution;
    }
    
    entries.forEach(entry => {
      if (entry.time) {
        try {
          // Extract hour from time (format: HH:MM:SS or HH:MM)
          const hourPart = entry.time.split(':')[0];
          const hour = parseInt(hourPart, 10);
          
          if (isNaN(hour)) {
            console.warn('Invalid hour format in time:', entry.time);
            return;
          }
          
          // Determine time period
          if (hour >= 5 && hour <= 11) {
            distribution[TimePeriod.MORNING]++;
          } else if (hour >= 12 && hour <= 16) {
            distribution[TimePeriod.AFTERNOON]++;
          } else if (hour >= 17 && hour <= 21) {
            distribution[TimePeriod.EVENING]++;
          } else {
            distribution[TimePeriod.NIGHT]++;
          }
        } catch (err) {
          console.error('Error parsing time:', entry.time, err);
        }
      }
    });
    
    return distribution;
  }

  /**
   * Helper method to calculate time period distribution by category
   * @private
   */
  private calculateTimePeriodByCategory(entries: EmotionEntry[]): TimePeriodCategoryDistribution {
    const distribution = this.getDefaultCategoryDistribution();
    
    if (!entries || entries.length === 0) {
      return distribution;
    }
    
    entries.forEach(entry => {
      if (entry.time && entry.categoryId) {
        try {
          // Extract hour from time
          const hourPart = entry.time.split(':')[0];
          const hour = parseInt(hourPart, 10);
          
          if (isNaN(hour)) {
            return;
          }
          
          // Determine time period
          let period: TimePeriod;
          if (hour >= 5 && hour <= 11) {
            period = TimePeriod.MORNING;
          } else if (hour >= 12 && hour <= 16) {
            period = TimePeriod.AFTERNOON;
          } else if (hour >= 17 && hour <= 21) {
            period = TimePeriod.EVENING;
          } else {
            period = TimePeriod.NIGHT;
          }
          
          // Increment the appropriate category counter
          if (entry.categoryId === 'positive') {
            distribution[period].positive++;
          } else if (entry.categoryId === 'negative') {
            distribution[period].negative++;
          } else if (entry.categoryId === 'neutral') {
            distribution[period].neutral++;
          }
        } catch (err) {
          console.error('Error parsing time for category distribution:', err);
        }
      }
    });
    
    return distribution;
  }

  /**
   * Helper method to get default time distribution with zeros
   * @private
   */
  private getDefaultDistribution(): TimeDistributionData {
    return {
      [TimePeriod.MORNING]: 0,
      [TimePeriod.AFTERNOON]: 0,
      [TimePeriod.EVENING]: 0,
      [TimePeriod.NIGHT]: 0
    };
  }

  /**
   * Helper method to get default category distribution with zeros
   * @private
   */
  private getDefaultCategoryDistribution(): TimePeriodCategoryDistribution {
    return {
      [TimePeriod.MORNING]: { positive: 0, negative: 0, neutral: 0 },
      [TimePeriod.AFTERNOON]: { positive: 0, negative: 0, neutral: 0 },
      [TimePeriod.EVENING]: { positive: 0, negative: 0, neutral: 0 },
      [TimePeriod.NIGHT]: { positive: 0, negative: 0, neutral: 0 }
    };
  }
}