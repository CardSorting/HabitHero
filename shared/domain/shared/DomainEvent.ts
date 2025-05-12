/**
 * Base class for all domain events
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string;

  constructor(eventName: string) {
    this.occurredOn = new Date();
    this.eventName = eventName;
  }
}