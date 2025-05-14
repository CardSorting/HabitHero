/**
 * Crisis Event Service - Application Service Layer
 * Acts as a facade over commands and queries for the UI layer
 * Following Clean Architecture principles
 */

import { 
  CrisisEvent, 
  CrisisIntensity, 
  CrisisType, 
  DateString, 
  TimeString, 
  ID,
  CrisisAnalytics,
  CrisisTimePeriodSummary
} from '../domain/models';

import {
  CrisisCommandHandlers,
  CreateCrisisEventCommand,
  UpdateCrisisEventCommand,
  DeleteCrisisEventCommand
} from './commands';

import {
  CrisisQueryHandlers,
  GetCrisisEventsQuery,
  GetCrisisEventsByDateRangeQuery,
  GetCrisisEventByIdQuery,
  GetCrisisAnalyticsQuery,
  GetCrisisTimePeriodSummaryQuery
} from './queries';

import { ICrisisRepository } from '../domain/CrisisRepository';

/**
 * Application service providing a simplified interface for the UI layer
 * Coordinates the command and query handlers
 */
export class CrisisService {
  private commandHandlers: CrisisCommandHandlers;
  private queryHandlers: CrisisQueryHandlers;
  
  constructor(private repository: ICrisisRepository) {
    this.commandHandlers = new CrisisCommandHandlers(repository);
    this.queryHandlers = new CrisisQueryHandlers(repository);
  }
  
  // Command methods (write operations)
  
  async createCrisisEvent(
    userId: ID,
    crisisType: CrisisType,
    date: DateString,
    intensity: CrisisIntensity,
    time?: TimeString,
    duration?: number,
    notes?: string,
    symptoms?: string[],
    triggers?: string[],
    copingStrategiesUsed?: string[],
    copingStrategyEffectiveness?: number,
    helpSought: boolean = false,
    medication: boolean = false
  ): Promise<CrisisEvent> {
    const command = new CreateCrisisEventCommand(
      userId,
      crisisType,
      date,
      time,
      intensity,
      duration,
      notes,
      symptoms,
      triggers,
      copingStrategiesUsed,
      copingStrategyEffectiveness,
      helpSought,
      medication
    );
    
    return this.commandHandlers.handleCreateCrisisEvent(command);
  }
  
  async updateCrisisEvent(
    id: ID,
    crisisType?: CrisisType,
    date?: DateString,
    time?: TimeString,
    intensity?: CrisisIntensity,
    duration?: number,
    notes?: string,
    symptoms?: string[],
    triggers?: string[],
    copingStrategiesUsed?: string[],
    copingStrategyEffectiveness?: number,
    helpSought?: boolean,
    medication?: boolean
  ): Promise<CrisisEvent> {
    const command = new UpdateCrisisEventCommand(
      id,
      crisisType,
      date,
      time,
      intensity,
      duration,
      notes,
      symptoms,
      triggers,
      copingStrategiesUsed,
      copingStrategyEffectiveness,
      helpSought,
      medication
    );
    
    return this.commandHandlers.handleUpdateCrisisEvent(command);
  }
  
  async deleteCrisisEvent(id: ID): Promise<boolean> {
    const command = new DeleteCrisisEventCommand(id);
    return this.commandHandlers.handleDeleteCrisisEvent(command);
  }
  
  // Query methods (read operations)
  
  async getCrisisEvents(userId: ID): Promise<CrisisEvent[]> {
    const query = new GetCrisisEventsQuery(userId);
    return this.queryHandlers.handleGetCrisisEvents(query);
  }
  
  async getCrisisEventsByDateRange(
    userId: ID, 
    startDate: DateString, 
    endDate: DateString
  ): Promise<CrisisEvent[]> {
    const query = new GetCrisisEventsByDateRangeQuery(userId, startDate, endDate);
    return this.queryHandlers.handleGetCrisisEventsByDateRange(query);
  }
  
  async getCrisisEventById(id: ID): Promise<CrisisEvent | undefined> {
    const query = new GetCrisisEventByIdQuery(id);
    return this.queryHandlers.handleGetCrisisEventById(query);
  }
  
  async getCrisisAnalytics(
    userId: ID, 
    startDate?: DateString, 
    endDate?: DateString
  ): Promise<CrisisAnalytics> {
    const query = new GetCrisisAnalyticsQuery(userId, startDate, endDate);
    return this.queryHandlers.handleGetCrisisAnalytics(query);
  }
  
  async getCrisisTimePeriodSummary(
    userId: ID, 
    period: 'day' | 'week' | 'month' | 'year'
  ): Promise<CrisisTimePeriodSummary> {
    const query = new GetCrisisTimePeriodSummaryQuery(userId, period);
    return this.queryHandlers.handleGetCrisisTimePeriodSummary(query);
  }
}