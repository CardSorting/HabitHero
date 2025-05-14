/**
 * Command objects for the Crisis Events system following CQRS pattern
 * Commands represent operations that change state
 */

import { 
  CrisisIntensity, 
  CrisisType, 
  DateString, 
  TimeString,
  ID
} from '../domain/models';

// Base Command interface
export interface Command {
  readonly type: string;
  readonly timestamp: string;
}

// Crisis Event Commands
export class CreateCrisisEventCommand implements Command {
  readonly type = 'CREATE_CRISIS_EVENT';
  readonly timestamp: string;
  
  constructor(
    public readonly userId: ID,
    public readonly crisisType: CrisisType,
    public readonly date: DateString,
    public readonly time: TimeString | undefined,
    public readonly intensity: CrisisIntensity,
    public readonly duration: number | undefined,
    public readonly notes: string | undefined,
    public readonly symptoms: string[] | undefined,
    public readonly triggers: string[] | undefined,
    public readonly copingStrategiesUsed: string[] | undefined,
    public readonly copingStrategyEffectiveness: number | undefined,
    public readonly helpSought: boolean,
    public readonly medication: boolean,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class UpdateCrisisEventCommand implements Command {
  readonly type = 'UPDATE_CRISIS_EVENT';
  readonly timestamp: string;
  
  constructor(
    public readonly id: ID,
    public readonly crisisType?: CrisisType,
    public readonly date?: DateString,
    public readonly time?: TimeString,
    public readonly intensity?: CrisisIntensity,
    public readonly duration?: number,
    public readonly notes?: string,
    public readonly symptoms?: string[],
    public readonly triggers?: string[],
    public readonly copingStrategiesUsed?: string[],
    public readonly copingStrategyEffectiveness?: number,
    public readonly helpSought?: boolean,
    public readonly medication?: boolean,
  ) {
    this.timestamp = new Date().toISOString();
  }
}

export class DeleteCrisisEventCommand implements Command {
  readonly type = 'DELETE_CRISIS_EVENT';
  readonly timestamp: string;
  
  constructor(
    public readonly id: ID
  ) {
    this.timestamp = new Date().toISOString();
  }
}

// Command Handlers
export class CrisisCommandHandlers {
  constructor(private repository: any) {}
  
  async handleCreateCrisisEvent(command: CreateCrisisEventCommand) {
    const {
      userId,
      crisisType: type,
      date,
      time,
      intensity,
      duration,
      notes,
      symptoms,
      triggers,
      copingStrategiesUsed,
      copingStrategyEffectiveness,
      helpSought,
      medication
    } = command;
    
    return this.repository.createCrisisEvent({
      userId,
      type,
      date,
      time,
      intensity,
      duration,
      notes,
      symptoms,
      triggers,
      copingStrategiesUsed,
      copingStrategyEffectiveness,
      helpSought,
      medication
    });
  }
  
  async handleUpdateCrisisEvent(command: UpdateCrisisEventCommand) {
    const {
      id,
      crisisType: type,
      date,
      time,
      intensity,
      duration,
      notes,
      symptoms,
      triggers,
      copingStrategiesUsed,
      copingStrategyEffectiveness,
      helpSought,
      medication
    } = command;
    
    return this.repository.updateCrisisEvent({
      id,
      type,
      date,
      time,
      intensity,
      duration,
      notes,
      symptoms,
      triggers,
      copingStrategiesUsed,
      copingStrategyEffectiveness,
      helpSought,
      medication
    });
  }
  
  async handleDeleteCrisisEvent(command: DeleteCrisisEventCommand) {
    return this.repository.deleteCrisisEvent(command.id);
  }
}