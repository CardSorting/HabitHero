/**
 * Enum for emotion categories
 */
export enum EmotionCategory {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral'
}

/**
 * Type representing an emotion entry in the system
 */
export interface EmotionEntry {
  id: number;
  userId: number;
  date: string;
  time?: string;
  emotionId: number;
  intensity: number;
  note?: string;
  categoryId?: string;
  createdAt?: string;
}

/**
 * Type representing an emotion category with related properties
 */
export interface EmotionCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

/**
 * Type representing an emotion with category information
 */
export interface Emotion {
  id: number;
  name: string;
  category: string;
  icon?: string;
}

/**
 * Type representing an emotion summary for a specific date range
 */
export interface EmotionSummary {
  totalEntries: number;
  uniqueEmotions: number;
  averageIntensity: number;
  mostFrequentEmotion?: {
    name: string;
    count: number;
  };
  categoryDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

/**
 * Type representing an emotion trend entry
 */
export interface EmotionTrend {
  date: string;
  count: number;
  averageIntensity: number;
  dominantCategory: string;
}

/**
 * Type representing a frequent emotion entry
 */
export interface FrequentEmotion {
  emotionId: number;
  emotionName: string;
  count: number;
  category: string;
  averageIntensity: number;
}