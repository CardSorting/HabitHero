/**
 * Repository interface for the Crisis Events domain
 * Following DDD principles, this defines a contract for data access
 * without specifying implementation details
 */

import { 
  CrisisEvent, 
  CreateCrisisEventData, 
  UpdateCrisisEventData,
  CrisisAnalytics,
  CrisisTimePeriodSummary,
  DateString,
  ID
} from './models';

export interface ICrisisRepository {
  // Command methods (write operations)
  createCrisisEvent(data: CreateCrisisEventData): Promise<CrisisEvent>;
  updateCrisisEvent(data: UpdateCrisisEventData): Promise<CrisisEvent>;
  deleteCrisisEvent(id: ID): Promise<boolean>;
  
  // Query methods (read operations)
  getCrisisEvents(userId: ID): Promise<CrisisEvent[]>;
  getCrisisEventsByDateRange(userId: ID, startDate: DateString, endDate: DateString): Promise<CrisisEvent[]>;
  getCrisisEventById(id: ID): Promise<CrisisEvent | undefined>;
  getCrisisAnalytics(userId: ID, startDate?: DateString, endDate?: DateString): Promise<CrisisAnalytics>;
  getCrisisTimePeriodSummary(userId: ID, period: 'day' | 'week' | 'month' | 'year'): Promise<CrisisTimePeriodSummary>;
}