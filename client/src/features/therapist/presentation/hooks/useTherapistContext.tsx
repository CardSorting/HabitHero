/**
 * Context provider for therapist related data
 * Following SOLID principles, DDD, and Clean Architecture
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ID } from '../../domain/entities';

interface TherapistContextType {
  therapistId: ID;
  setTherapistId: (id: ID) => void;
  // Add other therapist related context properties as needed
}

const TherapistContext = createContext<TherapistContextType | undefined>(undefined);

export function TherapistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [therapistId, setTherapistId] = useState<ID>(0);
  
  // Initialize therapist ID based on authenticated user
  useEffect(() => {
    if (user?.id && user.role === 'therapist') {
      setTherapistId(user.id);
    }
  }, [user]);
  
  return (
    <TherapistContext.Provider value={{ therapistId, setTherapistId }}>
      {children}
    </TherapistContext.Provider>
  );
}

export function useTherapistContext() {
  const context = useContext(TherapistContext);
  
  if (context === undefined) {
    throw new Error('useTherapistContext must be used within a TherapistProvider');
  }
  
  return context;
}