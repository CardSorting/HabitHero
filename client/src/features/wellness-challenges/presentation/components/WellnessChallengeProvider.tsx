import React from 'react';
import { WellnessChallengeProvider as Provider } from '../context/WellnessChallengeContext';

interface WellnessChallengeProviderProps {
  children: React.ReactNode;
  userId?: number;
}

/**
 * Global provider for Wellness Challenge feature
 * Wraps the context provider with any additional setup needed
 */
export const WellnessChallengeProvider: React.FC<WellnessChallengeProviderProps> = ({ 
  children,
  userId 
}) => {
  return (
    <Provider initialUserId={userId}>
      {children}
    </Provider>
  );
};