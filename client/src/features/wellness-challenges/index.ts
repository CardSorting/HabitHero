/**
 * Wellness Challenge Feature Module
 * Main export file for the wellness challenge feature
 */

// Domain Exports
export * from './domain/models';
export * from './domain/services';
export * from './domain/repositories';

// Application Exports
export * from './application/commands';
export * from './application/queries';
export * from './application/WellnessChallengeService';

// Presentation Exports (Components)
export { WellnessChallengeProvider } from './presentation/components/WellnessChallengeProvider';
export { WellnessChallengesList } from './presentation/components/WellnessChallengesList';
export { CreateChallengeForm } from './presentation/components/CreateChallengeForm';
export { ChallengeProgressTracker } from './presentation/components/ChallengeProgressTracker';

// Presentation Exports (Pages)
export { ChallengesListPage } from './presentation/pages/ChallengesListPage';
export { ChallengeDetailsPage } from './presentation/pages/ChallengeDetailsPage';

// Context Hooks
export {
  useWellnessChallenge,
  useWellnessChallengeOperation
} from './presentation/context/WellnessChallengeContext';