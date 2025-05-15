/**
 * Treatment Plans Page
 * Provides a consolidated view of all treatment plans for a client
 * Following SOLID principles, DDD, and Clean Architecture
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useTherapistContext } from '../hooks/useTherapistContext';
import { useClientDetails } from '../../application/hooks/useClientDetails';
import { useTreatmentPlans } from '../hooks/useTreatmentPlans';
import { TreatmentPlanList } from '../components/TreatmentPlanList';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, ArrowLeft } from 'lucide-react';

/**
 * Page component for displaying and managing treatment plans
 */
export default function TreatmentPlans() {
  const [, setLocation] = useLocation();
  const { clientId } = useParams<{ clientId: string }>();
  const { therapistId } = useTherapistContext();
  const clientIdNum = parseInt(clientId, 10);
  
  // Fetch client details
  const { 
    client,
    isLoading: isLoadingClient,
    isError: isClientError
  } = useClientDetails(clientIdNum);
  
  // Fetch treatment plans
  const {
    plans,
    isLoadingPlans,
    isPlansError,
    deleteTreatmentPlan,
    isDeleting
  } = useTreatmentPlans({ clientId: clientIdNum, therapistId });
  
  // Handle delete action
  const handleDelete = async (planId: number) => {
    try {
      await deleteTreatmentPlan(planId);
      toast({
        title: "Success",
        description: "Treatment plan has been deleted.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete treatment plan.",
        variant: "destructive",
      });
    }
  };
  
  // Handle create action
  const handleCreate = () => {
    setLocation(`/therapist/clients/${clientId}/treatment-plans/new`);
  };
  
  // Handle edit action
  const handleEdit = (planId: number) => {
    setLocation(`/therapist/clients/${clientId}/treatment-plans/${planId}/edit`);
  };
  
  // Handle view action
  const handleView = (planId: number) => {
    setLocation(`/therapist/clients/${clientId}/treatment-plans/${planId}`);
  };
  
  // Error state
  if (isClientError || isPlansError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/therapist/clients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Error</h1>
        </div>
        <div className="p-6 bg-destructive/10 rounded-lg">
          <p>An error occurred while loading data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/therapist/clients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {isLoadingClient ? (
            <Skeleton className="h-8 w-64 ml-2" />
          ) : (
            <h1 className="text-2xl font-bold ml-2">
              Treatment Plans for {client?.fullName || client?.username}
            </h1>
          )}
        </div>
        <Button onClick={handleCreate} className="ml-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Treatment Plan
        </Button>
      </div>
      
      {/* Client summary card */}
      {isLoadingClient ? (
        <div className="mb-6 p-6 border rounded-lg shadow-sm">
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : (
        <div className="mb-6 p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Client Summary</h2>
          <p className="text-sm text-muted-foreground mb-1">
            <span className="font-medium">Username:</span> {client?.username}
          </p>
          {client?.email && (
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium">Email:</span> {client.email}
            </p>
          )}
          {client?.fullName && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Full Name:</span> {client.fullName}
            </p>
          )}
        </div>
      )}
      
      {/* Treatment plans list */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Treatment Plans</h2>
        {isLoadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 border rounded-lg shadow-sm">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <div className="flex justify-end">
                  <Skeleton className="h-9 w-20 mr-2" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <TreatmentPlanList
            plans={plans}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        ) : (
          <div className="p-6 border rounded-lg shadow-sm text-center">
            <p className="text-muted-foreground mb-4">No treatment plans found for this client.</p>
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Treatment Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}