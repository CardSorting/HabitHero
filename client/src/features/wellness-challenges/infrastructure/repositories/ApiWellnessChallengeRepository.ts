/**
 * API implementation of the WellnessChallengeRepository
 * Uses API calls to fetch and manipulate wellness challenge data
 */

import { apiRequest } from "@/lib/queryClient";
import {
  ChallengeCategory,
  ChallengeId,
  ChallengeStatus,
  UserId,
  WellnessChallenge,
  WellnessChallengeFactory
} from "../../domain/models";
import { WellnessChallengeRepository } from "../../domain/repositories";

export class ApiWellnessChallengeRepository implements WellnessChallengeRepository {
  async getById(id: ChallengeId): Promise<WellnessChallenge | null> {
    try {
      const response = await apiRequest.get(`/api/wellness-challenges/${id}`);
      return WellnessChallengeFactory.createFromRaw(response);
    } catch (error) {
      console.error(`Error fetching challenge by ID ${id}:`, error);
      return null;
    }
  }

  async getAllByCategory(category: ChallengeCategory): Promise<WellnessChallenge[]> {
    try {
      const response = await apiRequest.get(`/api/wellness-challenges/type/${category}`);
      return response.map((item: any) => WellnessChallengeFactory.createFromRaw(item));
    } catch (error) {
      console.error(`Error fetching challenges by category ${category}:`, error);
      return [];
    }
  }

  async getAllByStatus(status: ChallengeStatus): Promise<WellnessChallenge[]> {
    try {
      const response = await apiRequest.get(`/api/wellness-challenges/status/${status}`);
      return response.map((item: any) => WellnessChallengeFactory.createFromRaw(item));
    } catch (error) {
      console.error(`Error fetching challenges by status ${status}:`, error);
      return [];
    }
  }

  async getActiveChallenges(userId: UserId): Promise<WellnessChallenge[]> {
    try {
      const response = await apiRequest.get(`/api/wellness-challenges/user/${userId}/active`);
      return response.map((item: any) => WellnessChallengeFactory.createFromRaw(item));
    } catch (error) {
      console.error(`Error fetching active challenges for user ${userId}:`, error);
      return [];
    }
  }

  async searchChallenges(query: string): Promise<WellnessChallenge[]> {
    try {
      const response = await apiRequest.get(`/api/wellness-challenges/search?q=${encodeURIComponent(query)}`);
      return response.map((item: any) => WellnessChallengeFactory.createFromRaw(item));
    } catch (error) {
      console.error(`Error searching challenges with query "${query}":`, error);
      return [];
    }
  }

  async save(challenge: WellnessChallenge): Promise<WellnessChallenge> {
    try {
      // If challenge has an ID, update it; otherwise create a new one
      const method = challenge.id ? 'put' : 'post';
      const endpoint = challenge.id 
        ? `/api/wellness-challenges/${challenge.id}` 
        : '/api/wellness-challenges';
      
      const response = await apiRequest[method](endpoint, challenge);
      return WellnessChallengeFactory.createFromRaw(response);
    } catch (error) {
      console.error(`Error saving challenge:`, error);
      throw error;
    }
  }

  async activateChallenge(id: ChallengeId, userId: UserId): Promise<WellnessChallenge> {
    try {
      const response = await apiRequest.post(`/api/wellness-challenges/${id}/activate`, { userId });
      return WellnessChallengeFactory.createFromRaw(response);
    } catch (error) {
      console.error(`Error activating challenge ${id} for user ${userId}:`, error);
      throw error;
    }
  }

  async abandonChallenge(id: ChallengeId, userId: UserId): Promise<WellnessChallenge> {
    try {
      const response = await apiRequest.post(`/api/wellness-challenges/${id}/abandon`, { userId });
      return WellnessChallengeFactory.createFromRaw(response);
    } catch (error) {
      console.error(`Error abandoning challenge ${id} for user ${userId}:`, error);
      throw error;
    }
  }

  async delete(id: ChallengeId): Promise<boolean> {
    try {
      await apiRequest.delete(`/api/wellness-challenges/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting challenge ${id}:`, error);
      return false;
    }
  }
}