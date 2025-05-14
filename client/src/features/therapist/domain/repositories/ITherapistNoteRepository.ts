/**
 * Repository interface for therapist notes operations
 * Following Clean Architecture and SOLID principles
 */

import { TherapistNote, ID, DateString } from '../entities';

/**
 * Interface for therapist notes repositories following Repository Pattern
 */
export interface ITherapistNoteRepository {
  /**
   * Get all notes created by a therapist for a specific client
   * @param therapistId The ID of the therapist
   * @param clientId The ID of the client
   * @returns A promise resolving to an array of therapist notes
   */
  getNotesForClient(therapistId: ID, clientId: ID): Promise<TherapistNote[]>;

  /**
   * Get a specific note by ID
   * @param id The ID of the note
   * @returns A promise resolving to a therapist note or undefined if not found
   */
  getNoteById(id: ID): Promise<TherapistNote | undefined>;

  /**
   * Get notes for a specific date range
   * @param therapistId The ID of the therapist
   * @param clientId The ID of the client
   * @param startDate The start date of the range
   * @param endDate The end date of the range
   * @returns A promise resolving to an array of therapist notes
   */
  getNotesForDateRange(
    therapistId: ID, 
    clientId: ID, 
    startDate: DateString, 
    endDate: DateString
  ): Promise<TherapistNote[]>;

  /**
   * Create a new therapist note
   * @param note The note to create
   * @returns A promise resolving to the created note
   */
  createNote(note: Omit<TherapistNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<TherapistNote>;

  /**
   * Update an existing therapist note
   * @param id The ID of the note to update
   * @param note The data to update
   * @returns A promise resolving to the updated note
   */
  updateNote(id: ID, note: Partial<TherapistNote>): Promise<TherapistNote>;

  /**
   * Delete a therapist note
   * @param id The ID of the note to delete
   * @returns A promise resolving to a boolean indicating success
   */
  deleteNote(id: ID): Promise<boolean>;
}