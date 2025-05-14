/**
 * Query interfaces and handlers for therapist feature
 * Implementing CQRS pattern (Command Query Responsibility Segregation)
 */

import { 
  ID,
  DateString,
  ClientSummary,
  Client,
  TherapistNote,
  TreatmentPlan,
  ClientAnalytics
} from '../../domain/entities';

import {
  ITherapistRepository,
  ITherapistNoteRepository,
  ITreatmentPlanRepository
} from '../../domain/repositories';

// Query interfaces

/**
 * Query to get clients for a therapist
 */
export interface GetTherapistClientsQuery {
  therapistId: ID;
}

/**
 * Query to get a specific client by ID
 */
export interface GetClientByIdQuery {
  therapistId: ID;
  clientId: ID;
}

/**
 * Query to search for clients by username
 */
export interface SearchClientsQuery {
  usernameQuery: string;
}

/**
 * Query to get notes for a client
 */
export interface GetClientNotesQuery {
  therapistId: ID;
  clientId: ID;
}

/**
 * Query to get notes for a specific date range
 */
export interface GetClientNotesForDateRangeQuery {
  therapistId: ID;
  clientId: ID;
  startDate: DateString;
  endDate: DateString;
}

/**
 * Query to get a specific note by ID
 */
export interface GetNoteByIdQuery {
  id: ID;
  therapistId: ID;
}

/**
 * Query to get treatment plans for a client
 */
export interface GetClientTreatmentPlansQuery {
  therapistId: ID;
  clientId: ID;
}

/**
 * Query to get a specific treatment plan by ID
 */
export interface GetTreatmentPlanByIdQuery {
  id: ID;
  therapistId: ID;
}

/**
 * Query to get analytics for a client
 */
export interface GetClientAnalyticsQuery {
  therapistId: ID;
  clientId: ID;
  startDate?: DateString;
  endDate?: DateString;
}

// Query handlers

/**
 * Handler for GetTherapistClientsQuery
 */
export class GetTherapistClientsQueryHandler {
  constructor(private readonly therapistRepository: ITherapistRepository) {}
  
  async handle(query: GetTherapistClientsQuery): Promise<ClientSummary[]> {
    return this.therapistRepository.getClientsForTherapist(query.therapistId);
  }
}

/**
 * Handler for GetClientByIdQuery
 */
export class GetClientByIdQueryHandler {
  constructor(private readonly therapistRepository: ITherapistRepository) {}
  
  async handle(query: GetClientByIdQuery): Promise<Client | undefined> {
    // First, ensure the therapist is authorized for this client
    const isAuthorized = await this.therapistRepository.isAuthorizedForClient(
      query.therapistId,
      query.clientId
    );
    
    if (!isAuthorized) {
      throw new Error('Unauthorized: This client is not assigned to you');
    }
    
    return this.therapistRepository.getClientById(query.clientId);
  }
}

/**
 * Handler for SearchClientsQuery
 */
export class SearchClientsQueryHandler {
  constructor(private readonly therapistRepository: ITherapistRepository) {}
  
  async handle(query: SearchClientsQuery): Promise<Client[]> {
    return this.therapistRepository.searchClientsByUsername(query.usernameQuery);
  }
}

/**
 * Handler for GetClientNotesQuery
 */
export class GetClientNotesQueryHandler {
  constructor(
    private readonly therapistRepository: ITherapistRepository,
    private readonly noteRepository: ITherapistNoteRepository
  ) {}
  
  async handle(query: GetClientNotesQuery): Promise<TherapistNote[]> {
    // First, ensure the therapist is authorized for this client
    const isAuthorized = await this.therapistRepository.isAuthorizedForClient(
      query.therapistId,
      query.clientId
    );
    
    if (!isAuthorized) {
      throw new Error('Unauthorized: This client is not assigned to you');
    }
    
    return this.noteRepository.getNotesForClient(query.therapistId, query.clientId);
  }
}

/**
 * Handler for GetClientTreatmentPlansQuery
 */
export class GetClientTreatmentPlansQueryHandler {
  constructor(
    private readonly therapistRepository: ITherapistRepository,
    private readonly treatmentPlanRepository: ITreatmentPlanRepository
  ) {}
  
  async handle(query: GetClientTreatmentPlansQuery): Promise<TreatmentPlan[]> {
    // First, ensure the therapist is authorized for this client
    const isAuthorized = await this.therapistRepository.isAuthorizedForClient(
      query.therapistId,
      query.clientId
    );
    
    if (!isAuthorized) {
      throw new Error('Unauthorized: This client is not assigned to you');
    }
    
    return this.treatmentPlanRepository.getTreatmentPlansForClient(
      query.therapistId, 
      query.clientId
    );
  }
}

/**
 * Handler for GetClientAnalyticsQuery
 */
export class GetClientAnalyticsQueryHandler {
  constructor(private readonly therapistRepository: ITherapistRepository) {}
  
  async handle(query: GetClientAnalyticsQuery): Promise<ClientAnalytics> {
    // First, ensure the therapist is authorized for this client
    const isAuthorized = await this.therapistRepository.isAuthorizedForClient(
      query.therapistId,
      query.clientId
    );
    
    if (!isAuthorized) {
      throw new Error('Unauthorized: This client is not assigned to you');
    }
    
    return this.therapistRepository.getClientAnalytics(
      query.therapistId,
      query.clientId,
      query.startDate,
      query.endDate
    );
  }
}