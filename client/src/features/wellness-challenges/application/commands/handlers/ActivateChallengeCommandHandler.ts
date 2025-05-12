/**
 * Handler for activating a wellness challenge
 * Following CQRS pattern
 */

import { CommandHandler } from "@/shared/application/shared/CommandHandler";
import { ActivateChallengeCommand } from "../ActivateChallengeCommand";
import { WellnessChallenge } from "../../../domain/models";
import { WellnessChallengeRepository } from "../../../domain/repositories";
import { EventBus } from "@/shared/application/shared/EventBus";
import { ChallengeActivatedEvent } from "../../../domain/events/ChallengeActivatedEvent";

export class ActivateChallengeCommandHandler implements CommandHandler<ActivateChallengeCommand, WellnessChallenge> {
  constructor(
    private readonly repository: WellnessChallengeRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ActivateChallengeCommand): Promise<WellnessChallenge> {
    const { challengeId, userId } = command;
    
    // Business logic: Activate the challenge in the repository
    const challenge = await this.repository.activateChallenge(challengeId, userId);
    
    // Publish domain event for other parts of the system to react
    this.eventBus.publish(new ChallengeActivatedEvent(challengeId, userId));
    
    return challenge;
  }
}