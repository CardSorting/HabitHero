/**
 * Treatment Plan List Component
 * Displays a list of treatment plans in a card-based layout
 * Following SOLID principles, DDD, and Clean Architecture
 */
import React from 'react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Goal
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TreatmentPlan, TreatmentPlanStatus, ID } from '../../domain/entities';

interface TreatmentPlanListProps {
  plans: TreatmentPlan[];
  onView: (id: ID) => void;
  onEdit: (id: ID) => void;
  onDelete: (id: ID) => void;
  isDeleting: boolean;
}

// Helper function to get status badge color
const getStatusColor = (status: TreatmentPlanStatus) => {
  switch (status) {
    case TreatmentPlanStatus.ACTIVE:
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case TreatmentPlanStatus.COMPLETED:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case TreatmentPlanStatus.ABANDONED:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: TreatmentPlanStatus) => {
  switch (status) {
    case TreatmentPlanStatus.ACTIVE:
      return <Clock className="h-3 w-3 mr-1" />;
    case TreatmentPlanStatus.COMPLETED:
      return <CheckCircle className="h-3 w-3 mr-1" />;
    case TreatmentPlanStatus.ABANDONED:
      return <AlertCircle className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
};

// Format date utility function
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Not specified';
  try {
    return format(new Date(dateString), 'PP');
  } catch (error) {
    return 'Invalid date';
  }
};

// Count active goals utility function
const countActiveGoals = (plan: TreatmentPlan) => {
  if (!plan.goals || plan.goals.length === 0) return 0;
  return plan.goals.length;
};

export function TreatmentPlanList({ 
  plans, 
  onView, 
  onEdit, 
  onDelete,
  isDeleting 
}: TreatmentPlanListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {plans && plans.length > 0 ? (
        plans.map((plan) => (
          <Card key={plan.id} className="shadow-sm border">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {plan.description || 'No description provided'}
                  </CardDescription>
                </div>
                <Badge 
                  className={`ml-2 ${getStatusColor(plan.status as TreatmentPlanStatus)}`}
                  variant="outline"
                >
                  {getStatusIcon(plan.status as TreatmentPlanStatus)}
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2">
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">{formatDate(plan.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="font-medium">{formatDate(plan.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goals:</span>
                  <span className="font-medium flex items-center">
                    <Goal className="h-3 w-3 mr-1" />
                    {countActiveGoals(plan)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-end space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onView(plan.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => onEdit(plan.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit plan</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the treatment plan "{plan.title}".
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(plan.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-2 text-center p-6">
          <p className="text-muted-foreground">No treatment plans found.</p>
        </div>
      )}
    </div>
  );
}