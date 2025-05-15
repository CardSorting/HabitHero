/**
 * Hook for managing treatment plans
 * Provides query and mutation functions for treatment plans
 * Following SOLID principles, Clean Architecture, DDD, and CQRS
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTherapistService } from './useTherapistContext';
import {
  ID,
  DateString,
  TreatmentPlan,
  TreatmentGoal,
  Assessment,
  Intervention,
  TreatmentPlanStatus
} from '../../domain/entities';

interface UseTreatmentPlansOptions {
  clientId: ID;
  therapistId?: ID;
}

/**
 * Hook for managing treatment plans
 */
export function useTreatmentPlans({ clientId, therapistId }: UseTreatmentPlansOptions) {
  const therapistService = useTherapistService();
  const { toast } = useToast();
  
  // Query to fetch treatment plans for a client
  const {
    data: plans,
    isLoading: isLoadingPlans,
    isError: isPlansError,
    error: plansError,
    refetch: refetchPlans
  } = useQuery({
    queryKey: ['/api/therapist/clients', clientId, 'treatment-plans'],
    queryFn: () => therapistService.getClientTreatmentPlans(therapistId || 0, clientId),
    enabled: !!clientId && !!therapistId
  });
  
  // Mutation to create a new treatment plan
  const {
    mutate: createTreatmentPlan,
    isPending: isCreating
  } = useMutation({
    mutationFn: (planData: {
      title: string;
      description?: string;
      startDate: DateString;
      endDate?: DateString;
      status?: TreatmentPlanStatus;
      goals?: TreatmentGoal[];
      assessments?: Assessment[];
      interventions?: Intervention[];
    }) => therapistService.createTreatmentPlan(
      therapistId || 0,
      clientId,
      planData.title,
      {
        description: planData.description,
        startDate: planData.startDate,
        endDate: planData.endDate,
        status: planData.status,
        goals: planData.goals,
        assessments: planData.assessments,
        interventions: planData.interventions
      }
    ),
    onSuccess: () => {
      toast({
        title: "Treatment plan created",
        description: "The treatment plan has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients', clientId, 'treatment-plans'] });
    },
    onError: (error: any) => {
      console.error('Error creating treatment plan:', error);
      toast({
        title: "Error creating treatment plan",
        description: error.message || "An error occurred while creating the treatment plan.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation to update a treatment plan
  const {
    mutate: updateTreatmentPlan,
    isPending: isUpdating
  } = useMutation({
    mutationFn: ({ id, updates }: { id: ID, updates: Partial<TreatmentPlan> }) =>
      therapistService.updateTreatmentPlan(id, therapistId || 0, updates),
    onSuccess: () => {
      toast({
        title: "Treatment plan updated",
        description: "The treatment plan has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients', clientId, 'treatment-plans'] });
    },
    onError: (error: any) => {
      console.error('Error updating treatment plan:', error);
      toast({
        title: "Error updating treatment plan",
        description: error.message || "An error occurred while updating the treatment plan.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation to delete a treatment plan
  const {
    mutate: deleteTreatmentPlan,
    isPending: isDeleting
  } = useMutation({
    mutationFn: (id: ID) => therapistService.deleteTreatmentPlan(id, therapistId || 0),
    onSuccess: () => {
      toast({
        title: "Treatment plan deleted",
        description: "The treatment plan has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients', clientId, 'treatment-plans'] });
    },
    onError: (error: any) => {
      console.error('Error deleting treatment plan:', error);
      toast({
        title: "Error deleting treatment plan",
        description: error.message || "An error occurred while deleting the treatment plan.",
        variant: "destructive"
      });
    }
  });
  
  return {
    plans,
    isLoadingPlans,
    isPlansError,
    plansError,
    refetchPlans,
    createTreatmentPlan,
    isCreating,
    updateTreatmentPlan,
    isUpdating,
    deleteTreatmentPlan,
    isDeleting
  };
}