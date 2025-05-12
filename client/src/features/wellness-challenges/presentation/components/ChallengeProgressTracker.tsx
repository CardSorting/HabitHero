import React, { useState } from 'react';
import { format } from 'date-fns';
import { useWellnessChallenge } from '../context/WellnessChallengeContext';
import { useWellnessChallengeOperation } from '../context/WellnessChallengeContext';
import { WellnessChallenge } from '../../domain/models';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogHeader, DialogTitle, Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Calendar as CalendarIcon, Pencil } from 'lucide-react';

interface ChallengeProgressTrackerProps {
  challengeId: number;
}

export const ChallengeProgressTracker: React.FC<ChallengeProgressTrackerProps> = ({ 
  challengeId 
}) => {
  const { service } = useWellnessChallenge();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [progressNote, setProgressNote] = useState('');
  
  // Get challenge details
  const { data: challenge, loading: challengeLoading, error: challengeError } = 
    useWellnessChallengeOperation(
      (service) => service.getChallengeById(challengeId),
      [challengeId]
    );
  
  // Get progress for selected date
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: progress, loading: progressLoading, error: progressError, execute: refreshProgress } = 
    useWellnessChallengeOperation(
      (service) => service.getProgressForDate(challengeId, dateString),
      [challengeId, dateString]
    );
  
  const isCompleted = progress && progress.value >= (challenge?.targetValue || 1);
  const hasProgress = progress !== null;
  
  const handleToggleProgress = async () => {
    if (!service || !challenge) return;
    
    try {
      const newValue = hasProgress && isCompleted ? 0 : challenge.targetValue;
      await service.recordProgress(challengeId, dateString, newValue, progressNote);
      toast({
        title: isCompleted ? 'Progress Removed' : 'Progress Recorded',
        description: isCompleted
          ? `You've removed your progress for ${format(selectedDate, 'MMMM d')}`
          : `Great job completing your challenge for ${format(selectedDate, 'MMMM d')}!`,
      });
      refreshProgress();
    } catch (error) {
      console.error('Error recording progress:', error);
      toast({
        title: 'Error Recording Progress',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const handleUpdateNote = async () => {
    if (!service) return;
    
    try {
      const value = hasProgress ? progress.value : challenge?.targetValue || 1;
      await service.recordProgress(challengeId, dateString, value, progressNote);
      toast({
        title: 'Note Updated',
        description: 'Your progress note has been saved',
      });
      setNoteModalOpen(false);
      refreshProgress();
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error Updating Note',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  if (challengeLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Loading Challenge...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (challengeError || !challenge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-red-600">Error Loading Challenge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{challengeError || 'Challenge not found'}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Track Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar for selecting dates */}
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="mx-auto"
              disabled={(date) => {
                // Disable dates outside of challenge range
                const startDate = new Date(challenge.startDate);
                const endDate = new Date(challenge.endDate);
                return date < startDate || date > endDate;
              }}
            />
          </div>
          
          <div className="flex flex-col items-center text-center w-full">
            <h3 className="text-lg font-medium">{format(selectedDate, 'MMMM d, yyyy')}</h3>
            <p className="text-gray-500 text-sm">
              {isCompleted 
                ? 'Challenge completed for this day!' 
                : 'Have you completed this challenge today?'}
            </p>
            
            {progressLoading ? (
              <div className="mt-4 p-4">
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center space-y-4 w-full">
                <Button 
                  onClick={handleToggleProgress}
                  variant={isCompleted ? "outline" : "default"}
                  className={isCompleted ? "border-green-500 text-green-500 hover:bg-green-50" : ""}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Mark as Incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Mark as Complete
                    </>
                  )}
                </Button>
                
                {/* Notes section */}
                {hasProgress && (
                  <div className="w-full mt-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">Notes:</h4>
                      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Notes for {format(selectedDate, 'MMMM d')}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Textarea
                              value={progressNote}
                              onChange={(e) => setProgressNote(e.target.value)}
                              placeholder="Write your notes here..."
                              className="min-h-[120px]"
                            />
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setNoteModalOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateNote}>
                                Save Note
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {progress.notes ? progress.notes : 'No notes for this day.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {challenge.frequency === 'daily' 
            ? 'Complete this challenge every day'
            : challenge.frequency === 'weekly'
              ? 'Complete this challenge once per week'
              : 'Complete this challenge once per month'}
        </div>
        <div className="text-sm font-medium">
          Target: {challenge.targetValue} {challenge.targetValue > 1 ? 'times' : 'time'}
        </div>
      </CardFooter>
    </Card>
  );
};