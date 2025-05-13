import { format } from 'date-fns';
import { 
  IEmotionEntriesRepository 
} from '../domain/repositories';
import { EmotionEntry, EmotionDate } from '../domain/models';

/**
 * Command to track an emotion
 */
export class TrackEmotionCommand {
  constructor(
    public readonly userId: number,
    public readonly emotionId: string,
    public readonly emotionName: string,
    public readonly intensity: number,
    public readonly date: string,
    public readonly notes?: string,
    public readonly triggers?: string[],
    public readonly copingMechanisms?: string[],
    public readonly categoryId?: string,
    public readonly time?: string
  ) {}
}

/**
 * TrackEmotionCommandHandler
 * Handles the TrackEmotionCommand
 */
export class TrackEmotionCommandHandler {
  constructor(private entriesRepository: IEmotionEntriesRepository) {}
  
  /**
   * Execute the command to track an emotion
   * @param command TrackEmotionCommand instance
   */
  async execute(command: TrackEmotionCommand): Promise<EmotionEntry> {
    const dateString = typeof command.date === 'string' 
      ? command.date 
      : format(command.date, 'yyyy-MM-dd');
    
    return this.entriesRepository.createEntry({
      userId: command.userId,
      emotionId: command.emotionId,
      emotionName: command.emotionName,
      intensity: command.intensity,
      date: dateString,
      notes: command.notes,
      triggers: command.triggers,
      copingMechanisms: command.copingMechanisms,
      categoryId: command.categoryId || 'unknown',
      time: command.time
    });
  }
}

/**
 * Command to update an emotion entry
 */
export class UpdateEmotionEntryCommand {
  constructor(
    public readonly id: string,
    public readonly userId: number,
    public readonly updates: {
      intensity?: number;
      notes?: string;
      triggers?: string[];
      copingMechanisms?: string[];
    }
  ) {}
}

/**
 * UpdateEmotionEntryCommandHandler
 * Handles the UpdateEmotionEntryCommand
 */
export class UpdateEmotionEntryCommandHandler {
  constructor(private entriesRepository: IEmotionEntriesRepository) {}
  
  /**
   * Execute the command to update an emotion entry
   * @param command UpdateEmotionEntryCommand instance
   */
  async execute(command: UpdateEmotionEntryCommand): Promise<EmotionEntry> {
    return this.entriesRepository.updateEntry(command.id, command.updates);
  }
}

/**
 * Command to delete an emotion entry
 */
export class DeleteEmotionEntryCommand {
  constructor(
    public readonly id: string,
    public readonly userId: number
  ) {}
}

/**
 * DeleteEmotionEntryCommandHandler
 * Handles the DeleteEmotionEntryCommand
 */
export class DeleteEmotionEntryCommandHandler {
  constructor(private entriesRepository: IEmotionEntriesRepository) {}
  
  /**
   * Execute the command to delete an emotion entry
   * @param command DeleteEmotionEntryCommand instance
   */
  async execute(command: DeleteEmotionEntryCommand): Promise<boolean> {
    return this.entriesRepository.deleteEntry(command.id);
  }
}