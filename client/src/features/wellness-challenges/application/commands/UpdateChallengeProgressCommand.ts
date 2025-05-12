/**
 * Command to update a wellness challenge progress
 * Following CQRS pattern
 */

import { ChallengeId, UserId } from "../../domain/models";
import { Command } from "@/shared/application/shared/Command";

export class UpdateChallengeProgressCommand implements Command {
  constructor(
    public readonly challengeId: ChallengeId,
    public readonly userId: UserId,
    public readonly progress: number,
    public readonly date: Date = new Date()
  ) {}
}