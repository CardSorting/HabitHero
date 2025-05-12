/**
 * Interface for the event bus implementation in the CQRS pattern
 */
import { DomainEvent } from "../../domain/shared/DomainEvent";

export interface EventBus {
  publish(event: DomainEvent): void;
  subscribe<T extends DomainEvent>(eventType: new (...args: any[]) => T, callback: (event: T) => void): void;
  unsubscribe<T extends DomainEvent>(eventType: new (...args: any[]) => T, callback: (event: T) => void): void;
}