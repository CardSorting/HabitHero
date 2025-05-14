/**
 * API-based implementation of the CrisisRepository interface
 * Uses the backend API to provide crisis event data
 */

import { CrisisEvent, CrisisAnalytics, CrisisTimePeriodSummary } from '../domain/models';
import { ICrisisRepository, ID, DateString, TimeString } from '../domain/CrisisRepository';
import { apiRequest } from '@/lib/queryClient';

/**
 * Implementation of ICrisisRepository that communicates with the backend API
 */
export class ApiCrisisRepository implements ICrisisRepository {
  /**
   * Get all crisis events for a user
   */
  async getAll(userId: ID): Promise<CrisisEvent[]> {
    return await apiRequest({
      url: '/api/crisis-events',
      method: 'GET',
    });
  }

  /**
   * Get crisis events for a specific date range
   */
  async getByDateRange(userId: ID, startDate: DateString, endDate: DateString): Promise<CrisisEvent[]> {
    return await apiRequest({
      url: '/api/crisis-events/range',
      method: 'GET',
      params: { startDate, endDate },
    });
  }

  /**
   * Get a specific crisis event by ID
   */
  async getById(id: ID): Promise<CrisisEvent | null> {
    try {
      return await apiRequest({
        url: `/api/crisis-events/${id}`,
        method: 'GET',
      });
    } catch (error) {
      if ((error as any)?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new crisis event
   */
  async create(event: Omit<CrisisEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CrisisEvent> {
    return await apiRequest({
      url: '/api/crisis-events',
      method: 'POST',
      data: event,
    });
  }

  /**
   * Update an existing crisis event
   */
  async update(id: ID, event: Partial<CrisisEvent>): Promise<CrisisEvent> {
    return await apiRequest({
      url: `/api/crisis-events/${id}`,
      method: 'PUT',
      data: event,
    });
  }

  /**
   * Delete a crisis event
   */
  async delete(id: ID): Promise<boolean> {
    await apiRequest({
      url: `/api/crisis-events/${id}`,
      method: 'DELETE',
    });
    return true;
  }

  /**
   * Get analytics data for crisis events
   */
  async getAnalytics(userId: ID, startDate?: DateString, endDate?: DateString): Promise<CrisisAnalytics> {
    return await apiRequest({
      url: '/api/crisis-events/analytics/summary',
      method: 'GET',
      params: startDate && endDate ? { startDate, endDate } : undefined,
    });
  }

  /**
   * Get summary data for a specific time period
   */
  async getTimePeriodSummary(userId: ID, period: 'day' | 'week' | 'month' | 'year'): Promise<CrisisTimePeriodSummary> {
    return await apiRequest({
      url: `/api/crisis-events/analytics/period/${period}`,
      method: 'GET',
    });
  }
}