import { DomainEvent } from "../../domain/shared/DomainEvent";

/**
 * Interface for an event bus that can publish domain events
 */
export interface EventBus {
  /**
   * Publish a domain event
   */
  publish(event: DomainEvent): Promise<void>;
}