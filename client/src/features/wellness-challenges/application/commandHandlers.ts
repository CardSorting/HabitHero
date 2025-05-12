/**
 * Command Handlers for the Wellness Challenge system
 * Each handler executes a specific command and persists the changes
 */

import { 
  IChallengeGoalRepository, 
  IChallengeProgressRepository, 
  IUserEmotionRepository, 
  IWellnessChallengeRepository
} from '../domain/repositories';

import {
  CreateChallengeCommand,
  UpdateChallengeCommand,
  DeleteChallengeCommand,
  UpdateChallengeStatusCommand,
  CreateChallengeGoalCommand,
  UpdateChallengeGoalCommand,
  DeleteChallengeGoalCommand,
  RecordChallengeProgressCommand,
  DeleteChallengeProgressCommand,
  CreateUserEmotionCommand,
  UpdateUserEmotionCommand,
  DeleteUserEmotionCommand
} from './commands';

import {
  ChallengeGoal,
  ChallengeProgress,
  UserEmotion,
  WellnessChallenge
} from '../domain/models';

/**
 * Command Handler class following the Command pattern
 * Implements a clean separation of concerns by handling only commands
 */
export class WellnessChallengeCommandHandlers {
  constructor(
    private challengeRepository: IWellnessChallengeRepository,
    private goalRepository: IChallengeGoalRepository,
    private progressRepository: IChallengeProgressRepository,
    private userEmotionRepository: IUserEmotionRepository,
  ) {}
  
  // Challenge Command Handlers
  async handleCreateChallenge(command: CreateChallengeCommand): Promise<WellnessChallenge> {
    return await this.challengeRepository.create({
      userId: command.userId,
      title: command.title,
      description: command.description,
      type: command.type,
      frequency: command.frequency,
      startDate: command.startDate,
      endDate: command.endDate,
      targetValue: command.targetValue,
      status: 'active',
    });
  }
  
  async handleUpdateChallenge(command: UpdateChallengeCommand): Promise<WellnessChallenge> {
    const updateData: Partial<WellnessChallenge> = {};
    
    if (command.title !== undefined) updateData.title = command.title;
    if (command.description !== undefined) updateData.description = command.description;
    if (command.type !== undefined) updateData.type = command.type;
    if (command.frequency !== undefined) updateData.frequency = command.frequency;
    if (command.startDate !== undefined) updateData.startDate = command.startDate;
    if (command.endDate !== undefined) updateData.endDate = command.endDate;
    if (command.targetValue !== undefined) updateData.targetValue = command.targetValue;
    
    return await this.challengeRepository.update(command.id, updateData);
  }
  
  async handleDeleteChallenge(command: DeleteChallengeCommand): Promise<boolean> {
    return await this.challengeRepository.delete(command.id);
  }
  
  async handleUpdateChallengeStatus(command: UpdateChallengeStatusCommand): Promise<WellnessChallenge> {
    return await this.challengeRepository.updateStatus(command.id, command.status);
  }
  
  // Challenge Goal Command Handlers
  async handleCreateChallengeGoal(command: CreateChallengeGoalCommand): Promise<ChallengeGoal> {
    return await this.goalRepository.create({
      challengeId: command.challengeId,
      title: command.title,
      description: command.description,
      targetValue: command.targetValue,
    });
  }
  
  async handleUpdateChallengeGoal(command: UpdateChallengeGoalCommand): Promise<ChallengeGoal> {
    const updateData: Partial<ChallengeGoal> = {};
    
    if (command.title !== undefined) updateData.title = command.title;
    if (command.description !== undefined) updateData.description = command.description;
    if (command.targetValue !== undefined) updateData.targetValue = command.targetValue;
    
    return await this.goalRepository.update(command.id, updateData);
  }
  
  async handleDeleteChallengeGoal(command: DeleteChallengeGoalCommand): Promise<boolean> {
    return await this.goalRepository.delete(command.id);
  }
  
  // Challenge Progress Command Handlers
  async handleRecordChallengeProgress(command: RecordChallengeProgressCommand): Promise<ChallengeProgress> {
    return await this.progressRepository.upsertProgress(
      command.challengeId,
      command.date,
      command.value,
      command.notes
    );
  }
  
  async handleDeleteChallengeProgress(command: DeleteChallengeProgressCommand): Promise<boolean> {
    return await this.progressRepository.delete(command.id);
  }
  
  // User Emotion Command Handlers
  async handleCreateUserEmotion(command: CreateUserEmotionCommand): Promise<UserEmotion> {
    return await this.userEmotionRepository.create({
      userId: command.userId,
      categoryId: command.categoryId,
      name: command.name,
      description: command.description,
    });
  }
  
  async handleUpdateUserEmotion(command: UpdateUserEmotionCommand): Promise<UserEmotion> {
    const updateData: Partial<UserEmotion> = {};
    
    if (command.name !== undefined) updateData.name = command.name;
    if (command.categoryId !== undefined) updateData.categoryId = command.categoryId;
    if (command.description !== undefined) updateData.description = command.description;
    
    return await this.userEmotionRepository.update(command.id, updateData);
  }
  
  async handleDeleteUserEmotion(command: DeleteUserEmotionCommand): Promise<boolean> {
    return await this.userEmotionRepository.delete(command.id);
  }
}