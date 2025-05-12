/**
 * A simple event bus implementation for the wellness challenges feature
 */

import { EventBus } from "@/shared/application/shared/EventBus";
import { DomainEvent } from "@/shared/domain/shared/DomainEvent";

type EventCallback<T extends DomainEvent> = (event: T) => void;

export class SimpleEventBus implements EventBus {
  // Map to store event type constructors and their callbacks
  private eventCallbacks: Map<new (...args: any[]) => DomainEvent, EventCallback<any>[]> = new Map();

  /**
   * Publish an event to all subscribers
   */
  publish(event: DomainEvent): void {
    // Find the event type in our map
    const eventType = this.findEventType(event);
    if (!eventType) return;

    // Get all callbacks for this event type
    const callbacks = this.eventCallbacks.get(eventType) || [];

    // Execute each callback with the event
    callbacks.forEach(callback => callback(event));
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    callback: (event: T) => void
  ): void {
    // Get existing callbacks or create new array
    const callbacks = this.eventCallbacks.get(eventType) || [];

    // Add the callback if it's not already there
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }

    // Update the map
    this.eventCallbacks.set(eventType, callbacks);
  }

  /**
   * Unsubscribe from a specific event type
   */
  unsubscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    callback: (event: T) => void
  ): void {
    // Get existing callbacks
    const callbacks = this.eventCallbacks.get(eventType) || [];

    // Remove the callback
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    // Update the map
    if (callbacks.length === 0) {
      this.eventCallbacks.delete(eventType);
    } else {
      this.eventCallbacks.set(eventType, callbacks);
    }
  }

  /**
   * Helper method to find the event type constructor for a given event instance
   */
  private findEventType(event: DomainEvent): (new (...args: any[]) => DomainEvent) | undefined {
    for (const eventType of this.eventCallbacks.keys()) {
      if (event instanceof eventType) {
        return eventType;
      }
    }
    return undefined;
  }
}