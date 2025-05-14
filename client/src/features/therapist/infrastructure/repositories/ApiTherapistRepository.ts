/**
 * API implementation of ITherapistRepository
 */
import {
  ID,
  DateString,
  TherapistClient,
  Client,
  ClientSummary,
  ClientAnalytics,
} from '../../domain/entities';
import { ITherapistRepository } from '../../domain/repositories';
import { therapistApiClient } from '../api/apiClient';

/**
 * API-based implementation of the therapist repository
 */
export class ApiTherapistRepository implements ITherapistRepository {
  /**
   * Get all clients assigned to a therapist
   */
  async getClientsForTherapist(therapistId: ID): Promise<ClientSummary[]> {
    return therapistApiClient.getClients();
  }

  /**
   * Get a specific client by ID
   */
  async getClientById(clientId: ID): Promise<Client | undefined> {
    try {
      return await therapistApiClient.getClientById(clientId);
    } catch (error) {
      if ((error as any)?.status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Search for clients by username
   */
  async searchClientsByUsername(usernameQuery: string): Promise<Client[]> {
    return therapistApiClient.searchClients(usernameQuery);
  }

  /**
   * Assign a client to a therapist
   */
  async assignClientToTherapist(
    therapistId: ID,
    clientId: ID,
    startDate: DateString,
    notes?: string
  ): Promise<TherapistClient> {
    // The API client automatically uses the authenticated user's ID as the therapist ID
    // so we don't need to pass it explicitly
    return therapistApiClient.assignClient(
      // Since our API expects a username and not an ID, we need to find the client first
      // This is a workaround for the demo - in a real app, the API would accept a client ID
      `client${clientId}`, // This is a workaround for demo purposes
      startDate,
      notes
    );
  }

  /**
   * Remove a client from a therapist
   */
  async removeClientFromTherapist(therapistId: ID, clientId: ID): Promise<boolean> {
    return therapistApiClient.removeClient(clientId);
  }

  /**
   * Update a therapist-client relationship
   */
  async updateClientTherapistRelationship(
    id: ID,
    data: Partial<TherapistClient>
  ): Promise<TherapistClient> {
    return therapistApiClient.updateClientRelationship(
      id,
      data.status,
      data.endDate,
      data.notes
    );
  }

  /**
   * Check if a therapist is authorized to access a client's data
   */
  async isAuthorizedForClient(therapistId: ID, clientId: ID): Promise<boolean> {
    try {
      const clients = await this.getClientsForTherapist(therapistId);
      return clients.some(client => client.id === clientId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get analytics data for a client
   */
  async getClientAnalytics(
    therapistId: ID,
    clientId: ID,
    startDate?: DateString,
    endDate?: DateString
  ): Promise<ClientAnalytics> {
    return therapistApiClient.getClientAnalytics(clientId, startDate, endDate);
  }
}