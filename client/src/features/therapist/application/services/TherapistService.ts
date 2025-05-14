/**
 * Service for coordinating therapist operations
 * Acts as a facade over command and query handlers
 */

import {
  ID,
  DateString,
  TherapistClient,
  ClientSummary,
  Client,
  TherapistNote,
  TreatmentPlan,
  ClientAnalytics,
  TreatmentGoal,
  Assessment,
  Intervention,
  ClientStatus,
  TreatmentPlanStatus
} from '../../domain/entities';

import {
  ITherapistRepository,
  ITherapistNoteRepository,
  ITreatmentPlanRepository
} from '../../domain/repositories';

import {
  AssignClientCommand,
  AssignClientCommandHandler,
  AddNoteCommand,
  AddNoteCommandHandler,
  CreateTreatmentPlanCommand,
  CreateTreatmentPlanCommandHandler
} from '../commands/TherapistCommands';

import {
  GetTherapistClientsQuery,
  GetTherapistClientsQueryHandler,
  GetClientByIdQuery,
  GetClientByIdQueryHandler,
  SearchClientsQuery,
  SearchClientsQueryHandler,
  GetClientNotesQuery,
  GetClientNotesQueryHandler,
  GetClientTreatmentPlansQuery,
  GetClientTreatmentPlansQueryHandler,
  GetClientAnalyticsQuery,
  GetClientAnalyticsQueryHandler
} from '../queries/TherapistQueries';

/**
 * Therapist Service - Coordinates commands and queries
 * Implements Facade pattern over CQRS
 */
export class TherapistService {
  private assignClientHandler: AssignClientCommandHandler;
  private addNoteHandler: AddNoteCommandHandler;
  private createTreatmentPlanHandler: CreateTreatmentPlanCommandHandler;
  
  private getClientsHandler: GetTherapistClientsQueryHandler;
  private getClientByIdHandler: GetClientByIdQueryHandler;
  private searchClientsHandler: SearchClientsQueryHandler;
  private getClientNotesHandler: GetClientNotesQueryHandler;
  private getClientTreatmentPlansHandler: GetClientTreatmentPlansQueryHandler;
  private getClientAnalyticsHandler: GetClientAnalyticsQueryHandler;
  
  constructor(
    private readonly therapistRepository: ITherapistRepository,
    private readonly noteRepository: ITherapistNoteRepository,
    private readonly treatmentPlanRepository: ITreatmentPlanRepository
  ) {
    // Initialize command handlers
    this.assignClientHandler = new AssignClientCommandHandler(therapistRepository);
    this.addNoteHandler = new AddNoteCommandHandler(therapistRepository, noteRepository);
    this.createTreatmentPlanHandler = new CreateTreatmentPlanCommandHandler(
      therapistRepository, 
      treatmentPlanRepository
    );
    
    // Initialize query handlers
    this.getClientsHandler = new GetTherapistClientsQueryHandler(therapistRepository);
    this.getClientByIdHandler = new GetClientByIdQueryHandler(therapistRepository);
    this.searchClientsHandler = new SearchClientsQueryHandler(therapistRepository);
    this.getClientNotesHandler = new GetClientNotesQueryHandler(
      therapistRepository, 
      noteRepository
    );
    this.getClientTreatmentPlansHandler = new GetClientTreatmentPlansQueryHandler(
      therapistRepository, 
      treatmentPlanRepository
    );
    this.getClientAnalyticsHandler = new GetClientAnalyticsQueryHandler(therapistRepository);
  }
  
  // Command methods
  
  /**
   * Assign a client to the therapist
   */
  async assignClient(
    therapistId: ID,
    clientUsername: string,
    startDate: DateString = new Date().toISOString().split('T')[0],
    notes?: string
  ): Promise<TherapistClient> {
    const command: AssignClientCommand = {
      therapistId,
      clientUsername,
      startDate,
      notes
    };
    
    return this.assignClientHandler.handle(command);
  }
  
  /**
   * Add a note for a client
   */
  async addNote(
    therapistId: ID,
    clientId: ID,
    sessionDate: DateString,
    content: string,
    options?: {
      mood?: string;
      progress?: string;
      goalCompletion?: number;
      isPrivate?: boolean;
    }
  ): Promise<TherapistNote> {
    const command: AddNoteCommand = {
      therapistId,
      clientId,
      sessionDate,
      content,
      mood: options?.mood,
      progress: options?.progress,
      goalCompletion: options?.goalCompletion,
      isPrivate: options?.isPrivate ?? true
    };
    
    return this.addNoteHandler.handle(command);
  }
  
  /**
   * Create a treatment plan for a client
   */
  async createTreatmentPlan(
    therapistId: ID,
    clientId: ID,
    title: string,
    options?: {
      description?: string;
      startDate?: DateString;
      endDate?: DateString;
      status?: TreatmentPlanStatus;
      goals?: TreatmentGoal[];
      assessments?: Assessment[];
      interventions?: Intervention[];
    }
  ): Promise<TreatmentPlan> {
    const command: CreateTreatmentPlanCommand = {
      therapistId,
      clientId,
      title,
      description: options?.description,
      startDate: options?.startDate ?? new Date().toISOString().split('T')[0],
      endDate: options?.endDate,
      status: options?.status,
      goals: options?.goals,
      assessments: options?.assessments,
      interventions: options?.interventions
    };
    
    return this.createTreatmentPlanHandler.handle(command);
  }
  
  // Direct repository methods (for operations not requiring complex logic)
  
  /**
   * Remove a client from a therapist
   */
  async removeClient(therapistId: ID, clientId: ID): Promise<boolean> {
    // Ensure the therapist is authorized for this client
    const isAuthorized = await this.therapistRepository.isAuthorizedForClient(
      therapistId,
      clientId
    );
    
    if (!isAuthorized) {
      throw new Error('Unauthorized: This client is not assigned to you');
    }
    
    return this.therapistRepository.removeClientFromTherapist(therapistId, clientId);
  }
  
  /**
   * Update a note
   */
  async updateNote(
    id: ID,
    therapistId: ID,
    updates: Partial<TherapistNote>
  ): Promise<TherapistNote> {
    const note = await this.noteRepository.getNoteById(id);
    
    if (!note) {
      throw new Error(`Note with ID ${id} not found`);
    }
    
    if (note.therapistId !== therapistId) {
      throw new Error('Unauthorized: You are not the author of this note');
    }
    
    return this.noteRepository.updateNote(id, updates);
  }
  
  /**
   * Delete a note
   */
  async deleteNote(id: ID, therapistId: ID): Promise<boolean> {
    const note = await this.noteRepository.getNoteById(id);
    
    if (!note) {
      throw new Error(`Note with ID ${id} not found`);
    }
    
    if (note.therapistId !== therapistId) {
      throw new Error('Unauthorized: You are not the author of this note');
    }
    
    return this.noteRepository.deleteNote(id);
  }
  
  /**
   * Update a treatment plan
   */
  async updateTreatmentPlan(
    id: ID,
    therapistId: ID,
    updates: Partial<TreatmentPlan>
  ): Promise<TreatmentPlan> {
    const plan = await this.treatmentPlanRepository.getTreatmentPlanById(id);
    
    if (!plan) {
      throw new Error(`Treatment plan with ID ${id} not found`);
    }
    
    if (plan.therapistId !== therapistId) {
      throw new Error('Unauthorized: You are not the author of this treatment plan');
    }
    
    return this.treatmentPlanRepository.updateTreatmentPlan(id, updates);
  }
  
  /**
   * Delete a treatment plan
   */
  async deleteTreatmentPlan(id: ID, therapistId: ID): Promise<boolean> {
    const plan = await this.treatmentPlanRepository.getTreatmentPlanById(id);
    
    if (!plan) {
      throw new Error(`Treatment plan with ID ${id} not found`);
    }
    
    if (plan.therapistId !== therapistId) {
      throw new Error('Unauthorized: You are not the author of this treatment plan');
    }
    
    return this.treatmentPlanRepository.deleteTreatmentPlan(id);
  }
  
  // Query methods
  
  /**
   * Get all clients for a therapist
   */
  async getClients(therapistId: ID): Promise<ClientSummary[]> {
    const query: GetTherapistClientsQuery = {
      therapistId
    };
    
    return this.getClientsHandler.handle(query);
  }
  
  /**
   * Get a specific client by ID
   */
  async getClientById(therapistId: ID, clientId: ID): Promise<Client | undefined> {
    const query: GetClientByIdQuery = {
      therapistId,
      clientId
    };
    
    return this.getClientByIdHandler.handle(query);
  }
  
  /**
   * Search for clients by username
   */
  async searchClients(usernameQuery: string): Promise<Client[]> {
    const query: SearchClientsQuery = {
      usernameQuery
    };
    
    return this.searchClientsHandler.handle(query);
  }
  
  /**
   * Get notes for a client
   */
  async getClientNotes(therapistId: ID, clientId: ID): Promise<TherapistNote[]> {
    const query: GetClientNotesQuery = {
      therapistId,
      clientId
    };
    
    return this.getClientNotesHandler.handle(query);
  }
  
  /**
   * Get treatment plans for a client
   */
  async getClientTreatmentPlans(therapistId: ID, clientId: ID): Promise<TreatmentPlan[]> {
    const query: GetClientTreatmentPlansQuery = {
      therapistId,
      clientId
    };
    
    return this.getClientTreatmentPlansHandler.handle(query);
  }
  
  /**
   * Get analytics for a client
   */
  async getClientAnalytics(
    therapistId: ID,
    clientId: ID,
    startDate?: DateString,
    endDate?: DateString
  ): Promise<ClientAnalytics> {
    const query: GetClientAnalyticsQuery = {
      therapistId,
      clientId,
      startDate,
      endDate
    };
    
    return this.getClientAnalyticsHandler.handle(query);
  }
  
  /**
   * Check if a therapist is authorized for a client
   */
  async isAuthorizedForClient(therapistId: ID, clientId: ID): Promise<boolean> {
    return this.therapistRepository.isAuthorizedForClient(therapistId, clientId);
  }
}