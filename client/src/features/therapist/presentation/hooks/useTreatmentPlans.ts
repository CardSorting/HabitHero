/**
 * Custom hook for treatment plan CRUD operations
 * Following SOLID principles, DDD, Clean Architecture, and CQRS pattern
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { TreatmentPlan, ID } from '../../domain/entities';
import { toast } from '@/hooks/use-toast';

interface UseTreatmentPlansProps {
  clientId: ID;
  therapistId: ID;
}

// Type for creating treatment plan
export interface CreateTreatmentPlanDto {
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'abandoned';
  startDate: string;
  endDate?: string;
  clientId: ID;
  therapistId: ID;
  goals?: any[];
  interventions?: any[];
  assessments?: any[];
  diagnosisInfo?: any;
  progressTracking?: any;
  dischargePlan?: any;
}

// Type for updating treatment plan
export interface UpdateTreatmentPlanDto {
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'abandoned';
  startDate?: string;
  endDate?: string;
  goals?: any[];
  interventions?: any[];
  assessments?: any[];
  diagnosisInfo?: any;
  progressTracking?: any;
  dischargePlan?: any;
}

/**
 * Custom hook for treatment plan management following CQRS pattern
 */
export function useTreatmentPlans({ clientId, therapistId }: UseTreatmentPlansProps) {
  const queryClient = useQueryClient();
  const plansQueryKey = [`/api/therapist/clients/${clientId}/treatment-plans`];
  
  // Query: Fetch treatment plans
  const {
    data: plans,
    isLoading: isLoadingPlans,
    isError: isPlansError,
    error: plansError,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: plansQueryKey,
    queryFn: async () => {
      const response = await apiRequest({
        url: `/api/therapist/clients/${clientId}/treatment-plans`,
        method: 'GET',
      });
      return response as TreatmentPlan[];
    },
    enabled: Boolean(clientId && therapistId),
  });
  
  // Helper function to get a specific plan by ID
  const getPlanById = (planId: ID): TreatmentPlan | undefined => {
    if (!plans) return undefined;
    return plans.find((plan: TreatmentPlan) => plan.id === planId);
  };
  
  // Command: Create a new treatment plan
  const {
    mutate: createTreatmentPlan,
    isPending: isCreating,
  } = useMutation({
    mutationFn: async (data: CreateTreatmentPlanDto) => {
      const response = await apiRequest({
        url: `/api/therapist/clients/${clientId}/treatment-plans`,
        method: 'POST',
        data: {
          ...data,
          clientId,
          therapistId
        },
      });
      return response as TreatmentPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plansQueryKey });
      toast({
        title: "Success",
        description: "Treatment plan created successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create treatment plan: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Command: Update a treatment plan
  const {
    mutate: updateTreatmentPlan,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: async ({ id, updates }: { id: ID, updates: UpdateTreatmentPlanDto }) => {
      const response = await apiRequest({
        url: `/api/therapist/clients/${clientId}/treatment-plans/${id}`,
        method: 'PUT',
        data: updates,
      });
      return response as TreatmentPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plansQueryKey });
      toast({
        title: "Success",
        description: "Treatment plan updated successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update treatment plan: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Command: Delete a treatment plan
  const {
    mutate: deleteTreatmentPlan,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: async (id: ID) => {
      const response = await apiRequest({
        url: `/api/therapist/clients/${clientId}/treatment-plans/${id}`,
        method: 'DELETE',
      });
      return response as { success: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plansQueryKey });
      toast({
        title: "Success",
        description: "Treatment plan deleted successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete treatment plan: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  return {
    plans,
    isLoadingPlans,
    isPlansError,
    plansError,
    refetchPlans,
    getPlanById,
    createTreatmentPlan,
    isCreating,
    updateTreatmentPlan,
    isUpdating,
    deleteTreatmentPlan,
    isDeleting,
  };
}