// Query handlers for the diary card (read operations)
// Following CQRS pattern, queries handle data retrieval

import { 
  DateString, 
  SleepData, 
  EmotionEntry, 
  // UrgeEntry removed
  SkillEntry, 
  EventEntry,
  DiaryCardData
} from '../domain/models';
import { IDiaryRepository } from '../domain/repositories';

// Query classes
export class GetSleepDataQuery {
  constructor(public readonly date: DateString) {}
}

export class GetEmotionsQuery {
  constructor(public readonly date: DateString) {}
}

// GetUrgesQuery removed

export class GetSkillsQuery {
  constructor(public readonly date: DateString) {}
}

export class GetEventQuery {
  constructor(public readonly date: DateString) {}
}

export class GetWeekDataQuery {
  constructor(public readonly dates: DateString[]) {}
}

// Query Handlers
export class DiaryQueryHandlers {
  constructor(private repository: IDiaryRepository) {}
  
  async handleGetSleepData(query: GetSleepDataQuery): Promise<SleepData | null> {
    return await this.repository.getSleepData(query.date);
  }
  
  async handleGetEmotions(query: GetEmotionsQuery): Promise<EmotionEntry[]> {
    return await this.repository.getEmotions(query.date);
  }
  
  // handleGetUrges removed
  
  async handleGetSkills(query: GetSkillsQuery): Promise<SkillEntry[]> {
    return await this.repository.getSkills(query.date);
  }
  
  async handleGetEvent(query: GetEventQuery): Promise<EventEntry | null> {
    return await this.repository.getEvent(query.date);
  }
  
  // Aggregate multiple queries to build a complete diary card for a week
  async handleGetWeekData(query: GetWeekDataQuery): Promise<DiaryCardData> {
    const result: DiaryCardData = {
      sleep: {},
      medication: {},
      emotions: {},
      urges: {},
      events: {},
      skills: {
        mindfulness: {},
        distressTolerance: {},
        emotionRegulation: {},
        interpersonalEffectiveness: {}
      }
    };
    
    // Process each date in parallel
    await Promise.all(query.dates.map(async (date) => {
      // Get sleep data
      const sleepData = await this.repository.getSleepData(date);
      if (sleepData) {
        result.sleep[date] = sleepData;
      }
      
      // Get emotions
      const emotions = await this.repository.getEmotions(date);
      if (emotions.length > 0) {
        result.emotions[date] = {};
        emotions.forEach(emotion => {
          result.emotions[date][emotion.emotion] = emotion.intensity;
        });
      }
      
      // Urges processing removed
      
      // Get skills
      const skills = await this.repository.getSkills(date);
      if (skills.length > 0) {
        skills.forEach(skill => {
          if (!result.skills[skill.category]) {
            result.skills[skill.category] = {};
          }
          if (!result.skills[skill.category][skill.skill]) {
            result.skills[skill.category][skill.skill] = {};
          }
          result.skills[skill.category][skill.skill][date] = skill.used;
        });
      }
      
      // Get event
      const event = await this.repository.getEvent(date);
      if (event) {
        result.events[date] = event.eventDescription;
      }
    }));
    
    return result;
  }
}