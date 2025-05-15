/**
 * API client for therapist-related endpoints
 */
import { apiRequest, getResponseData } from '@/lib/queryClient';
import { 
  ID, 
  DateString, 
  TherapistClient, 
  ClientSummary, 
  Client, 
  TherapistNote, 
  TreatmentPlan, 
  ClientAnalytics,
  ClientStatus 
} from '../../domain/entities';

/**
 * API endpoints for therapist feature
 */
export const therapistEndpoints = {
  // Client relationship endpoints
  getClients: '/api/therapist/clients',
  assignClient: '/api/therapist/clients',
  getClientById: (clientId: ID) => `/api/therapist/clients/${clientId}`,
  updateClientRelationship: (id: ID) => `/api/therapist/clients/${id}`,
  removeClient: (clientId: ID) => `/api/therapist/clients/${clientId}`,
  searchClients: '/api/therapist/clients/search',
  
  // Notes endpoints
  getClientNotes: (clientId: ID) => `/api/therapist/clients/${clientId}/notes`,
  getNoteById: (noteId: ID) => `/api/therapist/notes/${noteId}`,
  createNote: '/api/therapist/notes',
  updateNote: (noteId: ID) => `/api/therapist/notes/${noteId}`,
  deleteNote: (noteId: ID) => `/api/therapist/notes/${noteId}`,
  
  // Treatment plan endpoints
  getClientTreatmentPlans: (clientId: ID) => `/api/therapist/clients/${clientId}/treatment-plans`,
  getTreatmentPlanById: (planId: ID) => `/api/therapist/treatment-plans/${planId}`,
  createTreatmentPlan: '/api/therapist/treatment-plans',
  updateTreatmentPlan: (planId: ID) => `/api/therapist/treatment-plans/${planId}`,
  deleteTreatmentPlan: (planId: ID) => `/api/therapist/treatment-plans/${planId}`,
  
  // Analytics endpoints
  getClientAnalytics: (clientId: ID) => `/api/therapist/clients/${clientId}/analytics`,
  getClientEmotionAnalytics: (clientId: ID) => `/api/therapist/clients/${clientId}/analytics/emotions`,
  getClientCrisisAnalytics: (clientId: ID) => `/api/therapist/clients/${clientId}/analytics/crisis`
};

/**
 * API client for therapist operations
 */
export const therapistApiClient = {
  /**
   * Get all clients for a therapist
   */
  async getClients(): Promise<ClientSummary[]> {
    const response = await apiRequest('GET', therapistEndpoints.getClients);
    return getResponseData<ClientSummary[]>(response);
  },
  
  /**
   * Assign a client to a therapist
   */
  async assignClient(
    clientUsername: string, 
    startDate: DateString, 
    notes?: string
  ): Promise<TherapistClient> {
    const response = await apiRequest('POST', therapistEndpoints.assignClient, {
      clientUsername,
      startDate,
      notes
    });
    return getResponseData<TherapistClient>(response);
  },
  
  /**
   * Get a specific client by ID
   */
  async getClientById(clientId: ID): Promise<Client> {
    const response = await apiRequest('GET', therapistEndpoints.getClientById(clientId));
    return getResponseData<Client>(response);
  },
  
  /**
   * Update a client-therapist relationship
   */
  async updateClientRelationship(
    id: ID, 
    status?: ClientStatus, 
    endDate?: DateString, 
    notes?: string
  ): Promise<TherapistClient> {
    const response = await apiRequest('PUT', therapistEndpoints.updateClientRelationship(id), {
      status,
      endDate,
      notes
    });
    return getResponseData<TherapistClient>(response);
  },
  
  /**
   * Remove a client from a therapist
   */
  async removeClient(clientId: ID): Promise<boolean> {
    await apiRequest({
      url: therapistEndpoints.removeClient(clientId),
      method: 'DELETE'
    });
    return true;
  },
  
  /**
   * Search for clients by username
   */
  async searchClients(usernameQuery: string): Promise<Client[]> {
    return apiRequest({
      url: `${therapistEndpoints.searchClients}?query=${encodeURIComponent(usernameQuery)}`,
      method: 'GET'
    });
  },
  
  /**
   * Get notes for a client
   */
  async getClientNotes(clientId: ID): Promise<TherapistNote[]> {
    return apiRequest({
      url: therapistEndpoints.getClientNotes(clientId),
      method: 'GET'
    });
  },
  
  /**
   * Get a specific note by ID
   */
  async getNoteById(noteId: ID): Promise<TherapistNote> {
    return apiRequest({
      url: therapistEndpoints.getNoteById(noteId),
      method: 'GET'
    });
  },
  
  /**
   * Create a note for a client
   */
  async createNote(
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
    return apiRequest({
      url: therapistEndpoints.createNote,
      method: 'POST',
      data: {
        clientId,
        sessionDate,
        content,
        mood: options?.mood,
        progress: options?.progress,
        goalCompletion: options?.goalCompletion,
        isPrivate: options?.isPrivate ?? true
      }
    });
  },
  
  /**
   * Update a note
   */
  async updateNote(
    noteId: ID, 
    updates: Partial<TherapistNote>
  ): Promise<TherapistNote> {
    return apiRequest({
      url: therapistEndpoints.updateNote(noteId),
      method: 'PUT',
      data: updates
    });
  },
  
  /**
   * Delete a note
   */
  async deleteNote(noteId: ID): Promise<boolean> {
    await apiRequest({
      url: therapistEndpoints.deleteNote(noteId),
      method: 'DELETE'
    });
    return true;
  },
  
  /**
   * Get treatment plans for a client
   */
  async getClientTreatmentPlans(clientId: ID): Promise<TreatmentPlan[]> {
    return apiRequest({
      url: therapistEndpoints.getClientTreatmentPlans(clientId),
      method: 'GET'
    });
  },
  
  /**
   * Get a specific treatment plan by ID
   */
  async getTreatmentPlanById(planId: ID): Promise<TreatmentPlan> {
    return apiRequest({
      url: therapistEndpoints.getTreatmentPlanById(planId),
      method: 'GET'
    });
  },
  
  /**
   * Create a treatment plan for a client
   */
  async createTreatmentPlan(plan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreatmentPlan> {
    return apiRequest({
      url: therapistEndpoints.createTreatmentPlan,
      method: 'POST',
      data: plan
    });
  },
  
  /**
   * Update a treatment plan
   */
  async updateTreatmentPlan(
    planId: ID, 
    updates: Partial<TreatmentPlan>
  ): Promise<TreatmentPlan> {
    return apiRequest({
      url: therapistEndpoints.updateTreatmentPlan(planId),
      method: 'PUT',
      data: updates
    });
  },
  
  /**
   * Delete a treatment plan
   */
  async deleteTreatmentPlan(planId: ID): Promise<boolean> {
    await apiRequest({
      url: therapistEndpoints.deleteTreatmentPlan(planId),
      method: 'DELETE'
    });
    return true;
  },
  
  /**
   * Get analytics for a client
   */
  async getClientAnalytics(
    clientId: ID, 
    startDate?: DateString, 
    endDate?: DateString
  ): Promise<ClientAnalytics> {
    let url = therapistEndpoints.getClientAnalytics(clientId);
    
    // Add query parameters if provided
    const queryParams = [];
    if (startDate) queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
    
    if (queryParams.length > 0) {
      url = `${url}?${queryParams.join('&')}`;
    }
    
    return apiRequest({
      url,
      method: 'GET'
    });
  }
};