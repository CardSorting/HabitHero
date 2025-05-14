/**
 * API-based implementation of the Crisis Repository
 * Infrastructure layer component following Clean Architecture
 */

import { apiRequest } from "@lib/queryClient";
import { 
  CrisisEvent, 
  CreateCrisisEventData, 
  UpdateCrisisEventData,
  CrisisAnalytics,
  CrisisTimePeriodSummary,
  DateString,
  ID
} from '../domain/models';
import { ICrisisRepository } from '../domain/CrisisRepository';

export class ApiCrisisRepository implements ICrisisRepository {
  // Command methods (write operations)
  
  async createCrisisEvent(data: CreateCrisisEventData): Promise<CrisisEvent> {
    return apiRequest('/api/crisis-events', {
      method: 'POST',
      data
    });
  }
  
  async updateCrisisEvent(data: UpdateCrisisEventData): Promise<CrisisEvent> {
    return apiRequest(`/api/crisis-events/${data.id}`, {
      method: 'PUT',
      data
    });
  }
  
  async deleteCrisisEvent(id: ID): Promise<boolean> {
    const response = await apiRequest(`/api/crisis-events/${id}`, {
      method: 'DELETE'
    });
    return response.success;
  }
  
  // Query methods (read operations)
  
  async getCrisisEvents(userId: ID): Promise<CrisisEvent[]> {
    return apiRequest('/api/crisis-events');
  }
  
  async getCrisisEventsByDateRange(
    userId: ID, 
    startDate: DateString, 
    endDate: DateString
  ): Promise<CrisisEvent[]> {
    return apiRequest('/api/crisis-events/range', {
      params: { startDate, endDate }
    });
  }
  
  async getCrisisEventById(id: ID): Promise<CrisisEvent | undefined> {
    return apiRequest(`/api/crisis-events/${id}`);
  }
  
  async getCrisisAnalytics(
    userId: ID, 
    startDate?: DateString, 
    endDate?: DateString
  ): Promise<CrisisAnalytics> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return apiRequest('/api/crisis-events/analytics/summary', {
      params
    });
  }
  
  async getCrisisTimePeriodSummary(
    userId: ID, 
    period: 'day' | 'week' | 'month' | 'year'
  ): Promise<CrisisTimePeriodSummary> {
    return apiRequest(`/api/crisis-events/analytics/period/${period}`);
  }
}