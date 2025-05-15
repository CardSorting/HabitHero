/**
 * Repository interface for therapist-related operations
 * Following Clean Architecture and SOLID principles
 */

import { 
  TherapistClient, 
  Client, 
  ClientSummary, 
  ClientAnalytics, 
  ID, 
  DateString 
} from '../entities';

/**
 * Interface for therapist repositories following Repository Pattern
 */
export interface ITherapistRepository {
  /**
   * Get all clients assigned to a therapist
   * @param therapistId The ID of the therapist
   * @returns A promise resolving to an array of client summaries
   */
  getClientsForTherapist(therapistId: ID): Promise<ClientSummary[]>;

  /**
   * Get a specific client by ID
   * @param clientId The ID of the client
   * @returns A promise resolving to a client or undefined if not found
   */
  getClientById(clientId: ID): Promise<Client | undefined>;

  /**
   * Search for clients by username to assign to a therapist
   * @param usernameQuery The username query string
   * @returns A promise resolving to an array of clients
   */
  searchClientsByUsername(usernameQuery: string): Promise<Client[]>;

  /**
   * Assign a client to a therapist
   * @param therapistId The ID of the therapist
   * @param clientUsernameOrId The username or ID of the client
   * @param startDate The start date of the relationship
   * @param notes Optional notes about the relationship
   * @returns A promise resolving to the created therapist-client relationship
   */
  assignClientToTherapist(
    therapistId: ID, 
    clientUsernameOrId: string | ID, 
    startDate: DateString, 
    notes?: string
  ): Promise<TherapistClient>;

  /**
   * Remove a client from a therapist
   * @param therapistId The ID of the therapist
   * @param clientId The ID of the client
   * @returns A promise resolving to a boolean indicating success
   */
  removeClientFromTherapist(therapistId: ID, clientId: ID): Promise<boolean>;

  /**
   * Update a therapist-client relationship
   * @param id The ID of the relationship
   * @param data The data to update
   * @returns A promise resolving to the updated relationship
   */
  updateClientTherapistRelationship(
    id: ID, 
    data: Partial<TherapistClient>
  ): Promise<TherapistClient>;

  /**
   * Check if a therapist is authorized to access a client's data
   * @param therapistId The ID of the therapist
   * @param clientId The ID of the client
   * @returns A promise resolving to a boolean indicating authorization
   */
  isAuthorizedForClient(therapistId: ID, clientId: ID): Promise<boolean>;

  /**
   * Get analytics data for a client
   * @param therapistId The ID of the therapist
   * @param clientId The ID of the client
   * @param startDate Optional start date for the analytics period
   * @param endDate Optional end date for the analytics period
   * @returns A promise resolving to client analytics data
   */
  getClientAnalytics(
    therapistId: ID, 
    clientId: ID, 
    startDate?: DateString, 
    endDate?: DateString
  ): Promise<ClientAnalytics>;
}