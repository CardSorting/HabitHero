// Domain factories for creating properly formed domain objects
// Following DDD principles

import { 
  EmotionTrackingEntry, 
  EmotionTrackingEntryFactory,
  DateString,
  EmotionTrackedEvent,
  HighIntensityEmotionTrackedEvent
} from './models';

export class DefaultEmotionTrackingEntryFactory implements EmotionTrackingEntryFactory {
  create(
    userId: number,
    date: DateString,
    emotionId: string,
    emotionName: string,
    categoryId: string,
    intensity: number,
    notes?: string,
    triggers?: string[],
    copingMechanisms?: string[]
  ): EmotionTrackingEntry {
    // Validate inputs
    if (intensity < 0 || intensity > 10) {
      throw new Error('Intensity must be between 0 and 10');
    }
    
    if (!userId || !date || !emotionId || !emotionName || !categoryId) {
      throw new Error('Required fields missing for emotion tracking entry');
    }
    
    // Create a new entry with timestamps
    const entry: EmotionTrackingEntry = {
      userId,
      date,
      emotionId,
      emotionName,
      categoryId,
      intensity,
      notes,
      triggers,
      copingMechanisms,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return entry;
  }
  
  // Factory method to create domain events
  createTrackedEvent(entry: EmotionTrackingEntry): EmotionTrackedEvent {
    return new EmotionTrackedEvent(
      entry.userId,
      entry.emotionId,
      entry.intensity,
      entry.date
    );
  }
  
  createHighIntensityEvent(entry: EmotionTrackingEntry): HighIntensityEmotionTrackedEvent | null {
    // Only create high intensity event if intensity is >= 8
    if (entry.intensity >= 8) {
      return new HighIntensityEmotionTrackedEvent(
        entry.userId,
        entry.emotionId,
        entry.emotionName,
        entry.intensity,
        entry.date
      );
    }
    return null;
  }
}