// Command handlers for the emotions tracker (write operations)
// Following CQRS pattern, commands handle state changes

import { 
  DateString, 
  EmotionTrackingEntry,
  EmotionTrackedEvent,
  HighIntensityEmotionTrackedEvent
} from '../domain/models';
import { IEmotionsRepository } from '../domain/repositories';
import { DefaultEmotionTrackingEntryFactory } from '../domain/factories';

// Command classes
export class TrackEmotionCommand {
  constructor(
    public readonly userId: number,
    public readonly date: DateString,
    public readonly emotionId: string,
    public readonly emotionName: string,
    public readonly categoryId: string,
    public readonly intensity: number,
    public readonly notes?: string,
    public readonly triggers?: string[],
    public readonly copingMechanisms?: string[]
  ) {}
}

export class UpdateEmotionEntryCommand {
  constructor(
    public readonly id: number,
    public readonly intensity?: number,
    public readonly notes?: string,
    public readonly triggers?: string[],
    public readonly copingMechanisms?: string[]
  ) {}
}

export class DeleteEmotionEntryCommand {
  constructor(
    public readonly id: number
  ) {}
}

// Command handlers
export class EmotionCommandHandlers {
  private repository: IEmotionsRepository;
  private factory: DefaultEmotionTrackingEntryFactory;
  
  constructor(repository: IEmotionsRepository) {
    this.repository = repository;
    this.factory = new DefaultEmotionTrackingEntryFactory();
  }
  
  // Track a new emotion
  async handleTrackEmotion(command: TrackEmotionCommand): Promise<{ entry: EmotionTrackingEntry, events: any[] }> {
    // Create new emotion tracking entry using the factory
    const entry = this.factory.create(
      command.userId,
      command.date,
      command.emotionId,
      command.emotionName,
      command.categoryId,
      command.intensity,
      command.notes,
      command.triggers,
      command.copingMechanisms
    );
    
    // Save to repository
    const savedEntry = await this.repository.saveEmotionEntry(entry);
    
    // Generate domain events
    const events: any[] = [];
    
    // Always emit the base event
    const trackedEvent = this.factory.createTrackedEvent(savedEntry);
    events.push(trackedEvent);
    
    // Conditionally emit high intensity event
    const highIntensityEvent = this.factory.createHighIntensityEvent(savedEntry);
    if (highIntensityEvent) {
      events.push(highIntensityEvent);
    }
    
    return { entry: savedEntry, events };
  }
  
  // Update an existing emotion entry
  async handleUpdateEmotionEntry(command: UpdateEmotionEntryCommand): Promise<{ entry: EmotionTrackingEntry, events: any[] }> {
    // Get the existing entry
    const existingEntry = await this.repository.getEmotionEntry(command.id);
    if (!existingEntry) {
      throw new Error(`Emotion entry with id ${command.id} not found`);
    }
    
    // Update the entry with new values
    const updatedEntry: EmotionTrackingEntry = {
      ...existingEntry,
      intensity: command.intensity !== undefined ? command.intensity : existingEntry.intensity,
      notes: command.notes !== undefined ? command.notes : existingEntry.notes,
      triggers: command.triggers !== undefined ? command.triggers : existingEntry.triggers,
      copingMechanisms: command.copingMechanisms !== undefined ? command.copingMechanisms : existingEntry.copingMechanisms,
      updatedAt: new Date()
    };
    
    // Save to repository
    const savedEntry = await this.repository.saveEmotionEntry(updatedEntry);
    
    // Generate events
    const events: any[] = [];
    
    // Only emit high intensity event if intensity was updated and is high
    if (command.intensity !== undefined && command.intensity >= 8) {
      const highIntensityEvent = this.factory.createHighIntensityEvent(savedEntry);
      if (highIntensityEvent) {
        events.push(highIntensityEvent);
      }
    }
    
    return { entry: savedEntry, events };
  }
  
  // Delete an emotion entry
  async handleDeleteEmotionEntry(command: DeleteEmotionEntryCommand): Promise<boolean> {
    return await this.repository.deleteEmotionEntry(command.id);
  }
}