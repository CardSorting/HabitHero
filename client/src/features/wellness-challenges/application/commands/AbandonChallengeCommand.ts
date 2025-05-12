/**
 * Command to abandon a wellness challenge
 * Following CQRS pattern
 */

import { ChallengeId, UserId } from "../../domain/models";
import { Command } from "@/shared/application/shared/Command";

export class AbandonChallengeCommand implements Command {
  constructor(
    public readonly challengeId: ChallengeId,
    public readonly userId: UserId
  ) {}
}