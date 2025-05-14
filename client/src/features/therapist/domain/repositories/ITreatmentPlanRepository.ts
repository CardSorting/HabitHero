/**
 * Repository interface for treatment plans operations
 * Following Clean Architecture and SOLID principles
 */

import { TreatmentPlan, ID } from '../entities';

/**
 * Interface for treatment plan repositories following Repository Pattern
 */
export interface ITreatmentPlanRepository {
  /**
   * Get all treatment plans created by a therapist
   * @param therapistId The ID of the therapist
   * @returns A promise resolving to an array of treatment plans
   */
  getTreatmentPlansForTherapist(therapistId: ID): Promise<TreatmentPlan[]>;

  /**
   * Get all treatment plans for a specific client
   * @param therapistId The ID of the therapist
   * @param clientId The ID of the client
   * @returns A promise resolving to an array of treatment plans
   */
  getTreatmentPlansForClient(therapistId: ID, clientId: ID): Promise<TreatmentPlan[]>;

  /**
   * Get a specific treatment plan by ID
   * @param id The ID of the treatment plan
   * @returns A promise resolving to a treatment plan or undefined if not found
   */
  getTreatmentPlanById(id: ID): Promise<TreatmentPlan | undefined>;

  /**
   * Create a new treatment plan
   * @param plan The treatment plan to create
   * @returns A promise resolving to the created treatment plan
   */
  createTreatmentPlan(
    plan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TreatmentPlan>;

  /**
   * Update an existing treatment plan
   * @param id The ID of the treatment plan to update
   * @param plan The data to update
   * @returns A promise resolving to the updated treatment plan
   */
  updateTreatmentPlan(id: ID, plan: Partial<TreatmentPlan>): Promise<TreatmentPlan>;

  /**
   * Delete a treatment plan
   * @param id The ID of the treatment plan to delete
   * @returns A promise resolving to a boolean indicating success
   */
  deleteTreatmentPlan(id: ID): Promise<boolean>;
}