/**
 * Crisis Tracker Page Component
 * Main page for Crisis Tracking functionality
 */

import React, { useState } from 'react';
import { CrisisTrackerForm } from '../components/CrisisTrackerForm';
import { useCrisisTracker } from '../hooks/useCrisisTracker';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  PlusCircle,
  ChevronRight,
  FileText,
  X,
  CheckCircle,
  Info,
  Tag,
  Activity
} from 'lucide-react';

import { CrisisEvent, CrisisIntensity, CrisisType } from '../../domain/models';

interface CrisisTrackerPageProps {
  userId: number;
}

export function CrisisTrackerPage({ userId }: CrisisTrackerPageProps) {
  const [activeTab, setActiveTab] = useState<string>('form');
  const [selectedEvent, setSelectedEvent] = useState<CrisisEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { crisisEvents, isLoadingEvents, eventsError } = useCrisisTracker(userId);

  // Get intensity badge color
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case CrisisIntensity.MILD:
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case CrisisIntensity.MODERATE:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case CrisisIntensity.SEVERE:
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case CrisisIntensity.EXTREME:
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get crisis type badge color
  const getCrisisTypeColor = (type: string) => {
    switch (type) {
      case CrisisType.PANIC_ATTACK:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case CrisisType.EMOTIONAL_CRISIS:
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case CrisisType.SUICIDAL_THOUGHTS:
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case CrisisType.SELF_HARM_URGE:
        return 'bg-pink-100 text-pink-800 hover:bg-pink-100';
      case CrisisType.SUBSTANCE_URGE:
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Format crisis type for display
  const formatCrisisType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Crisis Tracker</h1>
        <p className="text-muted-foreground">
          Record and track crisis events to identify patterns and develop effective coping strategies.
        </p>
      </div>

      <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="form" className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              Record New
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="form" className="pt-4">
          <CrisisTrackerForm 
            userId={userId} 
            onSuccess={() => setActiveTab('history')}
          />
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center">
                <FileText className="mr-2 h-6 w-6" />
                Crisis Event History
              </CardTitle>
              <CardDescription>
                Review your past crisis events to identify patterns and track progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                // Skeleton loading state
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              ) : eventsError ? (
                // Error state
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
                  <h3 className="text-lg font-medium">Error loading crisis events</h3>
                  <p className="text-muted-foreground">
                    There was a problem loading your crisis event history.
                  </p>
                </div>
              ) : !crisisEvents || crisisEvents.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">No crisis events recorded</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't recorded any crisis events yet.
                  </p>
                  <Button onClick={() => setActiveTab('form')}>
                    Record Your First Event
                  </Button>
                </div>
              ) : (
                // Data display
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Intensity</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crisisEvents.map((event: CrisisEvent) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium flex items-center">
                                <Calendar className="h-4 w-4 mr-1 opacity-70" />
                                {format(parseISO(event.date as string), 'MMM d, yyyy')}
                              </span>
                              {event.time && (
                                <span className="text-xs text-muted-foreground flex items-center mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {event.time}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(getCrisisTypeColor(event.type))}>
                              {formatCrisisType(event.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(getIntensityColor(event.intensity))}>
                              {event.intensity.charAt(0).toUpperCase() + event.intensity.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {event.duration ? `${event.duration} min` : '-'}
                          </TableCell>
                          <TableCell>
                            {event.notes ? (
                              <span className="line-clamp-2 text-sm">{event.notes}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">No notes</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Crisis Event Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
              Crisis Event Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected crisis event.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 opacity-70" />
                  <span className="font-medium">
                    {format(parseISO(selectedEvent.date as string), 'MMMM d, yyyy')}
                  </span>
                  {selectedEvent.time && (
                    <span className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {selectedEvent.time}
                    </span>
                  )}
                </div>
                <Badge className={cn(getIntensityColor(selectedEvent.intensity))}>
                  {selectedEvent.intensity.charAt(0).toUpperCase() + selectedEvent.intensity.slice(1)} Intensity
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Activity className="h-4 w-4 mr-1 opacity-70" />
                    Crisis Type
                  </h4>
                  <Badge className={cn(getCrisisTypeColor(selectedEvent.type))}>
                    {formatCrisisType(selectedEvent.type)}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Clock className="h-4 w-4 mr-1 opacity-70" />
                    Duration
                  </h4>
                  <p>{selectedEvent.duration ? `${selectedEvent.duration} minutes` : 'Not recorded'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <FileText className="h-4 w-4 mr-1 opacity-70" />
                  Notes
                </h4>
                <p className="text-sm rounded-md bg-secondary p-3">
                  {selectedEvent.notes || 'No notes recorded for this event.'}
                </p>
              </div>
              
              {selectedEvent.symptoms && Array.isArray(selectedEvent.symptoms) && selectedEvent.symptoms.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 mr-1 opacity-70" />
                    Symptoms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.symptoms.map((symptom: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-red-50">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.triggers && Array.isArray(selectedEvent.triggers) && selectedEvent.triggers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <Tag className="h-4 w-4 mr-1 opacity-70" />
                    Triggers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.triggers.map((trigger: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-yellow-50">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.copingStrategiesUsed && Array.isArray(selectedEvent.copingStrategiesUsed) && selectedEvent.copingStrategiesUsed.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 mr-1 opacity-70" />
                    Coping Strategies Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.copingStrategiesUsed.map((strategy: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-green-50">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Info className="h-4 w-4 mr-1 opacity-70" />
                    Professional Help
                  </h4>
                  <p>{selectedEvent.helpSought ? 'Yes' : 'No'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <AlertCircle className="h-4 w-4 mr-1 opacity-70" />
                    Medication Used
                  </h4>
                  <p>{selectedEvent.medication ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}