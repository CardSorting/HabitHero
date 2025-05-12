import { EventBus } from "../../../shared/application/shared/EventBus";
import { DomainEvent } from "../../../shared/domain/shared/DomainEvent";

/**
 * A simple in-memory event bus implementation
 */
export class SimpleEventBus implements EventBus {
  private subscribers: Map<string, Array<(event: DomainEvent) => Promise<void>>>;
  
  constructor() {
    this.subscribers = new Map();
  }
  
  /**
   * Subscribe to a specific event type
   */
  subscribe(
    eventName: string,
    callback: (event: DomainEvent) => Promise<void>
  ): void {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, []);
    }
    
    this.subscribers.get(eventName)!.push(callback);
  }
  
  /**
   * Publish an event to all subscribers
   */
  async publish(event: DomainEvent): Promise<void> {
    const eventSubscribers = this.subscribers.get(event.eventName) || [];
    
    // Execute all subscribers in parallel
    await Promise.all(
      eventSubscribers.map(subscriber => subscriber(event))
    );
    
    // Also execute any subscribers to all events (*)
    const globalSubscribers = this.subscribers.get('*') || [];
    await Promise.all(
      globalSubscribers.map(subscriber => subscriber(event))
    );
  }
}