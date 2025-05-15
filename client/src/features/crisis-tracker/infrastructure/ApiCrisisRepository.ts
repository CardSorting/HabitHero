/**
 * API-based implementation of the CrisisRepository interface
 * Uses the backend API to provide crisis event data
 */

import { CrisisEvent, CrisisAnalytics, CrisisTimePeriodSummary } from '../domain/models';
import { ICrisisRepository, ID, DateString, TimeString } from '../domain/CrisisRepository';
import { apiRequest, getResponseData } from '@/lib/queryClient';

/**
 * Implementation of ICrisisRepository that communicates with the backend API
 */
export class ApiCrisisRepository implements ICrisisRepository {
  /**
   * Get all crisis events for a user
   */
  async getAll(userId: ID): Promise<CrisisEvent[]> {
    try {
      const response = await apiRequest('GET', '/api/crisis-events');
      const data = await getResponseData<CrisisEvent[]>(response);
      
      // Ensure we're always returning an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching crisis events:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get crisis events for a specific date range
   */
  async getByDateRange(userId: ID, startDate: DateString, endDate: DateString): Promise<CrisisEvent[]> {
    try {
      const url = `/api/crisis-events/range?startDate=${startDate}&endDate=${endDate}`;
      const response = await apiRequest('GET', url);
      const data = await getResponseData<CrisisEvent[]>(response);
      
      // Ensure we're always returning an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching crisis events by date range:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get a specific crisis event by ID
   */
  async getById(id: ID): Promise<CrisisEvent | null> {
    try {
      const response = await apiRequest('GET', `/api/crisis-events/${id}`);
      return await getResponseData<CrisisEvent>(response);
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
    const response = await apiRequest('POST', '/api/crisis-events', event);
    return await getResponseData<CrisisEvent>(response);
  }

  /**
   * Update an existing crisis event
   */
  async update(id: ID, event: Partial<CrisisEvent>): Promise<CrisisEvent> {
    const response = await apiRequest('PUT', `/api/crisis-events/${id}`, event);
    return await getResponseData<CrisisEvent>(response);
  }

  /**
   * Delete a crisis event
   */
  async delete(id: ID): Promise<boolean> {
    await apiRequest('DELETE', `/api/crisis-events/${id}`);
    return true;
  }

  /**
   * Get analytics data for crisis events
   */
  async getAnalytics(userId: ID, startDate?: DateString, endDate?: DateString): Promise<CrisisAnalytics> {
    let url = '/api/crisis-events/analytics/summary';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await apiRequest('GET', url);
    return await getResponseData<CrisisAnalytics>(response);
  }

  /**
   * Get summary data for a specific time period
   */
  async getTimePeriodSummary(userId: ID, period: 'day' | 'week' | 'month' | 'year'): Promise<CrisisTimePeriodSummary> {
    const response = await apiRequest('GET', `/api/crisis-events/analytics/period/${period}`);
    return await getResponseData<CrisisTimePeriodSummary>(response);
  }
}