/**
 * Implementation of the WellnessChallengeRepository interface using API calls
 */
import { 
  WellnessChallenge, 
  WellnessChallengeWithDetails, 
  ChallengeGoal, 
  ChallengeProgress, 
  ChallengeSummary,
  ChallengeStreak,
  ChallengeType,
  ChallengeFrequency,
  ChallengeStatus,
  CreateChallengeData,
  UpdateChallengeData,
  CreateChallengeGoalData,
  CreateChallengeProgressData
} from '../domain/models';
import { WellnessChallengeRepository } from '../domain/WellnessChallengeRepository';
import { queryClient } from '@/lib/queryClient';

/**
 * API implementation of WellnessChallengeRepository
 * Makes HTTP requests to the server to store and retrieve wellness challenge data
 */
export class ApiWellnessChallengeRepository implements WellnessChallengeRepository {
  // Helper methods
  private async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private async put<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private async delete(url: string): Promise<boolean> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return true;
  }
  
  // Challenge retrieval methods
  async getChallengeById(id: number): Promise<WellnessChallengeWithDetails> {
    return this.get<WellnessChallengeWithDetails>(`/api/wellness-challenges/${id}`);
  }
  
  async getChallengesForUser(userId: number): Promise<WellnessChallenge[]> {
    return this.get<WellnessChallenge[]>(`/api/wellness-challenges/user/${userId}`);
  }
  
  async getChallengesByStatus(userId: number, status: ChallengeStatus): Promise<WellnessChallenge[]> {
    return this.get<WellnessChallenge[]>(`/api/wellness-challenges/user/${userId}/status/${status}`);
  }
  
  async getChallengesByType(userId: number, type: ChallengeType): Promise<WellnessChallenge[]> {
    return this.get<WellnessChallenge[]>(`/api/wellness-challenges/user/${userId}/type/${type}`);
  }
  
  async getChallengesByFrequency(userId: number, frequency: ChallengeFrequency): Promise<WellnessChallenge[]> {
    return this.get<WellnessChallenge[]>(`/api/wellness-challenges/user/${userId}/frequency/${frequency}`);
  }
  
  async getChallengesByDateRange(userId: number, startDate: string, endDate: string): Promise<WellnessChallenge[]> {
    return this.get<WellnessChallenge[]>(
      `/api/wellness-challenges/user/${userId}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  }
  
  // Challenge management methods
  async createChallenge(data: CreateChallengeData): Promise<WellnessChallenge> {
    const challenge = await this.post<WellnessChallenge>('/api/wellness-challenges', data);
    await queryClient.invalidateQueries({ queryKey: ['/api/wellness-challenges'] });
    return challenge;
  }
  
  async updateChallenge(id: number, data: UpdateChallengeData): Promise<WellnessChallenge> {
    const challenge = await this.put<WellnessChallenge>(`/api/wellness-challenges/${id}`, data);
    await queryClient.invalidateQueries({ queryKey: ['/api/wellness-challenges'] });
    await queryClient.invalidateQueries({ queryKey: ['/api/wellness-challenges', id] });
    return challenge;
  }
  
  async deleteChallenge(id: number): Promise<boolean> {
    const result = await this.delete(`/api/wellness-challenges/${id}`);
    await queryClient.invalidateQueries({ queryKey: ['/api/wellness-challenges'] });
    return result;
  }
  
  async updateChallengeStatus(id: number, status: ChallengeStatus): Promise<WellnessChallenge> {
    const challenge = await this.put<WellnessChallenge>(`/api/wellness-challenges/${id}/status`, { status });
    await queryClient.invalidateQueries({ queryKey: ['/api/wellness-challenges'] });
    await queryClient.invalidateQueries({ queryKey: ['/api/wellness-challenges', id] });
    return challenge;
  }
  
  // Goals related methods
  async createChallengeGoal(data: CreateChallengeGoalData): Promise<ChallengeGoal> {
    const goal = await this.post<ChallengeGoal>('/api/wellness-challenges/goals', data);
    await queryClient.invalidateQueries({ queryKey: ['/api/wellness-challenges', data.challengeId] });
    return goal;
  }
  
  async getGoalsForChallenge(challengeId: number): Promise<ChallengeGoal[]> {
    return this.get<ChallengeGoal[]>(`/api/wellness-challenges/${challengeId}/goals`);
  }
  
  // Progress related methods
  async recordChallengeProgress(data: CreateChallengeProgressData): Promise<ChallengeProgress> {
    const progress = await this.post<ChallengeProgress>('/api/wellness-challenges/progress', data);
    await queryClient.invalidateQueries({ queryKey: ['/api/wellness-challenges', data.challengeId] });
    return progress;
  }
  
  async getProgressForChallenge(challengeId: number): Promise<ChallengeProgress[]> {
    return this.get<ChallengeProgress[]>(`/api/wellness-challenges/${challengeId}/progress`);
  }
  
  async getProgressForDate(userId: number, date: string): Promise<ChallengeProgress[]> {
    return this.get<ChallengeProgress[]>(`/api/wellness-challenges/user/${userId}/progress/date/${date}`);
  }
  
  // Analytics related methods
  async getChallengeSummary(userId: number): Promise<ChallengeSummary> {
    return this.get<ChallengeSummary>(`/api/wellness-challenges/user/${userId}/summary`);
  }
  
  async getChallengeStreak(challengeId: number): Promise<ChallengeStreak> {
    return this.get<ChallengeStreak>(`/api/wellness-challenges/${challengeId}/streak`);
  }
}