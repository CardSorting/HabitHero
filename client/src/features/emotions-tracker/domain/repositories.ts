// Repository interfaces for Emotions Tracker
// Following DDD, these define the contracts for data access

import { 
  DateString, 
  EmotionDTO, 
  EmotionTrackingEntry, 
  EmotionSummaryDTO,
  EmotionTrendDTO
} from './models';

// Repository interfaces
export interface IEmotionsRepository {
  // Emotions
  getEmotions(): Promise<EmotionDTO[]>; 
  getEmotionById(id: string): Promise<EmotionDTO | null>;
  
  // Emotion tracking entries
  getEmotionEntries(userId: number, dateFrom: DateString, dateTo: DateString): Promise<EmotionTrackingEntry[]>;
  getEmotionEntry(id: number): Promise<EmotionTrackingEntry | null>;
  saveEmotionEntry(entry: EmotionTrackingEntry): Promise<EmotionTrackingEntry>;
  deleteEmotionEntry(id: number): Promise<boolean>;
  
  // Aggregate data and analytics
  getEmotionSummary(userId: number, date: DateString): Promise<EmotionSummaryDTO>;
  getEmotionTrends(userId: number, dateFrom: DateString, dateTo: DateString): Promise<EmotionTrendDTO[]>;
  getMostFrequentEmotions(userId: number, dateFrom: DateString, dateTo: DateString, limit?: number): Promise<{emotionId: string, count: number}[]>;
  getHighestIntensityEmotions(userId: number, dateFrom: DateString, dateTo: DateString, limit?: number): Promise<{emotionId: string, maxIntensity: number}[]>;
}

// Event sourcing repository (optional extension)
export interface IEmotionsEventStore {
  saveEvent(eventName: string, payload: any): Promise<void>;
  getEvents(userId: number, dateFrom: DateString, dateTo: DateString): Promise<Array<{eventName: string, payload: any, timestamp: Date}>>;
}