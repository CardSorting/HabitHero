// DiaryService - Application Service
// Acts as a facade over commands and queries for the UI layer

import { 
  DiaryCardData, 
  DateString, 
  SleepData,
  EmotionEntry,
  UrgeEntry,
  SkillEntry,
  EventEntry
} from '../domain/models';
import { IDiaryRepository } from '../domain/repositories';
import { 
  DiaryCommandHandlers, 
  SaveSleepDataCommand, 
  SaveEmotionCommand, 
  SaveUrgeCommand, 
  SaveSkillCommand, 
  SaveEventCommand 
} from './commands';
import { 
  DiaryQueryHandlers, 
  GetWeekDataQuery, 
  GetSleepDataQuery,
  GetEmotionsQuery,
  GetUrgesQuery,
  GetSkillsQuery,
  GetEventQuery
} from './queries';

export class DiaryService {
  private commandHandlers: DiaryCommandHandlers;
  private queryHandlers: DiaryQueryHandlers;
  private userId: number;
  
  constructor(repository: IDiaryRepository, userId: number) {
    this.commandHandlers = new DiaryCommandHandlers(repository);
    this.queryHandlers = new DiaryQueryHandlers(repository);
    this.userId = userId;
  }
  
  // Command methods
  async saveSleepData(date: DateString, field: keyof SleepData, value: string, currentData?: SleepData): Promise<SleepData> {
    // If we have current data, use it as a base, otherwise create a new object
    const sleepData: SleepData = currentData || {
      hoursSlept: '',
      troubleFalling: '',
      troubleStaying: '',
      troubleWaking: ''
    };
    
    // Update the specific field
    sleepData[field] = value;
    
    const command = new SaveSleepDataCommand(date, this.userId, sleepData);
    return await this.commandHandlers.handleSaveSleepData(command);
  }
  
  async saveEmotion(date: DateString, emotion: string, intensity: string): Promise<EmotionEntry> {
    const command = new SaveEmotionCommand(date, this.userId, emotion, intensity);
    return await this.commandHandlers.handleSaveEmotion(command);
  }
  
  async saveUrge(date: DateString, urgeType: string, field: 'level' | 'action', value: string, currentLevel?: string, currentAction?: string): Promise<UrgeEntry> {
    // Set default values
    let level = currentLevel || '';
    let action = currentAction || '';
    
    // Update the field that changed
    if (field === 'level') {
      level = value;
    } else {
      action = value;
    }
    
    const command = new SaveUrgeCommand(date, this.userId, urgeType, level, action);
    return await this.commandHandlers.handleSaveUrge(command);
  }
  
  async saveSkill(date: DateString, category: string, skill: string, used: boolean): Promise<SkillEntry> {
    const command = new SaveSkillCommand(date, this.userId, category, skill, used);
    return await this.commandHandlers.handleSaveSkill(command);
  }
  
  async saveEvent(date: DateString, eventDescription: string): Promise<EventEntry> {
    const command = new SaveEventCommand(date, this.userId, eventDescription);
    return await this.commandHandlers.handleSaveEvent(command);
  }
  
  // Query methods
  async getSleepData(date: DateString): Promise<SleepData | null> {
    const query = new GetSleepDataQuery(date);
    return await this.queryHandlers.handleGetSleepData(query);
  }
  
  async getEmotions(date: DateString): Promise<EmotionEntry[]> {
    const query = new GetEmotionsQuery(date);
    return await this.queryHandlers.handleGetEmotions(query);
  }
  
  async getUrges(date: DateString): Promise<UrgeEntry[]> {
    const query = new GetUrgesQuery(date);
    return await this.queryHandlers.handleGetUrges(query);
  }
  
  async getSkills(date: DateString): Promise<SkillEntry[]> {
    const query = new GetSkillsQuery(date);
    return await this.queryHandlers.handleGetSkills(query);
  }
  
  async getEvent(date: DateString): Promise<EventEntry | null> {
    const query = new GetEventQuery(date);
    return await this.queryHandlers.handleGetEvent(query);
  }
  
  async getWeekData(dates: DateString[]): Promise<DiaryCardData> {
    const query = new GetWeekDataQuery(dates);
    return await this.queryHandlers.handleGetWeekData(query);
  }
}