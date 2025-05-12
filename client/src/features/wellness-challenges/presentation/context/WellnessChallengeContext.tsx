/**
 * Context provider for Wellness Challenge system
 * Provides the service to all child components
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createWellnessChallengeService } from '../../infrastructure/serviceFactory';
import { WellnessChallengeService } from '../../application/WellnessChallengeService';
import { 
  WellnessChallenge, 
  ChallengeGoal, 
  ChallengeProgress, 
  ChallengeSummary,
  ChallengeStreak,
  WellnessChallengeWithDetails,
  DateString,
  ChallengeFrequency,
  ChallengeStatus,
  ChallengeType,
  EmotionCategory,
  Emotion,
  UserEmotion
} from '../../domain/models';

// Context interface
interface WellnessChallengeContextValue {
  service: WellnessChallengeService | null;
  isLoading: boolean;
  error: string | null;
  userId: number | null;
  initialized: boolean;
  setUserId: (id: number) => void;
}

// Create the context
const WellnessChallengeContext = createContext<WellnessChallengeContextValue>({
  service: null,
  isLoading: false,
  error: null,
  userId: null,
  initialized: false,
  setUserId: () => {}
});

// Provider props interface
interface WellnessChallengeProviderProps {
  children: React.ReactNode;
  initialUserId?: number;
}

/**
 * Provider component
 */
export const WellnessChallengeProvider: React.FC<WellnessChallengeProviderProps> = ({ 
  children, 
  initialUserId 
}) => {
  const [service, setService] = useState<WellnessChallengeService | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(initialUserId || null);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  // Initialize the service when userId changes
  useEffect(() => {
    if (userId !== null) {
      try {
        const newService = createWellnessChallengeService(userId);
        setService(newService);
        setInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Error initializing wellness challenge service:', err);
        setError('Failed to initialize wellness challenge service');
        setService(null);
      }
    } else {
      setService(null);
      setInitialized(false);
    }
  }, [userId]);
  
  const value: WellnessChallengeContextValue = {
    service,
    isLoading,
    error,
    userId,
    initialized,
    setUserId
  };
  
  return (
    <WellnessChallengeContext.Provider value={value}>
      {children}
    </WellnessChallengeContext.Provider>
  );
};

/**
 * Custom hook to use the wellness challenge context
 */
export const useWellnessChallenge = () => {
  const context = useContext(WellnessChallengeContext);
  
  if (context === undefined) {
    throw new Error('useWellnessChallenge must be used within a WellnessChallengeProvider');
  }
  
  return context;
};

/**
 * Higher-order hook for wellness challenge operations with loading state
 */
export function useWellnessChallengeOperation<T>(
  operation: (service: WellnessChallengeService) => Promise<T>,
  dependencies: any[] = []
) {
  const { service, isLoading, error, initialized } = useWellnessChallenge();
  const [data, setData] = useState<T | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  
  const executeOperation = async () => {
    if (!service) return;
    
    setOperationLoading(true);
    setOperationError(null);
    
    try {
      const result = await operation(service);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setOperationError(errorMessage);
      console.error('Operation error:', err);
      return null;
    } finally {
      setOperationLoading(false);
    }
  };
  
  useEffect(() => {
    if (initialized && service) {
      executeOperation();
    }
  }, [initialized, service, ...dependencies]);
  
  return {
    data,
    loading: operationLoading || isLoading,
    error: operationError || error,
    execute: executeOperation
  };
}