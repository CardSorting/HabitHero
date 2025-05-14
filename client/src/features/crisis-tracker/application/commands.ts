/**
 * CQRS Command definitions for Crisis Tracker
 * Following the Command Query Responsibility Segregation pattern
 */

import { ID, DateString } from '../domain/CrisisRepository';
import { CrisisType, CrisisIntensity } from '../domain/models';

/**
 * Base command interface
 */
export interface Command<T = void> {
  execute(): Promise<T>;
}

/**
 * Command to create a new crisis event
 */
export interface CreateCrisisEventCommand extends Command<number> {
  userId: ID;
  type: CrisisType;
  date: DateString;
  time?: string;
  intensity: CrisisIntensity;
  duration?: number;
  notes?: string;
  symptoms?: string[];
  triggers?: string[];
  copingStrategiesUsed?: string[];
  copingStrategyEffectiveness?: number;
  helpSought: boolean;
  medication: boolean;
}

/**
 * Command to update an existing crisis event
 */
export interface UpdateCrisisEventCommand extends Command<boolean> {
  id: ID;
  type?: CrisisType;
  date?: DateString;
  time?: string;
  intensity?: CrisisIntensity;
  duration?: number;
  notes?: string;
  symptoms?: string[];
  triggers?: string[];
  copingStrategiesUsed?: string[];
  copingStrategyEffectiveness?: number;
  helpSought?: boolean;
  medication?: boolean;
}

/**
 * Command to delete a crisis event
 */
export interface DeleteCrisisEventCommand extends Command<boolean> {
  id: ID;
}