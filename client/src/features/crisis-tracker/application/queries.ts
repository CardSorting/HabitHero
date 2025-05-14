/**
 * CQRS Query definitions for Crisis Tracker
 * Following the Command Query Responsibility Segregation pattern
 */

import { ID, DateString } from '../domain/CrisisRepository';
import { CrisisEvent, CrisisAnalytics, CrisisTimePeriodSummary } from '../domain/models';

/**
 * Base query interface
 */
export interface Query<T> {
  execute(): Promise<T>;
}

/**
 * Query to get all crisis events for a user
 */
export interface GetAllCrisisEventsQuery extends Query<CrisisEvent[]> {
  userId: ID;
}

/**
 * Query to get crisis events in a date range
 */
export interface GetCrisisEventsByDateRangeQuery extends Query<CrisisEvent[]> {
  userId: ID;
  startDate: DateString;
  endDate: DateString;
}

/**
 * Query to get a specific crisis event by ID
 */
export interface GetCrisisEventByIdQuery extends Query<CrisisEvent | null> {
  id: ID;
}

/**
 * Query to get analytics data about crisis events
 */
export interface GetCrisisAnalyticsQuery extends Query<CrisisAnalytics> {
  userId: ID;
  startDate?: DateString;
  endDate?: DateString;
}

/**
 * Query to get crisis summary for a specific time period
 */
export interface GetCrisisTimePeriodSummaryQuery extends Query<CrisisTimePeriodSummary> {
  userId: ID;
  period: 'day' | 'week' | 'month' | 'year';
}