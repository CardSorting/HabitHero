/**
 * Service Factory for creating fully configured service instances
 * This implements the Factory pattern to hide complex object creation
 */

import { WellnessChallengeService } from '../application/WellnessChallengeService';
import { WellnessChallengeCommandHandlers } from '../application/commandHandlers';
import { WellnessChallengeQueryHandlers } from '../application/queryHandlers';

import {
  ApiWellnessChallengeRepository,
  ApiChallengeGoalRepository,
  ApiChallengeProgressRepository,
  ApiEmotionCategoryRepository,
  ApiEmotionRepository,
  ApiUserEmotionRepository
} from './ApiRepository';

/**
 * Creates a fully configured instance of the WellnessChallengeService
 * Encapsulates all the dependency creation and wiring
 */
export function createWellnessChallengeService(userId: number): WellnessChallengeService {
  // Create repositories
  const challengeRepository = new ApiWellnessChallengeRepository();
  const goalRepository = new ApiChallengeGoalRepository();
  const progressRepository = new ApiChallengeProgressRepository();
  const emotionCategoryRepository = new ApiEmotionCategoryRepository();
  const emotionRepository = new ApiEmotionRepository();
  const userEmotionRepository = new ApiUserEmotionRepository();
  
  // Create command and query handlers
  const commandHandlers = new WellnessChallengeCommandHandlers(
    challengeRepository,
    goalRepository,
    progressRepository,
    userEmotionRepository
  );
  
  const queryHandlers = new WellnessChallengeQueryHandlers(
    challengeRepository,
    goalRepository,
    progressRepository,
    emotionCategoryRepository,
    emotionRepository,
    userEmotionRepository
  );
  
  // Create and return the service
  return new WellnessChallengeService(commandHandlers, queryHandlers, userId);
}