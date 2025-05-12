// API implementation of the diary repository
// Infrastructure layer is responsible for external concerns like API calls

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

export class ApiDiaryRepository implements IDiaryRepository {
  private readonly baseUrl: string = '/api/dbt';
  private readonly userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  // Sleep data methods
  async getSleepData(date: DateString): Promise<SleepData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/sleep/${date}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      if (!data) return null;
      
      return {
        hoursSlept: data.hoursSlept || '',
        troubleFalling: data.troubleFalling || '',
        troubleStaying: data.troubleStaying || '',
        troubleWaking: data.troubleWaking || ''
      };
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      return null;
    }
  }

  async saveSleepData(entry: SleepEntry): Promise<SleepData> {
    try {
      const response = await fetch(`${this.baseUrl}/sleep/${entry.date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry.sleepData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save sleep data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving sleep data:', error);
      throw error;
    }
  }

  // Emotions methods
  async getEmotions(date: DateString): Promise<EmotionEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/emotions/${date}`);
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        return [];
      }
      
      return data.map((emotion: any) => ({
        date,
        userId: this.userId,
        emotion: emotion.emotion,
        intensity: emotion.intensity
      }));
    } catch (error) {
      console.error('Error fetching emotions data:', error);
      return [];
    }
  }

  async saveEmotion(entry: EmotionEntry): Promise<EmotionEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/emotions/${entry.date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emotion: entry.emotion,
          intensity: entry.intensity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save emotion data');
      }
      
      const data = await response.json();
      return {
        date: entry.date,
        userId: this.userId,
        emotion: data.emotion,
        intensity: data.intensity
      };
    } catch (error) {
      console.error('Error saving emotion data:', error);
      throw error;
    }
  }

  // Urges methods
  async getUrges(date: DateString): Promise<UrgeEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/urges/${date}`);
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        return [];
      }
      
      return data.map((urge: any) => ({
        date,
        userId: this.userId,
        urgeType: urge.urgeType,
        level: urge.level,
        action: urge.action || ''
      }));
    } catch (error) {
      console.error('Error fetching urges data:', error);
      return [];
    }
  }

  async saveUrge(entry: UrgeEntry): Promise<UrgeEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/urges/${entry.date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          urgeType: entry.urgeType,
          level: entry.level,
          action: entry.action
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save urge data');
      }
      
      const data = await response.json();
      return {
        date: entry.date,
        userId: this.userId,
        urgeType: data.urgeType,
        level: data.level,
        action: data.action || ''
      };
    } catch (error) {
      console.error('Error saving urge data:', error);
      throw error;
    }
  }

  // Skills methods
  async getSkills(date: DateString): Promise<SkillEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/skills/${date}`);
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        return [];
      }
      
      return data.map((skill: any) => ({
        date,
        userId: this.userId,
        category: skill.category,
        skill: skill.skill,
        used: skill.used
      }));
    } catch (error) {
      console.error('Error fetching skills data:', error);
      return [];
    }
  }

  async saveSkill(entry: SkillEntry): Promise<SkillEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/skills/${entry.date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: entry.category,
          skill: entry.skill,
          used: entry.used
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save skill data');
      }
      
      const data = await response.json();
      return {
        date: entry.date,
        userId: this.userId,
        category: data.category,
        skill: data.skill,
        used: data.used
      };
    } catch (error) {
      console.error('Error saving skill data:', error);
      throw error;
    }
  }

  // Events methods
  async getEvent(date: DateString): Promise<EventEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${date}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (!data) {
        return null;
      }
      
      return {
        date,
        userId: this.userId,
        eventDescription: data.eventDescription || ''
      };
    } catch (error) {
      console.error('Error fetching event data:', error);
      return null;
    }
  }

  async saveEvent(entry: EventEntry): Promise<EventEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${entry.date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventDescription: entry.eventDescription
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save event data');
      }
      
      const data = await response.json();
      return {
        date: entry.date,
        userId: this.userId,
        eventDescription: data.eventDescription || ''
      };
    } catch (error) {
      console.error('Error saving event data:', error);
      throw error;
    }
  }
}