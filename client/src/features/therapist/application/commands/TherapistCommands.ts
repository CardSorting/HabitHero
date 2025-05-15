/**
 * Command interfaces and handlers for therapist feature
 * Implementing CQRS pattern (Command Query Responsibility Segregation)
 */

import { 
  ID, 
  DateString, 
  TherapistClient, 
  TherapistNote, 
  TreatmentPlan, 
  TreatmentGoal, 
  Assessment, 
  Intervention,
  ClientStatus,
  TreatmentPlanStatus,
  GoalStatus
} from '../../domain/entities';

import { 
  ITherapistRepository, 
  ITherapistNoteRepository, 
  ITreatmentPlanRepository 
} from '../../domain/repositories';

// Command interfaces

/**
 * Command to assign a client to a therapist
 */
export interface AssignClientCommand {
  therapistId: ID;
  clientUsername: string;
  startDate: DateString;
  notes?: string;
}

/**
 * Command to remove a client from a therapist
 */
export interface RemoveClientCommand {
  therapistId: ID;
  clientId: ID;
}

/**
 * Command to update client-therapist relationship
 */
export interface UpdateClientRelationshipCommand {
  id: ID;
  therapistId: ID;
  status?: ClientStatus;
  endDate?: DateString;
  notes?: string;
}

/**
 * Command to add a therapist note
 */
export interface AddNoteCommand {
  therapistId: ID;
  clientId: ID;
  sessionDate: DateString;
  content: string;
  mood?: string;
  progress?: string;
  goalCompletion?: number;
  isPrivate: boolean;
}

/**
 * Command to update a therapist note
 */
export interface UpdateNoteCommand {
  id: ID;
  therapistId: ID;
  content?: string;
  mood?: string;
  progress?: string;
  goalCompletion?: number;
  isPrivate?: boolean;
}

/**
 * Command to delete a therapist note
 */
export interface DeleteNoteCommand {
  id: ID;
  therapistId: ID;
}

/**
 * Command to create a treatment plan
 */
export interface CreateTreatmentPlanCommand {
  therapistId: ID;
  clientId: ID;
  title: string;
  description?: string;
  startDate: DateString;
  endDate?: DateString;
  status?: TreatmentPlanStatus;
  goals?: TreatmentGoal[];
  assessments?: Assessment[];
  interventions?: Intervention[];
}

/**
 * Command to update a treatment plan
 */
export interface UpdateTreatmentPlanCommand {
  id: ID;
  therapistId: ID;
  title?: string;
  description?: string;
  endDate?: DateString;
  status?: TreatmentPlanStatus;
  goals?: TreatmentGoal[];
  assessments?: Assessment[];
  interventions?: Intervention[];
}

/**
 * Command to delete a treatment plan
 */
export interface DeleteTreatmentPlanCommand {
  id: ID;
  therapistId: ID;
}

// Command handlers

/**
 * Handler for AssignClientCommand
 */
export class AssignClientCommandHandler {
  constructor(private readonly therapistRepository: ITherapistRepository) {}
  
  async handle(command: AssignClientCommand): Promise<TherapistClient> {
    // Check if we need to look up the client by username
    // We want to validate the client exists, but we'll pass the original username forward
    const clients = await this.therapistRepository.searchClientsByUsername(command.clientUsername);
    
    if (!clients.length) {
      throw new Error(`Client with username ${command.clientUsername} not found`);
    }
    
    const clientId = clients[0].id;
    
    // Check if the client is already assigned to this therapist
    const isAuthorized = await this.therapistRepository.isAuthorizedForClient(
      command.therapistId, 
      clientId
    );
    
    if (isAuthorized) {
      throw new Error(`Client ${command.clientUsername} is already assigned to this therapist`);
    }
    
    // Assign the client to the therapist - pass the username directly
    return this.therapistRepository.assignClientToTherapist(
      command.therapistId,
      command.clientUsername, // Use the username directly
      command.startDate,
      command.notes
    );
  }
}

/**
 * Handler for AddNoteCommand
 */
export class AddNoteCommandHandler {
  constructor(
    private readonly therapistRepository: ITherapistRepository,
    private readonly noteRepository: ITherapistNoteRepository
  ) {}
  
  async handle(command: AddNoteCommand): Promise<TherapistNote> {
    // Ensure the therapist is authorized for this client
    const isAuthorized = await this.therapistRepository.isAuthorizedForClient(
      command.therapistId,
      command.clientId
    );
    
    if (!isAuthorized) {
      throw new Error('Unauthorized: This client is not assigned to you');
    }
    
    // Create the note
    return this.noteRepository.createNote({
      therapistId: command.therapistId,
      clientId: command.clientId,
      sessionDate: command.sessionDate,
      content: command.content,
      mood: command.mood,
      progress: command.progress,
      goalCompletion: command.goalCompletion,
      isPrivate: command.isPrivate
    });
  }
}

/**
 * Handler for CreateTreatmentPlanCommand
 */
export class CreateTreatmentPlanCommandHandler {
  constructor(
    private readonly therapistRepository: ITherapistRepository,
    private readonly treatmentPlanRepository: ITreatmentPlanRepository
  ) {}
  
  async handle(command: CreateTreatmentPlanCommand): Promise<TreatmentPlan> {
    // Ensure the therapist is authorized for this client
    const isAuthorized = await this.therapistRepository.isAuthorizedForClient(
      command.therapistId,
      command.clientId
    );
    
    if (!isAuthorized) {
      throw new Error('Unauthorized: This client is not assigned to you');
    }
    
    // Create the treatment plan
    return this.treatmentPlanRepository.createTreatmentPlan({
      therapistId: command.therapistId,
      clientId: command.clientId,
      title: command.title,
      description: command.description,
      startDate: command.startDate,
      endDate: command.endDate,
      status: command.status || TreatmentPlanStatus.ACTIVE,
      goals: command.goals || [],
      assessments: command.assessments || [],
      interventions: command.interventions || []
    });
  }
}