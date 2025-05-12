// API implementation of the emotions repository
// Infrastructure layer is responsible for external concerns like API calls

import { 
  DateString, 
  EmotionDTO, 
  EmotionTrackingEntry,
  EmotionSummaryDTO,
  EmotionTrendDTO,
  predefinedEmotions
} from '../domain/models';
import { IEmotionsRepository } from '../domain/repositories';

export class ApiEmotionsRepository implements IEmotionsRepository {
  private readonly baseUrl: string = '/api/emotions';
  private readonly userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  // Emotions methods
  async getEmotions(): Promise<EmotionDTO[]> {
    try {
      const response = await fetch(`${this.baseUrl}/predefined`);
      if (!response.ok) {
        // If the endpoint is not yet implemented, return predefined emotions
        if (response.status === 404) {
          return predefinedEmotions;
        }
        throw new Error(`Failed to fetch emotions: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching emotions:', error);
      // Fallback to predefined emotions in case of error
      return predefinedEmotions;
    }
  }

  async getEmotionById(id: string): Promise<EmotionDTO | null> {
    try {
      const response = await fetch(`${this.baseUrl}/predefined/${id}`);
      if (!response.ok) {
        // If the endpoint is not yet implemented, find from predefined emotions
        if (response.status === 404) {
          return predefinedEmotions.find(e => e.id === id) || null;
        }
        throw new Error(`Failed to fetch emotion: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching emotion with id ${id}:`, error);
      // Fallback to finding in predefined emotions
      return predefinedEmotions.find(e => e.id === id) || null;
    }
  }

  // Emotion tracking entries methods
  async getEmotionEntries(userId: number, dateFrom: DateString, dateTo: DateString): Promise<EmotionTrackingEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/entries?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch emotion entries: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching emotion entries:', error);
      return [];
    }
  }

  async getEmotionEntry(id: number): Promise<EmotionTrackingEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/entries/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch emotion entry: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching emotion entry with id ${id}:`, error);
      return null;
    }
  }

  async saveEmotionEntry(entry: EmotionTrackingEntry): Promise<EmotionTrackingEntry> {
    try {
      const method = entry.id ? 'PUT' : 'POST';
      const url = entry.id 
        ? `${this.baseUrl}/entries/${entry.id}` 
        : `${this.baseUrl}/entries`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save emotion entry: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving emotion entry:', error);
      throw error;
    }
  }

  async deleteEmotionEntry(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/entries/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete emotion entry: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting emotion entry with id ${id}:`, error);
      return false;
    }
  }

  // Analytics methods
  async getEmotionSummary(userId: number, date: DateString): Promise<EmotionSummaryDTO> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/summary/${date}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch emotion summary: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching emotion summary:', error);
      // Return a default summary
      return {
        date,
        averageIntensity: 0,
        dominantEmotion: '',
        emotionCounts: {},
        highestIntensity: {
          emotion: '',
          value: 0
        }
      };
    }
  }

  async getEmotionTrends(userId: number, dateFrom: DateString, dateTo: DateString): Promise<EmotionTrendDTO[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/trends?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch emotion trends: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching emotion trends:', error);
      return [];
    }
  }

  async getMostFrequentEmotions(userId: number, dateFrom: DateString, dateTo: DateString, limit: number = 5): Promise<{emotionId: string, count: number}[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/frequent?dateFrom=${dateFrom}&dateTo=${dateTo}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch frequent emotions: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching frequent emotions:', error);
      return [];
    }
  }

  async getHighestIntensityEmotions(userId: number, dateFrom: DateString, dateTo: DateString, limit: number = 5): Promise<{emotionId: string, maxIntensity: number}[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/highest-intensity?dateFrom=${dateFrom}&dateTo=${dateTo}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch highest intensity emotions: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching highest intensity emotions:', error);
      return [];
    }
  }
}