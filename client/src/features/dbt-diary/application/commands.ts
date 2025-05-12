// Command handlers for the diary card (write operations)
// Following CQRS pattern, commands handle state changes

import { 
  DateString, 
  SleepData, 
  EmotionEntry, 
  UrgeEntry, 
  SkillEntry, 
  EventEntry,
  SleepEntry
} from '../domain/models';
import { IDiaryRepository } from '../domain/repositories';

// Command classes
export class SaveSleepDataCommand {
  constructor(
    public readonly date: DateString,
    public readonly userId: number,
    public readonly sleepData: SleepData
  ) {}
}

export class SaveEmotionCommand {
  constructor(
    public readonly date: DateString,
    public readonly userId: number,
    public readonly emotion: string,
    public readonly intensity: string
  ) {}
}

export class SaveUrgeCommand {
  constructor(
    public readonly date: DateString,
    public readonly userId: number,
    public readonly urgeType: string,
    public readonly level: string,
    public readonly action: string
  ) {}
}

export class SaveSkillCommand {
  constructor(
    public readonly date: DateString,
    public readonly userId: number,
    public readonly category: string,
    public readonly skill: string,
    public readonly used: boolean
  ) {}
}

export class SaveEventCommand {
  constructor(
    public readonly date: DateString,
    public readonly userId: number,
    public readonly eventDescription: string
  ) {}
}

// Command Handlers
export class DiaryCommandHandlers {
  constructor(private repository: IDiaryRepository) {}
  
  async handleSaveSleepData(command: SaveSleepDataCommand): Promise<SleepData> {
    const entry: SleepEntry = {
      date: command.date,
      userId: command.userId,
      sleepData: command.sleepData
    };
    
    return await this.repository.saveSleepData(entry);
  }
  
  async handleSaveEmotion(command: SaveEmotionCommand): Promise<EmotionEntry> {
    const entry: EmotionEntry = {
      date: command.date,
      userId: command.userId,
      emotion: command.emotion,
      intensity: command.intensity
    };
    
    return await this.repository.saveEmotion(entry);
  }
  
  async handleSaveUrge(command: SaveUrgeCommand): Promise<UrgeEntry> {
    const entry: UrgeEntry = {
      date: command.date,
      userId: command.userId,
      urgeType: command.urgeType,
      level: command.level,
      action: command.action
    };
    
    return await this.repository.saveUrge(entry);
  }
  
  async handleSaveSkill(command: SaveSkillCommand): Promise<SkillEntry> {
    const entry: SkillEntry = {
      date: command.date,
      userId: command.userId,
      category: command.category,
      skill: command.skill,
      used: command.used
    };
    
    return await this.repository.saveSkill(entry);
  }
  
  async handleSaveEvent(command: SaveEventCommand): Promise<EventEntry> {
    const entry: EventEntry = {
      date: command.date,
      userId: command.userId,
      eventDescription: command.eventDescription
    };
    
    return await this.repository.saveEvent(entry);
  }
}