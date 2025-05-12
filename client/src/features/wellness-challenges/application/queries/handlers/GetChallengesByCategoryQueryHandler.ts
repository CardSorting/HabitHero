/**
 * Handler for getting challenges by category
 * Following CQRS pattern
 */

import { QueryHandler } from "@/shared/application/shared/QueryHandler";
import { GetChallengesByCategoryQuery } from "../GetChallengesByCategoryQuery";
import { WellnessChallenge } from "../../../domain/models";
import { WellnessChallengeRepository } from "../../../domain/repositories";

export class GetChallengesByCategoryQueryHandler implements QueryHandler<GetChallengesByCategoryQuery, WellnessChallenge[]> {
  constructor(
    private readonly repository: WellnessChallengeRepository
  ) {}

  async execute(query: GetChallengesByCategoryQuery): Promise<WellnessChallenge[]> {
    const { category, page, limit } = query;
    
    // Get all challenges for the category
    const challenges = await this.repository.getAllByCategory(category);
    
    // Handle pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return challenges.slice(startIndex, endIndex);
  }
}