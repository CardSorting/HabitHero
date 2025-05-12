/**
 * Domain event triggered when a challenge is activated
 */
import { DomainEvent } from "@/shared/domain/shared/DomainEvent";
import { ChallengeId, UserId } from "../models";
import { v4 as uuidv4 } from "uuid";

export class ChallengeActivatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly challengeId: ChallengeId,
    public readonly userId: UserId
  ) {
    this.eventId = uuidv4();
    this.occurredOn = new Date();
  }
}