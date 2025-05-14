/**
 * Query objects for the Crisis Events system following CQRS pattern
 * Queries represent operations that read state
 */

import { 
  DateString,
  ID
} from '../domain/models';

// Base Query interface
export interface Query<T> {
  readonly type: string;
}

// Crisis Event Queries
export class GetCrisisEventsQuery implements Query<any[]> {
  readonly type = 'GET_CRISIS_EVENTS';
  
  constructor(
    public readonly userId: ID
  ) {}
}

export class GetCrisisEventsByDateRangeQuery implements Query<any[]> {
  readonly type = 'GET_CRISIS_EVENTS_BY_DATE_RANGE';
  
  constructor(
    public readonly userId: ID,
    public readonly startDate: DateString,
    public readonly endDate: DateString
  ) {}
}

export class GetCrisisEventByIdQuery implements Query<any> {
  readonly type = 'GET_CRISIS_EVENT_BY_ID';
  
  constructor(
    public readonly id: ID
  ) {}
}

export class GetCrisisAnalyticsQuery implements Query<any> {
  readonly type = 'GET_CRISIS_ANALYTICS';
  
  constructor(
    public readonly userId: ID,
    public readonly startDate?: DateString,
    public readonly endDate?: DateString
  ) {}
}

export class GetCrisisTimePeriodSummaryQuery implements Query<any> {
  readonly type = 'GET_CRISIS_TIME_PERIOD_SUMMARY';
  
  constructor(
    public readonly userId: ID,
    public readonly period: 'day' | 'week' | 'month' | 'year'
  ) {}
}

// Query Handlers
export class CrisisQueryHandlers {
  constructor(private repository: any) {}
  
  async handleGetCrisisEvents(query: GetCrisisEventsQuery) {
    return this.repository.getCrisisEvents(query.userId);
  }
  
  async handleGetCrisisEventsByDateRange(query: GetCrisisEventsByDateRangeQuery) {
    return this.repository.getCrisisEventsByDateRange(
      query.userId,
      query.startDate,
      query.endDate
    );
  }
  
  async handleGetCrisisEventById(query: GetCrisisEventByIdQuery) {
    return this.repository.getCrisisEventById(query.id);
  }
  
  async handleGetCrisisAnalytics(query: GetCrisisAnalyticsQuery) {
    return this.repository.getCrisisAnalytics(
      query.userId,
      query.startDate,
      query.endDate
    );
  }
  
  async handleGetCrisisTimePeriodSummary(query: GetCrisisTimePeriodSummaryQuery) {
    return this.repository.getCrisisTimePeriodSummary(
      query.userId,
      query.period
    );
  }
}