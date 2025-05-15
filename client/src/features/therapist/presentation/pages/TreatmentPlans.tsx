/**
 * Treatment Plans page for therapists
 * Provides a comprehensive interface for managing client treatment plans
 * Following SOLID principles, DDD, Clean Architecture, and CQRS pattern
 * Redesigned with modern UI/UX patterns for improved user experience
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, Route } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useTherapistService } from '../hooks';
import { useTreatmentPlans } from '../hooks/useTreatmentPlans';
import { TreatmentPlan, ID, TreatmentPlanStatus, GoalStatus } from '../../domain/entities';
import { format } from 'date-fns';

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
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Icons
import { 
  ChevronLeft, 
  ChevronRight,
  User, 
  Calendar, 
  Clock, 
  Brain,
  AlertCircle,
  Home,
  FileText,
  Plus,
  Target,
  Check,
  MoreVertical,
  FileEdit,
  Trash2,
  ArrowRight,
  BadgeCheck,
  Grid3X3,
  Activity,
  Workflow,
  BarChart4,
  TimerReset
} from 'lucide-react';

/**
 * Main component for the Treatment Plans page
 */
const TreatmentPlansPage: React.FC = () => {
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId ? parseInt(params.clientId, 10) : 0;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const therapistService = useTherapistService();
  
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const {
    plans,
    isLoadingPlans,
    createTreatmentPlan,
    isCreating,
    updateTreatmentPlan,
    isUpdating,
    deleteTreatmentPlan,
    isDeleting
  } = useTreatmentPlans({ clientId, therapistId: user?.id || 0 });
  
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
  
  // Handle plan deletion confirmation
  const handleDeletePlan = () => {
    if (selectedPlan) {
      deleteTreatmentPlan(selectedPlan.id);
      setSelectedPlan(null);
      setShowDeleteConfirm(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    return format(new Date(dateStr), 'MMM d, yyyy');
  };
  
  // Calculate completion percentage based on goals
  const calculateCompletionPercentage = (plan: TreatmentPlan) => {
    if (!plan.goals || plan.goals.length === 0) return 0;
    
    const achievedGoals = plan.goals.filter(goal => goal.status === GoalStatus.ACHIEVED).length;
    return Math.round((achievedGoals / plan.goals.length) * 100);
  };
  
  // Get status badge styling
  const getStatusBadge = (status: TreatmentPlanStatus) => {
    switch (status) {
      case TreatmentPlanStatus.ACTIVE:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case TreatmentPlanStatus.COMPLETED:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case TreatmentPlanStatus.ABANDONED:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Abandoned</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Create new treatment plan
  const handleCreatePlan = () => {
    navigate(`/therapist/clients/${clientId}/treatment-plans/new`);
  };
  
  // Edit existing treatment plan
  const handleEditPlan = (plan: TreatmentPlan) => {
    navigate(`/therapist/clients/${clientId}/treatment-plans/${plan.id}/edit`);
  };
  
  // View treatment plan details
  const handleViewPlan = (plan: TreatmentPlan) => {
    navigate(`/therapist/clients/${clientId}/treatment-plans/${plan.id}`);
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
      <div className="mb-6 flex justify-between items-center">
        <div>
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
        
        {/* Create new plan button */}
        {clientDetails && (
          <Button onClick={handleCreatePlan} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        )}
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
          <CardContent className="py-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : clientDetails ? (
        <>
          {/* Client Overview Card */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <User className="h-5 w-5 mr-2 text-primary" />
                Client Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Client Since
                  </div>
                  <p className="font-medium">{new Date(clientDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <Brain className="mr-2 h-4 w-4" />
                    Primary Concerns
                  </div>
                  <p className="font-medium">{clientDetails.primaryConcerns || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Status
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Active Client
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Treatment Plans Dashboard */}
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center">
              <Workflow className="h-5 w-5 mr-2 text-primary" />
              Treatment Plans
            </h2>
            
            {isLoadingPlans ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-[180px] w-full" />
                ))}
              </div>
            ) : plans && plans.length > 0 ? (
              <>
                {/* Treatment Plans Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewPlan(plan)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{plan.title}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEditPlan(plan);
                              }}>
                                <FileEdit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlan(plan);
                                  setShowDeleteConfirm(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription className="flex items-center mt-1">
                          {getStatusBadge(plan.status)}
                          <span className="mx-2">•</span>
                          <span className="text-xs">Created {formatDate(plan.startDate)}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        {plan.description ? (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {plan.description}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mb-4 italic">
                            No description provided
                          </p>
                        )}
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              Goals
                            </span>
                            <span className="font-medium">{plan.goals?.length || 0}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center">
                              <Activity className="h-4 w-4 mr-1" />
                              Progress
                            </span>
                            <div className="flex items-center">
                              <div className="w-24 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${calculateCompletionPercentage(plan)}%` }}
                                ></div>
                              </div>
                              <span className="font-medium">{calculateCompletionPercentage(plan)}%</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Timeline
                            </span>
                            <span className="font-medium">
                              {formatDate(plan.endDate) !== 'Not set' ? 
                                formatDate(plan.endDate) : 
                                'Ongoing'
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" className="w-full mt-2 justify-start group">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="bg-muted/40">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Treatment Plans</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Create your first treatment plan to start tracking goals, interventions, and client progress.
                  </p>
                  <Button onClick={handleCreatePlan}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Quick Actions Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center">
              <Grid3X3 className="h-5 w-5 mr-2 text-primary" />
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Activity className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-1">View Progress</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track goal achievement and treatment outcomes
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <BarChart4 className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-1">Assessment History</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View historical assessments and measurements
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Assessments
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <TimerReset className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-1">Treatment Timeline</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View chronological progress and milestones
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Timeline
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Treatment Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this treatment plan? This action cannot be undone and all plan data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlan}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TreatmentPlansPage;