/**
 * Base interface for all domain events
 */
export interface DomainEvent {
  eventId: string;
  occurredOn: Date;
}