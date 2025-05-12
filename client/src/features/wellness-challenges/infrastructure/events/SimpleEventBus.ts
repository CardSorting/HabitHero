/**
 * Simple implementation of the Event Bus pattern
 * Used for communication between components without direct dependencies
 */

import { EventBus } from "@/shared/application/shared/EventBus";
import { DomainEvent } from "@/shared/domain/shared/DomainEvent";

export class SimpleEventBus implements EventBus {
  private subscribers: Map<string, Array<(event: DomainEvent) => void>> = new Map();

  /**
   * Publish an event to all subscribers
   */
  publish(event: DomainEvent): void {
    const eventName = event.constructor.name;
    const eventSubscribers = this.subscribers.get(eventName) || [];
    
    eventSubscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error handling event ${eventName}:`, error);
      }
    });
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    callback: (event: T) => void
  ): void {
    const eventName = eventType.name;
    
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, []);
    }
    
    this.subscribers.get(eventName)!.push(callback as (event: DomainEvent) => void);
  }

  /**
   * Unsubscribe from a specific event type
   */
  unsubscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    callback: (event: T) => void
  ): void {
    const eventName = eventType.name;
    const callbacks = this.subscribers.get(eventName);
    
    if (!callbacks) {
      return;
    }
    
    const index = callbacks.indexOf(callback as (event: DomainEvent) => void);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
}