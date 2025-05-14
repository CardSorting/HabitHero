/**
 * API implementation of ITherapistNoteRepository
 */
import {
  ID,
  DateString,
  TherapistNote
} from '../../domain/entities';
import { ITherapistNoteRepository } from '../../domain/repositories';
import { therapistApiClient } from '../api/apiClient';

/**
 * API-based implementation of the therapist note repository
 */
export class ApiTherapistNoteRepository implements ITherapistNoteRepository {
  /**
   * Get all notes created by a therapist for a specific client
   */
  async getNotesForClient(therapistId: ID, clientId: ID): Promise<TherapistNote[]> {
    return therapistApiClient.getClientNotes(clientId);
  }

  /**
   * Get a specific note by ID
   */
  async getNoteById(id: ID): Promise<TherapistNote | undefined> {
    try {
      return await therapistApiClient.getNoteById(id);
    } catch (error) {
      if ((error as any)?.status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Get notes for a specific date range
   * Note: This implementation filters on the client side as our API doesn't support date filtering directly
   * In a production environment, this would be handled by the API with proper query parameters
   */
  async getNotesForDateRange(
    therapistId: ID,
    clientId: ID,
    startDate: DateString,
    endDate: DateString
  ): Promise<TherapistNote[]> {
    const allNotes = await this.getNotesForClient(therapistId, clientId);
    
    // Filter notes by date range
    return allNotes.filter(note => {
      const noteDate = new Date(note.sessionDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return noteDate >= start && noteDate <= end;
    });
  }

  /**
   * Create a new therapist note
   */
  async createNote(note: Omit<TherapistNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<TherapistNote> {
    return therapistApiClient.createNote(
      note.clientId,
      note.sessionDate,
      note.content,
      {
        mood: note.mood,
        progress: note.progress,
        goalCompletion: note.goalCompletion,
        isPrivate: note.isPrivate
      }
    );
  }

  /**
   * Update an existing therapist note
   */
  async updateNote(id: ID, note: Partial<TherapistNote>): Promise<TherapistNote> {
    return therapistApiClient.updateNote(id, note);
  }

  /**
   * Delete a therapist note
   */
  async deleteNote(id: ID): Promise<boolean> {
    return therapistApiClient.deleteNote(id);
  }
}