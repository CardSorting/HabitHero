/**
 * Component to display a list of treatment plans for a client
 * Following SOLID principles, DDD, and Clean Architecture
 * Refactored to use modern UI/UX patterns and dedicated pages
 */
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useLocation } from 'wouter';
import { 
  TreatmentPlan, 
  ID, 
  TreatmentPlanStatus,
  GoalStatus
} from '../../domain/entities';
import { useTreatmentPlans } from '../hooks/useTreatmentPlans';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
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
  Calendar, 
  Check, 
  Clock,
  ChevronRight,
  FileText, 
  MoreVertical, 
  Plus, 
  Target, 
  Trash2,
  AlertCircle,
  Activity
} from 'lucide-react';

interface TreatmentPlanListProps {
  clientId: ID;
  clientName: string;
  therapistId: ID;
}

/**
 * Component to display and manage treatment plans
 */
const TreatmentPlanList: React.FC<TreatmentPlanListProps> = ({
  clientId,
  clientName,
  therapistId,
}) => {
  const [, navigate] = useLocation();
  const [deletingPlanId, setDeletingPlanId] = useState<ID | null>(null);
  
  const {
    plans,
    isLoadingPlans,
    deleteTreatmentPlan,
    isDeleting
  } = useTreatmentPlans({ clientId, therapistId });
  
  // Handle navigation to create new plan
  const handleCreatePlan = () => {
    navigate(`/therapist/clients/${clientId}/treatment-plans/new`);
  };
  
  // Handle navigation to view plan details
  const handleViewPlan = (plan: TreatmentPlan) => {
    navigate(`/therapist/clients/${clientId}/treatment-plans/${plan.id}`);
  };
  
  // Handle navigation to edit plan
  const handleEditPlan = (plan: TreatmentPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/therapist/clients/${clientId}/treatment-plans/${plan.id}/edit`);
  };
  
  // Handler for deleting a treatment plan
  const handleDeletePlan = () => {
    if (deletingPlanId !== null) {
      deleteTreatmentPlan(deletingPlanId);
      setDeletingPlanId(null);
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
  
  return (
    <div>
      {/* Create Plan Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Treatment Plans</h3>
        <Button onClick={handleCreatePlan} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Create Plan
        </Button>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingPlanId !== null} onOpenChange={(open) => !open && setDeletingPlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Treatment Plan</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              treatment plan and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlan} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Treatment Plans List */}
      {isLoadingPlans ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[180px] w-full" />
          ))}
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewPlan(plan)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{plan.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      {getStatusBadge(plan.status)}
                      <span className="ml-2 text-xs">
                        Created {formatDate(plan.startDate)}
                      </span>
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={(e) => handleEditPlan(plan, e)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No description provided
                    </p>
                  )}
                  
                  <div className="space-y-2.5 mt-2">
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
                        <Progress 
                          value={calculateCompletionPercentage(plan)} 
                          className="h-2 w-24 mr-2"
                        />
                        <span className="font-medium text-xs">
                          {calculateCompletionPercentage(plan)}%
                        </span>
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
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-start group text-primary">
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
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
  );
};

export default TreatmentPlanList;