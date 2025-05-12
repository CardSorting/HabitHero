/**
 * Query to get active challenges for a user
 * Following CQRS pattern
 */

import { UserId } from "../../domain/models";
import { Query } from "@/shared/application/shared/Query";

export class GetActiveChallengesQuery implements Query {
  constructor(
    public readonly userId: UserId
  ) {}
}