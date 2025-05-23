import { format } from 'date-fns';
import { 
  IEmotionsRepository, 
  IEmotionEntriesRepository 
} from '../domain/repositories';
import { 
  Emotion, 
  EmotionEntry, 
  EmotionSummary, 
  EmotionTrend 
} from '../domain/models';
import { EmotionCategory } from '../domain/emotion-categories-analysis';

/**
 * API-based implementation of the IEmotionsRepository and IEmotionEntriesRepository
 * This class communicates with the server API to perform CRUD operations
 */
export class ApiEmotionsRepository implements IEmotionsRepository, IEmotionEntriesRepository {
  private predefinedEmotions: Emotion[] = [
    // Positive emotions
    { id: 'joy', name: 'Joy', category: EmotionCategory.POSITIVE, color: '#FFD700' },
    { id: 'gratitude', name: 'Gratitude', category: EmotionCategory.POSITIVE, color: '#90EE90' },
    { id: 'serenity', name: 'Serenity', category: EmotionCategory.POSITIVE, color: '#ADD8E6' },
    { id: 'interest', name: 'Interest', category: EmotionCategory.POSITIVE, color: '#FFA07A' },
    { id: 'hope', name: 'Hope', category: EmotionCategory.POSITIVE, color: '#E0FFFF' },
    { id: 'pride', name: 'Pride', category: EmotionCategory.POSITIVE, color: '#FFB6C1' },
    { id: 'amusement', name: 'Amusement', category: EmotionCategory.POSITIVE, color: '#FF69B4' },
    { id: 'inspiration', name: 'Inspiration', category: EmotionCategory.POSITIVE, color: '#FFFFE0' },
    
    // Negative emotions
    { id: 'anxiety', name: 'Anxiety', category: EmotionCategory.NEGATIVE, color: '#A9A9A9' },
    { id: 'fear', name: 'Fear', category: EmotionCategory.NEGATIVE, color: '#800000' },
    { id: 'sadness', name: 'Sadness', category: EmotionCategory.NEGATIVE, color: '#4682B4' },
    { id: 'anger', name: 'Anger', category: EmotionCategory.NEGATIVE, color: '#DC143C' },
    { id: 'shame', name: 'Shame', category: EmotionCategory.NEGATIVE, color: '#800080' },
    { id: 'disappointment', name: 'Disappointment', category: EmotionCategory.NEGATIVE, color: '#708090' },
    { id: 'jealousy', name: 'Jealousy', category: EmotionCategory.NEGATIVE, color: '#006400' },
    { id: 'frustration', name: 'Frustration', category: EmotionCategory.NEGATIVE, color: '#FF6347' },
    
    // Neutral emotions
    { id: 'surprise', name: 'Surprise', category: EmotionCategory.NEUTRAL, color: '#BA55D3' },
    { id: 'confusion', name: 'Confusion', category: EmotionCategory.NEUTRAL, color: '#D3D3D3' },
    { id: 'anticipation', name: 'Anticipation', category: EmotionCategory.NEUTRAL, color: '#F0E68C' },
    { id: 'acceptance', name: 'Acceptance', category: EmotionCategory.NEUTRAL, color: '#20B2AA' }
  ];
  
  constructor() {}
  
  /**
   * Get all emotions
   */
  async getEmotions(): Promise<Emotion[]> {
    try {
      const response = await fetch('/api/emotions/predefined');
      
      if (!response.ok) {
        // If server API is not available, return predefined emotions
        return this.predefinedEmotions;
      }
      
      const data = await response.json();
      
      // Check if response contains a message indicating to use predefined emotions
      if (data && (data.message === "Use client-side predefined emotions" || !Array.isArray(data))) {
        console.log('Using predefined emotions as server instructed to use client-side data');
        return this.predefinedEmotions;
      }
      
      return Array.isArray(data) ? data : this.predefinedEmotions;
    } catch (error) {
      console.error('Error fetching emotions:', error);
      // Return predefined emotions as fallback
      return this.predefinedEmotions;
    }
  }
  
  /**
   * Get a specific emotion by its ID
   * @param id Emotion ID
   */
  async getEmotionById(id: string): Promise<Emotion | null> {
    try {
      const response = await fetch(`/api/emotions/predefined/${id}`);
      
      if (!response.ok) {
        // If server API is not available, lookup in predefined emotions
        const emotion = this.predefinedEmotions.find(e => e.id === id);
        return emotion || null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching emotion by ID ${id}:`, error);
      // Lookup in predefined emotions as fallback
      const emotion = this.predefinedEmotions.find(e => e.id === id);
      return emotion || null;
    }
  }
  
  /**
   * Get emotions by category
   * @param category Emotion category
   */
  async getEmotionsByCategory(category: EmotionCategory): Promise<Emotion[]> {
    try {
      // Try to get from server first
      const allEmotions = await this.getEmotions();
      
      // Ensure allEmotions is an array before filtering
      if (!Array.isArray(allEmotions)) {
        console.error('Invalid emotions data:', allEmotions);
        // Return predefined emotions filtered by category as fallback
        return this.predefinedEmotions.filter(emotion => emotion.category === category);
      }
      
      return allEmotions.filter(emotion => emotion.category === category);
    } catch (error) {
      console.error(`Error fetching emotions by category ${category}:`, error);
      // Filter predefined emotions by category as fallback
      return this.predefinedEmotions.filter(emotion => emotion.category === category);
    }
  }
  
  /**
   * Get all emotion entries for a user
   * @param userId User ID
   */
  async getEntriesByUser(userId: number): Promise<EmotionEntry[]> {
    try {
      const response = await fetch('/api/emotions/entries');
      
      if (!response.ok) {
        throw new Error('Failed to fetch emotion entries');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching entries for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Get emotion entries for a specific date
   * @param userId User ID
   * @param date Date string in YYYY-MM-DD format
   */
  async getEntriesByDate(userId: number, date: string): Promise<EmotionEntry[]> {
    try {
      const response = await fetch(`/api/emotions/entries/date/${date}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch emotion entries for date ${date}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching entries for date ${date}:`, error);
      return [];
    }
  }
  
  /**
   * Get emotion entries within a date range
   * @param userId User ID
   * @param fromDate Start date string in YYYY-MM-DD format
   * @param toDate End date string in YYYY-MM-DD format
   */
  async getEntriesByDateRange(userId: number, fromDate: string, toDate: string): Promise<EmotionEntry[]> {
    try {
      // The API expects query parameters 'from' and 'to' (not 'fromDate' and 'toDate')
      const response = await fetch(`/api/emotions/entries/range?from=${fromDate}&to=${toDate}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch emotion entries: ${response.status} ${response.statusText}`);
        // Log more info for debugging
        const errorData = await response.text();
        console.log('Error response:', errorData);
        throw new Error(`Failed to fetch emotion entries for date range ${fromDate} to ${toDate}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching entries for date range ${fromDate} to ${toDate}:`, error);
      return [];
    }
  }
  
  /**
   * Get a specific emotion entry by ID
   * @param id Entry ID
   */
  async getEntryById(id: string): Promise<EmotionEntry | null> {
    try {
      const response = await fetch(`/api/emotions/entries/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch emotion entry ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching entry ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new emotion entry
   * @param entry Emotion entry data
   */
  async createEntry(entry: Omit<EmotionEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmotionEntry> {
    try {
      const response = await fetch('/api/emotions/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create emotion entry');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating emotion entry:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing emotion entry
   * @param id Entry ID
   * @param entry Updated entry data
   */
  async updateEntry(id: string, entry: Partial<EmotionEntry>): Promise<EmotionEntry> {
    try {
      const response = await fetch(`/api/emotions/entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update emotion entry ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating emotion entry ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an emotion entry
   * @param id Entry ID
   */
  async deleteEntry(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/emotions/entries/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete emotion entry ${id}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting emotion entry ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Get summary of emotions for a specific date
   * @param userId User ID
   * @param date Date string in YYYY-MM-DD format
   */
  async getSummaryForDate(userId: number, date: string): Promise<EmotionSummary> {
    try {
      const response = await fetch(`/api/emotions/analytics/summary/${date}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch emotion summary for date ${date}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching emotion summary for date ${date}:`, error);
      // Return a default empty summary
      return {
        date,
        dominantEmotion: null,
        highestIntensity: null,
        averageIntensity: null,
        emotionCount: 0,
        entryIds: []
      };
    }
  }
  
  /**
   * Get emotion trends over a date range
   * @param userId User ID
   * @param fromDate Start date string in YYYY-MM-DD format
   * @param toDate End date string in YYYY-MM-DD format
   */
  async getTrends(userId: number, fromDate: string, toDate: string): Promise<EmotionTrend[]> {
    try {
      // Ensure we have both date parameters to avoid 400 errors
      if (!fromDate || !toDate) {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        
        const formatDate = (date: Date) => {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };
        
        fromDate = fromDate || formatDate(oneWeekAgo);
        toDate = toDate || formatDate(today);
        
        console.log(`Using default date range ${fromDate} to ${toDate} for trends`);
      }
      
      const response = await fetch(`/api/emotions/analytics/trends?from=${fromDate}&to=${toDate}`);
      
      if (!response.ok) {
        console.warn(`Failed to fetch emotion trends: ${response.status} ${response.statusText}`);
        // Return empty array for now
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching emotion trends for date range ${fromDate} to ${toDate}:`, error);
      return [];
    }
  }
  
  /**
   * Get most frequent emotions over a date range
   * @param userId User ID
   * @param fromDate Start date string in YYYY-MM-DD format
   * @param toDate End date string in YYYY-MM-DD format
   * @param limit Maximum number of emotions to return
   */
  async getMostFrequentEmotions(userId: number, fromDate: string, toDate: string, limit?: number): Promise<{emotion: string, count: number}[]> {
    try {
      // Ensure we have both date parameters to avoid 400 errors
      if (!fromDate || !toDate) {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        
        const formatDate = (date: Date) => {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };
        
        fromDate = fromDate || formatDate(oneWeekAgo);
        toDate = toDate || formatDate(today);
        
        console.log(`Using default date range ${fromDate} to ${toDate} for frequent emotions`);
      }
      
      let url = `/api/emotions/analytics/frequent?from=${fromDate}&to=${toDate}`;
      if (limit) {
        url += `&limit=${limit}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Failed to fetch most frequent emotions: ${response.status} ${response.statusText}`);
        // For demonstration purposes when no data is available yet
        return [
          { emotion: "No data yet", count: 0 }
        ];
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching most frequent emotions for date range ${fromDate} to ${toDate}:`, error);
      return [];
    }
  }
  
  /**
   * Get emotions with highest intensity over a date range
   * @param userId User ID
   * @param fromDate Start date string in YYYY-MM-DD format
   * @param toDate End date string in YYYY-MM-DD format
   * @param limit Maximum number of emotions to return
   */
  async getHighestIntensityEmotions(userId: number, fromDate: string, toDate: string, limit?: number): Promise<{emotion: string, intensity: number}[]> {
    try {
      // Ensure we have both date parameters to avoid 400 errors
      if (!fromDate || !toDate) {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        
        const formatDate = (date: Date) => {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };
        
        fromDate = fromDate || formatDate(oneWeekAgo);
        toDate = toDate || formatDate(today);
        
        console.log(`Using default date range ${fromDate} to ${toDate} for highest intensity emotions`);
      }
      
      let url = `/api/emotions/analytics/highest-intensity?from=${fromDate}&to=${toDate}`;
      if (limit) {
        url += `&limit=${limit}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Failed to fetch highest intensity emotions: ${response.status} ${response.statusText}`);
        // For demonstration purposes when no data is available yet
        return [
          { emotion: "No data yet", intensity: 0 }
        ];
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching highest intensity emotions for date range ${fromDate} to ${toDate}:`, error);
      return [];
    }
  }
}