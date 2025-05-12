/**
 * React Context for Wellness Challenge feature
 * Provides access to challenge data and operations throughout component tree
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WellnessChallenge, 
  WellnessChallengeWithDetails, 
  ChallengeGoal, 
  ChallengeProgress, 
  ChallengeType,
  ChallengeFrequency,
  ChallengeStatus,
  CreateChallengeData,
  UpdateChallengeData,
  CreateChallengeGoalData,
  CreateChallengeProgressData
} from '../../domain/models';
import { getWellnessChallengeService } from '../services/serviceFactory';
import { WellnessChallengeService } from '../../application/WellnessChallengeService';

// Create service instance
const wellnessChallengeService = getWellnessChallengeService();

// Context state type
interface WellnessChallengeContextType {
  // Data state
  challenges: WellnessChallenge[];
  selectedChallenge: WellnessChallengeWithDetails | null;
  loading: boolean;
  error: Error | null;
  
  // Actions
  refreshChallenges: () => Promise<void>;
  selectChallenge: (id: number) => Promise<void>;
  createChallenge: (data: CreateChallengeData) => Promise<WellnessChallenge>;
  updateChallenge: (id: number, data: UpdateChallengeData) => Promise<WellnessChallenge>;
  deleteChallenge: (id: number) => Promise<boolean>;
  updateChallengeStatus: (id: number, status: ChallengeStatus) => Promise<WellnessChallenge>;
  createChallengeGoal: (data: CreateChallengeGoalData) => Promise<ChallengeGoal>;
  recordProgress: (data: CreateChallengeProgressData) => Promise<ChallengeProgress>;
}

// Create context with default values
const WellnessChallengeContext = createContext<WellnessChallengeContextType>({
  challenges: [],
  selectedChallenge: null,
  loading: false,
  error: null,
  
  refreshChallenges: async () => {},
  selectChallenge: async () => {},
  createChallenge: async () => {
    throw new Error('Not implemented');
  },
  updateChallenge: async () => {
    throw new Error('Not implemented');
  },
  deleteChallenge: async () => false,
  updateChallengeStatus: async () => {
    throw new Error('Not implemented');
  },
  createChallengeGoal: async () => {
    throw new Error('Not implemented');
  },
  recordProgress: async () => {
    throw new Error('Not implemented');
  },
});

// Context provider props type
interface WellnessChallengeProviderProps {
  children: ReactNode;
  userId?: number;
}

// Context provider component
export const WellnessChallengeProvider: React.FC<WellnessChallengeProviderProps> = ({
  children,
  userId,
}) => {
  // State
  const [challenges, setChallenges] = useState<WellnessChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<WellnessChallengeWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Load challenges on mount or userId change
  useEffect(() => {
    if (userId) {
      refreshChallenges();
    }
  }, [userId]);
  
  // Methods
  const refreshChallenges = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await wellnessChallengeService.getChallengesForUser(userId);
      setChallenges(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load challenges'));
      console.error('Error loading challenges:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const selectChallenge = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await wellnessChallengeService.getChallengeById(id);
      setSelectedChallenge(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load challenge details'));
      console.error('Error loading challenge details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const createChallenge = async (data: CreateChallengeData): Promise<WellnessChallenge> => {
    setLoading(true);
    setError(null);
    
    try {
      const newChallenge = await wellnessChallengeService.createChallenge(data);
      await refreshChallenges();
      return newChallenge;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create challenge'));
      console.error('Error creating challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateChallenge = async (id: number, data: UpdateChallengeData): Promise<WellnessChallenge> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedChallenge = await wellnessChallengeService.updateChallenge(id, data);
      
      // Update local state
      if (selectedChallenge && selectedChallenge.id === id) {
        setSelectedChallenge({
          ...selectedChallenge,
          ...updatedChallenge,
        });
      }
      
      await refreshChallenges();
      return updatedChallenge;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update challenge'));
      console.error('Error updating challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteChallenge = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await wellnessChallengeService.deleteChallenge(id);
      
      // Update local state
      if (selectedChallenge && selectedChallenge.id === id) {
        setSelectedChallenge(null);
      }
      
      await refreshChallenges();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete challenge'));
      console.error('Error deleting challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateChallengeStatus = async (id: number, status: ChallengeStatus): Promise<WellnessChallenge> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedChallenge = await wellnessChallengeService.updateChallengeStatus(id, status);
      
      // Update local state
      if (selectedChallenge && selectedChallenge.id === id) {
        setSelectedChallenge({
          ...selectedChallenge,
          status,
        });
      }
      
      await refreshChallenges();
      return updatedChallenge;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update challenge status'));
      console.error('Error updating challenge status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const createChallengeGoal = async (data: CreateChallengeGoalData): Promise<ChallengeGoal> => {
    setLoading(true);
    setError(null);
    
    try {
      const newGoal = await wellnessChallengeService.createChallengeGoal(data);
      
      // Update selected challenge if this goal is for the currently selected challenge
      if (selectedChallenge && selectedChallenge.id === data.challengeId) {
        await selectChallenge(data.challengeId);
      }
      
      return newGoal;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create goal'));
      console.error('Error creating goal:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const recordProgress = async (data: CreateChallengeProgressData): Promise<ChallengeProgress> => {
    setLoading(true);
    setError(null);
    
    try {
      const progress = await wellnessChallengeService.recordChallengeProgress(data);
      
      // Update selected challenge if this progress is for the currently selected challenge
      if (selectedChallenge && selectedChallenge.id === data.challengeId) {
        await selectChallenge(data.challengeId);
      }
      
      return progress;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to record progress'));
      console.error('Error recording progress:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const contextValue: WellnessChallengeContextType = {
    challenges,
    selectedChallenge,
    loading,
    error,
    refreshChallenges,
    selectChallenge,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    updateChallengeStatus,
    createChallengeGoal,
    recordProgress,
  };
  
  return (
    <WellnessChallengeContext.Provider value={contextValue}>
      {children}
    </WellnessChallengeContext.Provider>
  );
};

// Custom hook to use the wellness challenge context
export const useWellnessChallenge = () => useContext(WellnessChallengeContext);