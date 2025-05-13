/**
 * Entry point for the Emotions Tracker feature
 * This file exports all the public components, services and types
 * needed to use the feature in the application
 */

// Domain exports
export { EmotionCategory } from './domain/emotion-categories-analysis';
export type { 
  Emotion, 
  EmotionEntry, 
  EmotionSummary, 
  EmotionTrend 
} from './domain/models';

// Application exports
export { EmotionsService } from './application/EmotionsService';

// Interface exports
export { 
  IEmotionsRepository, 
  IEmotionEntriesRepository 
} from './domain/repositories';

// Presentation exports
export { EmotionsTrackerContainer } from './presentation/components/EmotionsTrackerContainer';
export { useEmotions, EmotionsProvider } from './presentation/context/EmotionsContext';

// Infrastructure exports
export { ApiEmotionsRepository } from './infrastructure/ApiEmotionsRepository';