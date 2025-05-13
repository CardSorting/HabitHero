/**
 * Domain models for the emotions tracker feature
 */

/**
 * Emotion categories
 */
export enum EmotionCategory {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral'
}

/**
 * Emotion model representing a predefined emotion
 */
export interface Emotion {
  id: string;
  name: string;
  description?: string;
  category: EmotionCategory;
  color: string;
  icon?: string;
}

/**
 * Emotion Entry model representing a tracked emotion
 */
export interface EmotionEntry {
  id: string;
  userId: number;
  date: string;
  time?: string; // Time in HH:MM:SS format
  emotionId: string;
  emotionName: string;
  categoryId: string;
  intensity: number;
  notes?: string;
  triggers?: string[];
  copingMechanisms?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Emotion Summary model representing a summary of emotions for a specific date
 */
export interface EmotionSummary {
  date: string;
  dominantEmotion: string | null;
  highestIntensity: number | null;
  averageIntensity: number | null;
  emotionCount: number;
  entryIds: string[];
}

/**
 * Emotion Trend model representing trends of emotions over time
 */
export interface EmotionTrend {
  date: string;
  emotions: {
    [emotionName: string]: {
      count: number;
      averageIntensity: number;
    }
  };
  dominantEmotion: string | null;
  overallMood: 'positive' | 'negative' | 'neutral' | 'mixed';
}

/**
 * Emotion Event model representing an event when an emotion is tracked
 */
export interface EmotionEvent {
  type: 'emotion_tracked' | 'emotion_updated' | 'emotion_deleted';
  emotionId: string;
  emotionName: string;
  categoryId: string;
  intensity: number;
  userId: number;
  timestamp: string;
}

/**
 * Valid dates for tracking emotions
 */
export type EmotionDate = Date | string;