/**
 * Treatment Plans page for therapists
 * Provides a comprehensive interface for managing client treatment plans
 * Following SOLID principles, DDD, Clean Architecture, and CQRS pattern
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useTherapistService } from '../hooks';
import { useTreatmentPlans } from '../hooks/useTreatmentPlans';
import { ID } from '../../domain/entities';
import {
  TreatmentPlanForm,
  TreatmentPlanList
} from '../components';

// UI Components
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Icons
import { 
  ChevronLeft, 
  User, 
  Calendar, 
  Clock, 
  Brain,
  AlertCircle,
  Home
} from 'lucide-react';

const TreatmentPlansPage: React.FC = () => {
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId ? parseInt(params.clientId, 10) : 0;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const therapistService = useTherapistService();
  
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Fetch client details on component mount
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!user?.id || !clientId) return;
      
      try {
        setIsLoadingClient(true);
        setErrorMessage(null);
        
        // Verify authorization for this client
        const isAuthorized = await therapistService.isAuthorizedForClient(user.id, clientId);
        
        if (!isAuthorized) {
          setErrorMessage('You are not authorized to view this client.');
          setIsLoadingClient(false);
          return;
        }
        
        // Fetch client details
        const clientData = await therapistService.getClientById(user.id, clientId);
        
        if (!clientData) {
          setErrorMessage('Client not found.');
          setIsLoadingClient(false);
          return;
        }
        
        setClientDetails(clientData);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setErrorMessage('An error occurred while fetching client details.');
      } finally {
        setIsLoadingClient(false);
      }
    };
    
    fetchClientDetails();
  }, [clientId, user?.id, therapistService]);
  
  // Handle navigation back to client details
  const handleBackToClient = () => {
    navigate(`/therapist/clients/${clientId}`);
  };
  
  return (
    <div className="container max-w-screen-xl mx-auto py-6">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/therapist">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link href="/therapist/clients">
                Clients
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {clientDetails && (
              <>
                <BreadcrumbItem>
                  <Link href={`/therapist/clients/${clientId}`}>
                    {clientDetails.fullName || clientDetails.username}
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>Treatment Plans</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Back Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-6"
        onClick={handleBackToClient}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Client
      </Button>
      
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Treatment Plans
          {clientDetails && (
            <span className="text-muted-foreground ml-2 font-normal">
              for {clientDetails.fullName || clientDetails.username}
            </span>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          Create and manage treatment plans to track client goals, interventions, and progress.
        </p>
      </div>
      
      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading state */}
      {isLoadingClient ? (
        <Card className="mb-6">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading client details...</p>
          </CardContent>
        </Card>
      ) : clientDetails ? (
        <>
          {/* Treatment Plan Overview Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                Treatment Plans Overview
              </CardTitle>
              <CardDescription>
                Comprehensive treatment planning for {clientDetails.fullName || clientDetails.username}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Client ID</p>
                  <p className="font-medium">{clientDetails.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Client Since</p>
                  <p className="font-medium">{new Date(clientDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Primary Concerns</p>
                  <p className="font-medium">{clientDetails.primaryConcerns || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Treatment Plans Section */}
          <Card>
            <CardHeader>
              <CardTitle>Active Treatment Plans</CardTitle>
              <CardDescription>
                Manage and monitor treatment plans, goals, and interventions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientId && user?.id && (
                <TreatmentPlanList 
                  clientId={clientId} 
                  clientName={clientDetails.fullName || clientDetails.username}
                  therapistId={user.id}
                />
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Client not found or you don't have permission to view this client.</p>
            <Button
              variant="outline"
              onClick={() => navigate('/therapist/clients')}
              className="mt-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Clients
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TreatmentPlansPage;