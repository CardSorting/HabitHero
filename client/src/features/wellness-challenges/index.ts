// Re-export all the components and functionality from the wellness challenges feature

// Domain Models
export * from './domain/models';

// Application Layer
export * from './application/commands';
export * from './application/queries';
export * from './application/commandHandlers';
export * from './application/queryHandlers';

// Infrastructure
export * from './infrastructure/ApiRepository';

// Presentation
export * from './presentation/components';
// Commented out until implementation is ready
// export * from './presentation/context/WellnessChallengeContext';
// export * from './presentation/pages/ChallengeDetailsPage';
// export * from './presentation/pages/ChallengesListPage';

// Service Factory
// Commented out until implementation is ready
// export * from './presentation/services/serviceFactory';