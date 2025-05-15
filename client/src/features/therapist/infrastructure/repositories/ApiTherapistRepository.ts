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
    console.log('ApiTherapistRepository.assignClientToTherapist', {
      therapistId,
      clientId,
      startDate,
      notes
    });
    
    try {
      // We need the client object to get its username
      // Since we already have the clientId, we can try to get it directly from the API
      let client;
      try {
        client = await this.getClientById(clientId);
      } catch (error) {
        console.error('Error getting client by ID, falling back to search:', error);
      }
      
      let clientUsername = '';
      
      if (client) {
        // We have the client, use its username
        clientUsername = client.username;
      } else {
        // Try searching if ID is not available - for clients seen in search results
        try {
          // Use a more reliable search string that will pass the 2-character minimum
          const searchString = `client${clientId}`; 
          const clients = await this.searchClientsByUsername(searchString);
          
          if (clients && clients.length > 0) {
            // Use the actual username from the search results
            clientUsername = clients[0].username;
          } else {
            // Last resort - use the ID itself
            clientUsername = clientId.toString();
          }
        } catch (searchError) {
          console.error('Error searching for client:', searchError);
          // Fall back to the ID as username if everything else fails
          clientUsername = clientId.toString();
        }
      }
      
      console.log('Using client username:', clientUsername);
      
      // Make the actual API call to assign the client
      const result = await therapistApiClient.assignClient(
        clientUsername,
        startDate,
        notes
      );
      
      console.log('Assignment successful:', result);
      return result;
    } catch (error) {
      console.error('Error in assignClientToTherapist:', error);
      throw error;
    }
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