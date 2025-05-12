/**
 * Factory for creating services used in the UI
 * Helps with dependency injection and managing service instantiation
 */
import { ApiWellnessChallengeRepository } from '../../infrastructure/ApiWellnessChallengeRepository';
import { WellnessChallengeService } from '../../application/WellnessChallengeService';

// Singleton instances
let wellnessChallengeRepository: ApiWellnessChallengeRepository | null = null;
let wellnessChallengeService: WellnessChallengeService | null = null;

/**
 * Get a singleton instance of the WellnessChallengeService
 * Creates and caches the repository and service on first call
 */
export function getWellnessChallengeService(): WellnessChallengeService {
  if (!wellnessChallengeService) {
    wellnessChallengeRepository = new ApiWellnessChallengeRepository();
    wellnessChallengeService = new WellnessChallengeService(wellnessChallengeRepository);
  }
  
  return wellnessChallengeService;
}