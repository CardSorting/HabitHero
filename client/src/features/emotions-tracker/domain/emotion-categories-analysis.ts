/**
 * Domain models for emotion categories analysis
 */

/**
 * Represents a single emotion category with its occurrence count
 */
export interface CategoryDistribution {
  name: string; // Category name (e.g., "Positive", "Negative", "Neutral")
  value: number; // Occurrence count
  percentage?: number; // Optional percentage of total
}

/**
 * Emotion categories analysis result
 */
export interface EmotionCategoriesAnalysis {
  categoriesDistribution: CategoryDistribution[];
  dominantCategory: string | null;
  totalCount: number;
}

/**
 * Categories colors configuration
 */
export interface CategoryColorConfig {
  [key: string]: string;
}

/**
 * Default category colors
 */
export const DEFAULT_CATEGORY_COLORS: CategoryColorConfig = {
  Positive: '#4CAF50',
  Negative: '#F44336',
  Neutral: '#9E9E9E',
  Unknown: '#BDBDBD'
};

/**
 * Emoji mapping for each category
 */
export interface CategoryEmojiConfig {
  [key: string]: string;
}

/**
 * Default category emojis
 */
export const DEFAULT_CATEGORY_EMOJIS: CategoryEmojiConfig = {
  Positive: '😊',
  Negative: '😔',
  Neutral: '😐',
  Unknown: '❓'
};

/**
 * CSS class mapping for each category
 */
export interface CategoryClassConfig {
  [key: string]: string;
}

/**
 * Default category CSS classes
 */
export const DEFAULT_CATEGORY_CLASSES: CategoryClassConfig = {
  Positive: 'bg-blue-500',
  Negative: 'bg-red-500',
  Neutral: 'bg-purple-500',
  Unknown: 'bg-gray-400'
};