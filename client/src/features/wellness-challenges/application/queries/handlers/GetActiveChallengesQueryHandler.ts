/**
 * Handler for getting active challenges for a user
 * Following CQRS pattern
 */

import { QueryHandler } from "@/shared/application/shared/QueryHandler";
import { GetActiveChallengesQuery } from "../GetActiveChallengesQuery";
import { WellnessChallenge } from "../../../domain/models";
import { WellnessChallengeRepository } from "../../../domain/repositories";

export class GetActiveChallengesQueryHandler implements QueryHandler<GetActiveChallengesQuery, WellnessChallenge[]> {
  constructor(
    private readonly repository: WellnessChallengeRepository
  ) {}

  async execute(query: GetActiveChallengesQuery): Promise<WellnessChallenge[]> {
    const { userId } = query;
    
    // Get all active challenges for the user
    return await this.repository.getActiveChallenges(userId);
  }
}