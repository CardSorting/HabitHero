/**
 * Query to get challenges by category
 * Following CQRS pattern
 */

import { ChallengeCategory } from "../../domain/models";
import { Query } from "@/shared/application/shared/Query";

export class GetChallengesByCategoryQuery implements Query {
  constructor(
    public readonly category: ChallengeCategory,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}