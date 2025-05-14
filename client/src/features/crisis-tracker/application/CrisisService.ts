/**
 * Crisis Service implementation
 * This service implements the CQRS Commands and Queries for crisis events
 */

import { 
  CreateCrisisEventCommand, 
  UpdateCrisisEventCommand, 
  DeleteCrisisEventCommand 
} from './commands';
import {
  GetAllCrisisEventsQuery,
  GetCrisisEventsByDateRangeQuery,
  GetCrisisEventByIdQuery,
  GetCrisisAnalyticsQuery,
  GetCrisisTimePeriodSummaryQuery
} from './queries';
import { ICrisisRepository, ID, DateString } from '../domain/CrisisRepository';
import { CrisisEvent, CrisisType, CrisisIntensity, CrisisAnalytics, CrisisTimePeriodSummary } from '../domain/models';

/**
 * Crisis Tracker Service
 * Implements the application layer for the crisis tracker
 */
export class CrisisService {
  constructor(private repository: ICrisisRepository) {}

  /**
   * Command handler to create a new crisis event
   */
  createCrisisEvent(command: Omit<CreateCrisisEventCommand, 'execute'>): Promise<number> {
    return this.repository.create({
      userId: command.userId,
      type: command.type,
      date: command.date,
      time: command.time,
      intensity: command.intensity,
      duration: command.duration,
      notes: command.notes,
      symptoms: command.symptoms,
      triggers: command.triggers,
      copingStrategiesUsed: command.copingStrategiesUsed,
      copingStrategyEffectiveness: command.copingStrategyEffectiveness,
      helpSought: command.helpSought,
      medication: command.medication
    }).then(event => event.id!);
  }

  /**
   * Command handler to update an existing crisis event
   */
  updateCrisisEvent(command: Omit<UpdateCrisisEventCommand, 'execute'>): Promise<boolean> {
    return this.repository.update(command.id, {
      type: command.type,
      date: command.date,
      time: command.time,
      intensity: command.intensity,
      duration: command.duration,
      notes: command.notes,
      symptoms: command.symptoms,
      triggers: command.triggers,
      copingStrategiesUsed: command.copingStrategiesUsed,
      copingStrategyEffectiveness: command.copingStrategyEffectiveness,
      helpSought: command.helpSought,
      medication: command.medication
    }).then(() => true);
  }

  /**
   * Command handler to delete a crisis event
   */
  deleteCrisisEvent(command: Omit<DeleteCrisisEventCommand, 'execute'>): Promise<boolean> {
    return this.repository.delete(command.id);
  }

  /**
   * Query handler to get all crisis events
   */
  getAllCrisisEvents(query: Omit<GetAllCrisisEventsQuery, 'execute'>): Promise<CrisisEvent[]> {
    return this.repository.getAll(query.userId);
  }

  /**
   * Query handler to get crisis events by date range
   */
  getCrisisEventsByDateRange(query: Omit<GetCrisisEventsByDateRangeQuery, 'execute'>): Promise<CrisisEvent[]> {
    return this.repository.getByDateRange(
      query.userId,
      query.startDate,
      query.endDate
    );
  }

  /**
   * Query handler to get a specific crisis event by ID
   */
  getCrisisEventById(query: Omit<GetCrisisEventByIdQuery, 'execute'>): Promise<CrisisEvent | null> {
    return this.repository.getById(query.id);
  }

  /**
   * Query handler to get analytics data
   */
  getCrisisAnalytics(query: Omit<GetCrisisAnalyticsQuery, 'execute'>): Promise<CrisisAnalytics> {
    return this.repository.getAnalytics(
      query.userId,
      query.startDate,
      query.endDate
    );
  }

  /**
   * Query handler to get summary data for a specific time period
   */
  getCrisisTimePeriodSummary(query: Omit<GetCrisisTimePeriodSummaryQuery, 'execute'>): Promise<CrisisTimePeriodSummary> {
    return this.repository.getTimePeriodSummary(query.userId, query.period);
  }
}