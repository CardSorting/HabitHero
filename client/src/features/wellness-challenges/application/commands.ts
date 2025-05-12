/**
 * Command objects for the Wellness Challenge system following CQRS pattern
 * Commands represent operations that change state
 */

import { 
  ChallengeFrequency, 
  ChallengeStatus, 
  ChallengeType, 
  DateString 
} from '../domain/models';

// Base Command interface
export interface Command {
  readonly type: string;
  readonly timestamp: string;
}

// Challenge Commands
export class CreateChallengeCommand implements Command {
  readonly type = 'CREATE_CHALLENGE';
  readonly timestamp: string;
  
  constructor(
    public readonly userId: number,
    public readonly title: string,
    public readonly description: string | undefined,
    public readonly challengeType: ChallengeType,
    public readonly frequency: ChallengeFrequency,
    public readonly startDate: DateString,
    public readonly endDate: DateString,
    public readonly targetValue: number,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class UpdateChallengeCommand implements Command {
  readonly type = 'UPDATE_CHALLENGE';
  readonly timestamp: string;
  
  constructor(
    public readonly id: number,
    public readonly title?: string,
    public readonly description?: string,
    public readonly challengeType?: ChallengeType,
    public readonly frequency?: ChallengeFrequency,
    public readonly startDate?: DateString,
    public readonly endDate?: DateString,
    public readonly targetValue?: number,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class DeleteChallengeCommand implements Command {
  readonly type = 'DELETE_CHALLENGE';
  readonly timestamp: string;
  
  constructor(
    public readonly id: number,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class UpdateChallengeStatusCommand implements Command {
  readonly type = 'UPDATE_CHALLENGE_STATUS';
  readonly timestamp: string;
  
  constructor(
    public readonly id: number,
    public readonly status: ChallengeStatus,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

// Challenge Goal Commands
export class CreateChallengeGoalCommand implements Command {
  readonly type = 'CREATE_CHALLENGE_GOAL';
  readonly timestamp: string;
  
  constructor(
    public readonly challengeId: number,
    public readonly title: string,
    public readonly description: string | undefined,
    public readonly targetValue: number,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class UpdateChallengeGoalCommand implements Command {
  readonly type = 'UPDATE_CHALLENGE_GOAL';
  readonly timestamp: string;
  
  constructor(
    public readonly id: number,
    public readonly title?: string,
    public readonly description?: string,
    public readonly targetValue?: number,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class DeleteChallengeGoalCommand implements Command {
  readonly type = 'DELETE_CHALLENGE_GOAL';
  readonly timestamp: string;
  
  constructor(
    public readonly id: number,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

// Challenge Progress Commands
export class RecordChallengeProgressCommand implements Command {
  readonly type = 'RECORD_CHALLENGE_PROGRESS';
  readonly timestamp: string;
  
  constructor(
    public readonly challengeId: number,
    public readonly date: DateString,
    public readonly value: number,
    public readonly notes?: string,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class DeleteChallengeProgressCommand implements Command {
  readonly type = 'DELETE_CHALLENGE_PROGRESS';
  readonly timestamp: string;
  
  constructor(
    public readonly id: number,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

// User Emotion Commands
export class CreateUserEmotionCommand implements Command {
  readonly type = 'CREATE_USER_EMOTION';
  readonly timestamp: string;
  
  constructor(
    public readonly userId: number,
    public readonly categoryId: number,
    public readonly name: string,
    public readonly description?: string,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class UpdateUserEmotionCommand implements Command {
  readonly type = 'UPDATE_USER_EMOTION';
  readonly timestamp: string;
  
  constructor(
    public readonly id: number,
    public readonly name?: string,
    public readonly categoryId?: number,
    public readonly description?: string,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class DeleteUserEmotionCommand implements Command {
  readonly type = 'DELETE_USER_EMOTION';
  readonly timestamp: string;
  
  constructor(
    public readonly id: number,
  ) {
    this.timestamp = new Date().toISOString();
  }
}