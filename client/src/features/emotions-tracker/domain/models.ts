// Domain Models for Emotions Tracker
// Following DDD principles, these are the core business entities

export type DateString = string; // Format: YYYY-MM-DD

// Value Objects
export interface EmotionIntensityVO {
  value: number;  // 0-10 scale
  notes?: string;
}

export interface FeelingCategoryVO {
  id: string;
  name: string;
  color: string;
}

// Aggregate Roots
export interface EmotionTrackingEntry {
  id?: number;
  userId: number;
  date: DateString;
  emotionId: string;
  emotionName: string;
  categoryId: string;
  intensity: number;
  notes?: string;
  triggers?: string[];
  copingMechanisms?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Domain Events
export class EmotionTrackedEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string;

  constructor(
    public readonly userId: number,
    public readonly emotionId: string,
    public readonly intensity: number,
    public readonly date: DateString
  ) {
    this.occurredOn = new Date();
    this.eventName = 'EmotionTrackedEvent';
  }
}

export class HighIntensityEmotionTrackedEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string;

  constructor(
    public readonly userId: number,
    public readonly emotionId: string,
    public readonly emotionName: string,
    public readonly intensity: number,
    public readonly date: DateString
  ) {
    this.occurredOn = new Date();
    this.eventName = 'HighIntensityEmotionTrackedEvent';
  }
}

// Enums
export enum EmotionCategory {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral'
}

// DTOs (Data Transfer Objects)
export interface EmotionDTO {
  id: string;
  name: string;
  category: EmotionCategory;
  description?: string;
  color?: string;
}

export interface EmotionTrackingEntryDTO {
  id?: number;
  userId: number;
  date: DateString;
  emotion: EmotionDTO;
  intensity: number;
  notes?: string;
  triggers?: string[];
  copingMechanisms?: string[];
}

export interface EmotionSummaryDTO {
  date: DateString;
  averageIntensity: number;
  dominantEmotion: string;
  emotionCounts: Record<string, number>;
  highestIntensity: {
    emotion: string;
    value: number;
  };
}

export interface EmotionTrendDTO {
  emotion: string;
  category: EmotionCategory;
  dataPoints: Array<{
    date: DateString;
    intensity: number;
  }>;
  averageIntensity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Factory interfaces
export interface EmotionTrackingEntryFactory {
  create(
    userId: number,
    date: DateString,
    emotionId: string,
    emotionName: string,
    categoryId: string,
    intensity: number,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[]
  ): EmotionTrackingEntry;
}

// Predefined emotions
export const predefinedEmotions: EmotionDTO[] = [
  // Positive emotions
  { id: 'joy', name: 'Joy', category: EmotionCategory.POSITIVE, color: '#4ade80' },
  { id: 'gratitude', name: 'Gratitude', category: EmotionCategory.POSITIVE, color: '#22c55e' },
  { id: 'serenity', name: 'Serenity', category: EmotionCategory.POSITIVE, color: '#34d399' },
  { id: 'interest', name: 'Interest', category: EmotionCategory.POSITIVE, color: '#2dd4bf' },
  { id: 'hope', name: 'Hope', category: EmotionCategory.POSITIVE, color: '#06b6d4' },
  { id: 'pride', name: 'Pride', category: EmotionCategory.POSITIVE, color: '#0ea5e9' },
  { id: 'amusement', name: 'Amusement', category: EmotionCategory.POSITIVE, color: '#38bdf8' },
  { id: 'inspiration', name: 'Inspiration', category: EmotionCategory.POSITIVE, color: '#60a5fa' },
  { id: 'awe', name: 'Awe', category: EmotionCategory.POSITIVE, color: '#818cf8' },
  { id: 'love', name: 'Love', category: EmotionCategory.POSITIVE, color: '#a78bfa' },
  
  // Negative emotions
  { id: 'anger', name: 'Anger', category: EmotionCategory.NEGATIVE, color: '#ef4444' },
  { id: 'sadness', name: 'Sadness', category: EmotionCategory.NEGATIVE, color: '#3b82f6' },
  { id: 'fear', name: 'Fear', category: EmotionCategory.NEGATIVE, color: '#8b5cf6' },
  { id: 'disgust', name: 'Disgust', category: EmotionCategory.NEGATIVE, color: '#10b981' },
  { id: 'shame', name: 'Shame', category: EmotionCategory.NEGATIVE, color: '#6366f1' },
  { id: 'guilt', name: 'Guilt', category: EmotionCategory.NEGATIVE, color: '#8b5cf6' },
  { id: 'envy', name: 'Envy', category: EmotionCategory.NEGATIVE, color: '#22c55e' },
  { id: 'jealousy', name: 'Jealousy', category: EmotionCategory.NEGATIVE, color: '#a855f7' },
  { id: 'anxiety', name: 'Anxiety', category: EmotionCategory.NEGATIVE, color: '#d946ef' },
  { id: 'frustration', name: 'Frustration', category: EmotionCategory.NEGATIVE, color: '#ec4899' },
  
  // Neutral emotions
  { id: 'surprise', name: 'Surprise', category: EmotionCategory.NEUTRAL, color: '#f59e0b' },
  { id: 'confusion', name: 'Confusion', category: EmotionCategory.NEUTRAL, color: '#d97706' },
  { id: 'boredom', name: 'Boredom', category: EmotionCategory.NEUTRAL, color: '#78716c' },
  { id: 'nostalgia', name: 'Nostalgia', category: EmotionCategory.NEUTRAL, color: '#f97316' },
  { id: 'contemplation', name: 'Contemplation', category: EmotionCategory.NEUTRAL, color: '#6b7280' }
];