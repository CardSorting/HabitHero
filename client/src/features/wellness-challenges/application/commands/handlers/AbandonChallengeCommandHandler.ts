/**
 * Handler for abandoning a wellness challenge
 * Following CQRS pattern
 */

import { CommandHandler } from "@/shared/application/shared/CommandHandler";
import { AbandonChallengeCommand } from "../AbandonChallengeCommand";
import { WellnessChallenge } from "../../../domain/models";
import { WellnessChallengeRepository } from "../../../domain/repositories";
import { EventBus } from "@/shared/application/shared/EventBus";
import { ChallengeAbandonedEvent } from "../../../domain/events/ChallengeAbandonedEvent";

export class AbandonChallengeCommandHandler implements CommandHandler<AbandonChallengeCommand, WellnessChallenge> {
  constructor(
    private readonly repository: WellnessChallengeRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: AbandonChallengeCommand): Promise<WellnessChallenge> {
    const { challengeId, userId } = command;
    
    // Business logic: Abandon the challenge in the repository
    const challenge = await this.repository.abandonChallenge(challengeId, userId);
    
    // Publish domain event for other parts of the system to react
    this.eventBus.publish(new ChallengeAbandonedEvent(challengeId, userId));
    
    return challenge;
  }
}