/**
 * Context provider for wellness challenges
 * Follows Dependency Injection pattern for better testability and loose coupling
 */

import React, { createContext, useContext } from 'react';
import { 
  ChallengeCategory, 
  ChallengeId, 
  UserId, 
  WellnessChallenge 
} from '../../domain/models';
import { WellnessChallengeRepository, WellnessChallengeDataSource } from '../../domain/repositories';
import { ApiWellnessChallengeRepository } from '../../infrastructure/repositories/ApiWellnessChallengeRepository';
import { PreDefinedWellnessChallengeDataSource } from '../../infrastructure/data-sources/PreDefinedWellnessChallengeDataSource';
import { SimpleEventBus } from '../../infrastructure/events/SimpleEventBus';
import { EventBus } from '@/shared/application/shared/EventBus';
import { GetChallengesByCategoryQuery } from '../../application/queries/GetChallengesByCategoryQuery';
import { GetChallengesByCategoryQueryHandler } from '../../application/queries/handlers/GetChallengesByCategoryQueryHandler';
import { GetActiveChallengesQuery } from '../../application/queries/GetActiveChallengesQuery';
import { GetActiveChallengesQueryHandler } from '../../application/queries/handlers/GetActiveChallengesQueryHandler';
import { ActivateChallengeCommand } from '../../application/commands/ActivateChallengeCommand';
import { ActivateChallengeCommandHandler } from '../../application/commands/handlers/ActivateChallengeCommandHandler';
import { AbandonChallengeCommand } from '../../application/commands/AbandonChallengeCommand';
import { AbandonChallengeCommandHandler } from '../../application/commands/handlers/AbandonChallengeCommandHandler';

// Define the shape of our context
interface WellnessChallengeContextType {
  // Queries
  getChallengesByCategory: (category: ChallengeCategory, page?: number, limit?: number) => Promise<WellnessChallenge[]>;
  getActiveChallenges: (userId: UserId) => Promise<WellnessChallenge[]>;
  
  // Commands
  activateChallenge: (challengeId: ChallengeId, userId: UserId) => Promise<WellnessChallenge>;
  abandonChallenge: (challengeId: ChallengeId, userId: UserId) => Promise<WellnessChallenge>;
  
  // Available challenge categories
  availableCategories: ChallengeCategory[];
}

// Create the context with a default empty value
const WellnessChallengeContext = createContext<WellnessChallengeContextType | undefined>(undefined);

// Create a provider component
export const WellnessChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Instantiate our infrastructure components
  const eventBus: EventBus = React.useMemo(() => new SimpleEventBus(), []);
  const challengeRepository: WellnessChallengeRepository = React.useMemo(() => new ApiWellnessChallengeRepository(), []);
  const challengeDataSource: WellnessChallengeDataSource = React.useMemo(() => new PreDefinedWellnessChallengeDataSource(), []);
  
  // Create our query handlers
  const getChallengesByCategoryHandler = React.useMemo(() => 
    new GetChallengesByCategoryQueryHandler(challengeRepository), 
    [challengeRepository]
  );
  
  const getActiveChallengesHandler = React.useMemo(() => 
    new GetActiveChallengesQueryHandler(challengeRepository), 
    [challengeRepository]
  );
  
  // Create our command handlers
  const activateChallengeHandler = React.useMemo(() => 
    new ActivateChallengeCommandHandler(challengeRepository, eventBus), 
    [challengeRepository, eventBus]
  );
  
  const abandonChallengeHandler = React.useMemo(() => 
    new AbandonChallengeCommandHandler(challengeRepository, eventBus), 
    [challengeRepository, eventBus]
  );
  
  // Define our context value with the implemented functions
  const contextValue: WellnessChallengeContextType = {
    // Queries
    getChallengesByCategory: async (category, page = 1, limit = 10) => {
      const query = new GetChallengesByCategoryQuery(category, page, limit);
      return getChallengesByCategoryHandler.execute(query);
    },
    
    getActiveChallenges: async (userId) => {
      const query = new GetActiveChallengesQuery(userId);
      return getActiveChallengesHandler.execute(query);
    },
    
    // Commands
    activateChallenge: async (challengeId, userId) => {
      const command = new ActivateChallengeCommand(challengeId, userId);
      return activateChallengeHandler.execute(command);
    },
    
    abandonChallenge: async (challengeId, userId) => {
      const command = new AbandonChallengeCommand(challengeId, userId);
      return abandonChallengeHandler.execute(command);
    },
    
    // Available categories
    availableCategories: [
      ChallengeCategory.EMOTIONS,
      ChallengeCategory.MEDITATION,
      ChallengeCategory.JOURNALING,
      ChallengeCategory.ACTIVITY,
      ChallengeCategory.MINDFULNESS,
      ChallengeCategory.DISTRESS_TOLERANCE,
      ChallengeCategory.EMOTION_REGULATION,
      ChallengeCategory.INTERPERSONAL_EFFECTIVENESS
    ]
  };
  
  return (
    <WellnessChallengeContext.Provider value={contextValue}>
      {children}
    </WellnessChallengeContext.Provider>
  );
};

// Create a custom hook to use the context
export const useWellnessChallenge = (): WellnessChallengeContextType => {
  const context = useContext(WellnessChallengeContext);
  if (context === undefined) {
    throw new Error('useWellnessChallenge must be used within a WellnessChallengeProvider');
  }
  return context;
};