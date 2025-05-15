/**
 * Component to display a list of treatment plans for a client
 * Following SOLID principles, DDD, and Clean Architecture
 */
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  TreatmentPlan, 
  ID, 
  TreatmentPlanStatus,
  GoalStatus
} from '../../domain/entities';
import { useTreatmentPlans } from '../hooks/useTreatmentPlans';
import TreatmentPlanForm from './TreatmentPlanForm';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

// Icons
import { 
  Calendar, 
  Check, 
  Clock,
  FileEdit, 
  FileText, 
  MoreVertical, 
  Plus, 
  Target, 
  Trash2,
  AlertCircle
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<ID | null>(null);
  
  const {
    plans,
    isLoadingPlans,
    createTreatmentPlan,
    isCreating,
    updateTreatmentPlan,
    isUpdating,
    deleteTreatmentPlan,
    isDeleting
  } = useTreatmentPlans({ clientId, therapistId });
  
  // Handler for creating a new treatment plan
  const handleCreatePlan = (planData: any) => {
    createTreatmentPlan(planData);
    setIsCreateOpen(false);
  };
  
  // Handler for updating a treatment plan
  const handleUpdatePlan = (planData: any) => {
    if (editingPlan) {
      updateTreatmentPlan({ id: editingPlan.id, updates: planData });
      setEditingPlan(null);
    }
  };
  
  // Handler for deleting a treatment plan
  const handleDeletePlan = () => {
    if (deletingPlanId !== null) {
      deleteTreatmentPlan(deletingPlanId);
      setDeletingPlanId(null);
    }
  };
  
  // Get color for status badge
  const getStatusColor = (status: TreatmentPlanStatus) => {
    switch (status) {
      case TreatmentPlanStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case TreatmentPlanStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case TreatmentPlanStatus.ABANDONED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return format(new Date(dateStr), 'MMM d, yyyy');
  };
  
  // Calculate completion percentage based on goals
  const calculateCompletionPercentage = (plan: TreatmentPlan) => {
    if (!plan.goals || plan.goals.length === 0) return 0;
    
    const achievedGoals = plan.goals.filter(goal => goal.status === GoalStatus.ACHIEVED).length;
    return Math.round((achievedGoals / plan.goals.length) * 100);
  };
  
  return (
    <div>
      {/* Create Treatment Plan Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Treatment Plan
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create Treatment Plan</DialogTitle>
            <DialogDescription>
              Create a new treatment plan for {clientName}
            </DialogDescription>
          </DialogHeader>
          <TreatmentPlanForm
            clientId={clientId}
            therapistId={therapistId}
            onSubmit={handleCreatePlan}
            isSubmitting={isCreating}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Treatment Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Treatment Plan</DialogTitle>
            <DialogDescription>
              Update the treatment plan for {clientName}
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <TreatmentPlanForm
              clientId={clientId}
              therapistId={therapistId}
              initialData={editingPlan}
              onSubmit={handleUpdatePlan}
              isSubmitting={isUpdating}
              onCancel={() => setEditingPlan(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingPlanId !== null} onOpenChange={(open) => !open && setDeletingPlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              treatment plan and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Treatment Plans List */}
      {isLoadingPlans ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>Loading treatment plans...</p>
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-medium">Treatment Plans</h3>
          <Accordion type="multiple" className="w-full">
            {plans.map((plan) => (
              <AccordionItem key={plan.id} value={`plan-${plan.id}`}>
                <AccordionTrigger className="hover:no-underline px-4">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      <span>{plan.title}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(plan.startDate)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                        <p className="text-sm flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Progress</h4>
                        <p className="text-sm">
                          {calculateCompletionPercentage(plan)}% Complete
                        </p>
                      </div>
                      
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingPlan(plan)}>
                              <FileEdit className="mr-2 h-4 w-4" /> Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingPlanId(plan.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Plan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {plan.description && (
                      <div>
                        <h4 className="text-sm font-medium">Description</h4>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    )}
                    
                    {/* Goals Section */}
                    {plan.goals && plan.goals.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Goals</h4>
                        <ul className="space-y-2">
                          {plan.goals.map((goal, index) => (
                            <li key={index} className="text-sm border p-2 rounded-md">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <Target className="mr-2 h-4 w-4 text-blue-600" />
                                    <span>{goal.description}</span>
                                  </div>
                                  {goal.notes && (
                                    <p className="ml-6 text-muted-foreground text-xs mt-1">
                                      {goal.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  {goal.targetDate && (
                                    <span className="text-xs text-muted-foreground mr-2 flex items-center">
                                      <Clock className="mr-1 h-3 w-3" />
                                      {formatDate(goal.targetDate)}
                                    </span>
                                  )}
                                  <Badge className={
                                    goal.status === GoalStatus.ACHIEVED 
                                      ? 'bg-green-100 text-green-800' 
                                      : goal.status === GoalStatus.IN_PROGRESS
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                  }>
                                    {goal.status}
                                  </Badge>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Assessments Section */}
                    {plan.assessments && plan.assessments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Assessments</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {plan.assessments.map((assessment, index) => (
                              <TableRow key={index}>
                                <TableCell>{assessment.name}</TableCell>
                                <TableCell>{formatDate(assessment.date)}</TableCell>
                                <TableCell>{assessment.score ?? 'N/A'}</TableCell>
                                <TableCell>{assessment.notes || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    {/* Interventions Section */}
                    {plan.interventions && plan.interventions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Interventions</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Frequency</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {plan.interventions.map((intervention, index) => (
                              <TableRow key={index}>
                                <TableCell>{intervention.name}</TableCell>
                                <TableCell>{intervention.description}</TableCell>
                                <TableCell>{intervention.frequency}</TableCell>
                                <TableCell>{intervention.notes || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p>No treatment plans have been created yet.</p>
          <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Treatment Plan
          </Button>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlanList;