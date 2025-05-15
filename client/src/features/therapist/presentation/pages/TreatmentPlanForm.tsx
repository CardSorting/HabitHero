/**
 * Treatment Plan Form Page
 * Provides a dedicated page for creating and editing treatment plans
 * Following SOLID principles, DDD, Clean Architecture, and CQRS pattern
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useTherapistService } from '../hooks';
import { useTreatmentPlans } from '../hooks/useTreatmentPlans';
import { TreatmentPlanForm as TreatmentPlanFormComponent } from '../components';
import { ID } from '../../domain/entities';

// UI Components
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Icons
import { 
  ChevronLeft, 
  AlertCircle, 
  Save,
  Home,
  FileText,
  Edit
} from 'lucide-react';

/**
 * Smart page component for creating/editing treatment plans
 */
const TreatmentPlanFormPage: React.FC = () => {
  const params = useParams<{ clientId: string, planId?: string }>();
  const clientId = params.clientId ? parseInt(params.clientId, 10) : 0;
  const planId = params.planId ? parseInt(params.planId, 10) : undefined;
  const isEditMode = !!planId;
  
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const therapistService = useTherapistService();
  
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const {
    plans,
    isLoadingPlans,
    createTreatmentPlan,
    isCreating,
    updateTreatmentPlan,
    isUpdating
  } = useTreatmentPlans({ 
    clientId, 
    therapistId: user?.id || 0 
  });
  
  // Get the plan if in edit mode
  const plan = isEditMode && plans ? plans.find(p => p.id === planId) : undefined;
  
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
  
  // Handle form submission
  const handleSubmit = (formData: any) => {
    if (isEditMode && planId) {
      updateTreatmentPlan({
        id: planId,
        updates: formData
      });
      navigate(`/therapist/clients/${clientId}/treatment-plans/${planId}`);
    } else {
      createTreatmentPlan(formData);
      navigate(`/therapist/clients/${clientId}/treatment-plans`);
    }
  };
  
  // Handle cancellation
  const handleCancel = () => {
    if (isEditMode && planId) {
      navigate(`/therapist/clients/${clientId}/treatment-plans/${planId}`);
    } else {
      navigate(`/therapist/clients/${clientId}/treatment-plans`);
    }
  };
  
  // Determine page title and description
  const pageTitle = isEditMode ? 'Edit Treatment Plan' : 'Create Treatment Plan';
  const pageDescription = isEditMode 
    ? 'Update the treatment plan details, goals, and interventions'
    : 'Create a new comprehensive treatment plan with goals and interventions';
  
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
              <Link href={`/therapist/clients/${clientId}/treatment-plans`}>
                Treatment Plans
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{isEditMode ? 'Edit Plan' : 'New Plan'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Back Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-6"
        onClick={handleCancel}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {isEditMode ? 'Back to Plan Details' : 'Back to Treatment Plans'}
      </Button>
      
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="flex items-center text-3xl font-bold tracking-tight">
          {isEditMode ? (
            <>
              <Edit className="h-6 w-6 mr-2 text-primary" />
              Edit Treatment Plan
            </>
          ) : (
            <>
              <FileText className="h-6 w-6 mr-2 text-primary" />
              Create Treatment Plan
            </>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          {pageDescription}
          {clientDetails && (
            <span> for {clientDetails.fullName || clientDetails.username}</span>
          )}
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
      
      {/* Loading state or form */}
      {isLoadingClient || (isEditMode && isLoadingPlans) ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : clientDetails ? (
        <Card>
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              Fill out the treatment plan details below. Use tabs to navigate through different sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditMode && !plan ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Treatment plan not found.</AlertDescription>
              </Alert>
            ) : (
              <TreatmentPlanFormComponent
                clientId={clientId}
                therapistId={user?.id || 0}
                initialData={plan}
                onSubmit={handleSubmit}
                isSubmitting={isEditMode ? isUpdating : isCreating}
                onCancel={handleCancel}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Client not found or you don't have permission to view this client.
            </p>
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

export default TreatmentPlanFormPage;