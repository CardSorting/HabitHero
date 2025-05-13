// We're no longer defining EmotionCategory here, it's imported from emotion-categories-analysis.ts

/**
 * Type for representing dates in the emotion tracking system
 * This is a string in the format YYYY-MM-DD
 */
export type EmotionDate = string;

/**
 * Type representing an emotion entry in the system
 */
export interface EmotionEntry {
  id: number;
  userId: number;
  date: string;
  time?: string;
  emotionId: number | string;
  emotionName: string;
  intensity: number;
  note?: string;
  notes?: string; // Alias for note for backward compatibility
  categoryId?: string;
  triggers?: string[];
  copingMechanisms?: string[];
  createdAt?: string;
}

/**
 * Type representing an emotion category with related properties
 * 
 * Note: We're now using the EmotionCategory enum from emotion-categories-analysis.ts
 * This interface has been renamed to EmotionCategoryDetails to avoid conflicts
 */
export interface EmotionCategoryDetails {
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
  // Additional fields for backward compatibility
  emotionCount?: number;
  dominantEmotion?: string | null;
  highestIntensity?: number | null;
  date?: string;
  entryIds?: number[];
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