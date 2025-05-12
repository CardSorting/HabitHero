/**
 * Command to activate a wellness challenge for a user
 * Following CQRS pattern
 */

import { ChallengeId, UserId } from "../../domain/models";
import { Command } from "@/shared/application/shared/Command";

export class ActivateChallengeCommand implements Command {
  constructor(
    public readonly challengeId: ChallengeId,
    public readonly userId: UserId
  ) {}
}