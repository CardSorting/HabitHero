/**
 * Context and provider for therapist feature
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { TherapistService } from '../../application/services/TherapistService';
import { 
  ApiTherapistRepository, 
  ApiTherapistNoteRepository, 
  ApiTreatmentPlanRepository 
} from '../../infrastructure/repositories';

// Create the repositories
const therapistRepository = new ApiTherapistRepository();
const therapistNoteRepository = new ApiTherapistNoteRepository();
const treatmentPlanRepository = new ApiTreatmentPlanRepository();

// Create the service with the repositories
const therapistService = new TherapistService(
  therapistRepository,
  therapistNoteRepository,
  treatmentPlanRepository
);

// Create the context
const TherapistContext = createContext<TherapistService | undefined>(undefined);

/**
 * Provider component for the therapist context
 */
export const TherapistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <TherapistContext.Provider value={therapistService}>
      {children}
    </TherapistContext.Provider>
  );
};

/**
 * Hook to access the therapist service
 * @returns The therapist service
 */
export const useTherapistService = (): TherapistService => {
  const context = useContext(TherapistContext);
  
  if (context === undefined) {
    throw new Error('useTherapistService must be used within a TherapistProvider');
  }
  
  return context;
};