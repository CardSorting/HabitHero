/**
 * API implementation of ITreatmentPlanRepository
 */
import {
  ID,
  TreatmentPlan
} from '../../domain/entities';
import { ITreatmentPlanRepository } from '../../domain/repositories';
import { therapistApiClient } from '../api/apiClient';

/**
 * API-based implementation of the treatment plan repository
 */
export class ApiTreatmentPlanRepository implements ITreatmentPlanRepository {
  /**
   * Get all treatment plans created by a therapist
   */
  async getTreatmentPlansForTherapist(therapistId: ID): Promise<TreatmentPlan[]> {
    // In a real implementation, this would fetch all plans for the therapist
    // Since our API doesn't have this endpoint yet, we'll return an empty array
    return [];
  }

  /**
   * Get all treatment plans for a specific client
   */
  async getTreatmentPlansForClient(therapistId: ID, clientId: ID): Promise<TreatmentPlan[]> {
    return therapistApiClient.getClientTreatmentPlans(clientId);
  }

  /**
   * Get a specific treatment plan by ID
   */
  async getTreatmentPlanById(id: ID): Promise<TreatmentPlan | undefined> {
    try {
      return await therapistApiClient.getTreatmentPlanById(id);
    } catch (error) {
      if ((error as any)?.status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Create a new treatment plan
   */
  async createTreatmentPlan(
    plan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TreatmentPlan> {
    return therapistApiClient.createTreatmentPlan(plan);
  }

  /**
   * Update an existing treatment plan
   */
  async updateTreatmentPlan(id: ID, plan: Partial<TreatmentPlan>): Promise<TreatmentPlan> {
    return therapistApiClient.updateTreatmentPlan(id, plan);
  }

  /**
   * Delete a treatment plan
   */
  async deleteTreatmentPlan(id: ID): Promise<boolean> {
    return therapistApiClient.deleteTreatmentPlan(id);
  }
}