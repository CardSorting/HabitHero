// Main barrel file for the Emotions Tracker feature
// Makes it easy to import components from the feature

// Re-export domain models
export * from './domain/models';

// Re-export application services
export { EmotionsService } from './application/EmotionsService';

// Re-export context
export { EmotionsProvider, useEmotions } from './presentation/context/EmotionsContext';

// Re-export main component
export { default as EmotionsTrackerContainer } from './presentation/components/EmotionsTrackerContainer';