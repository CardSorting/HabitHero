/**
 * Repository interface for Crisis Tracker domain
 * Following DDD principles, this interface defines the contract for data access
 */

import { CrisisEvent, CrisisAnalytics, CrisisTimePeriodSummary } from './models';

export type ID = number;
export type DateString = string;
export type TimeString = string;

/**
 * Repository interface for Crisis Events
 * Defines methods for interacting with crisis events data
 */
export interface ICrisisRepository {
  /**
   * Get all crisis events for a user
   * @param userId The user identifier
   */
  getAll(userId: ID): Promise<CrisisEvent[]>;
  
  /**
   * Get crisis events for a specific date range
   * @param userId The user identifier
   * @param startDate The start date (inclusive)
   * @param endDate The end date (inclusive)
   */
  getByDateRange(userId: ID, startDate: DateString, endDate: DateString): Promise<CrisisEvent[]>;
  
  /**
   * Get a specific crisis event by ID
   * @param id The crisis event identifier
   */
  getById(id: ID): Promise<CrisisEvent | null>;
  
  /**
   * Create a new crisis event
   * @param event The crisis event to create
   */
  create(event: Omit<CrisisEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CrisisEvent>;
  
  /**
   * Update an existing crisis event
   * @param id The crisis event identifier
   * @param event The updated crisis event data
   */
  update(id: ID, event: Partial<CrisisEvent>): Promise<CrisisEvent>;
  
  /**
   * Delete a crisis event
   * @param id The crisis event identifier
   */
  delete(id: ID): Promise<boolean>;
  
  /**
   * Get analytics data for crisis events
   * @param userId The user identifier
   * @param startDate Optional start date to filter data
   * @param endDate Optional end date to filter data
   */
  getAnalytics(userId: ID, startDate?: DateString, endDate?: DateString): Promise<CrisisAnalytics>;
  
  /**
   * Get summary data for a specific time period
   * @param userId The user identifier
   * @param period The time period to analyze
   */
  getTimePeriodSummary(userId: ID, period: 'day' | 'week' | 'month' | 'year'): Promise<CrisisTimePeriodSummary>;
}