/**
 * Enum for emotion categories
 * Following Domain-Driven Design principles - Using enums for value objects with predefined values
 */
export enum EmotionCategory {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral'
}

/**
 * Default color classes for each emotion category
 */
export const DEFAULT_CATEGORY_CLASSES = {
  [EmotionCategory.POSITIVE]: 'bg-green-500',
  [EmotionCategory.NEGATIVE]: 'bg-red-500',
  [EmotionCategory.NEUTRAL]: 'bg-blue-500'
};

/**
 * Default colors for each emotion category
 */
export const DEFAULT_CATEGORY_COLORS = {
  positive: '#10b981', // green-500
  negative: '#ef4444', // red-500
  neutral: '#3b82f6'  // blue-500
};

/**
 * Default emoji icons for each emotion category
 */
export const DEFAULT_CATEGORY_EMOJIS = {
  [EmotionCategory.POSITIVE]: '😊',
  [EmotionCategory.NEGATIVE]: '😔',
  [EmotionCategory.NEUTRAL]: '😐'
};

/**
 * Get the color class for an emotion category
 * @param category The emotion category
 * @returns The corresponding color class
 */
export function getCategoryColorClass(category: string): string {
  return DEFAULT_CATEGORY_CLASSES[category as EmotionCategory] || 'bg-gray-500';
}

/**
 * Get the emoji for an emotion category
 * @param category The emotion category
 * @returns The corresponding emoji
 */
export function getCategoryEmoji(category: string): string {
  return DEFAULT_CATEGORY_EMOJIS[category as EmotionCategory] || '❓';
}

/**
 * Get the color for an emotion category
 * @param category The emotion category
 * @returns The corresponding color
 */
export function getCategoryColor(category: string): string {
  const normalizedCategory = category.toLowerCase();
  return DEFAULT_CATEGORY_COLORS[normalizedCategory as keyof typeof DEFAULT_CATEGORY_COLORS] || '#6b7280'; // gray-500
}

/**
 * Interface for category distribution data
 */
export interface CategoryDistribution {
  name: string;
  value: number;
  percentage?: number;
}

/**
 * Interface for emotion categories analysis
 */
export interface EmotionCategoriesAnalysis {
  categoriesDistribution: CategoryDistribution[];
  dominantCategory: string | null;
  totalCount: number;
}

/**
 * Interface for category color configuration
 */
export interface CategoryColorConfig {
  [key: string]: string;
}