import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useWellnessChallengeOperation } from '../context/WellnessChallengeContext';
import { ChallengeProgressTracker } from '../components/ChallengeProgressTracker';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { format, differenceInDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Calendar, 
  CalendarDays, 
  ChevronLeft, 
  Clock, 
  Edit, 
  FilePenLine, 
  Flame, 
  LineChart, 
  MoreVertical, 
  Share2, 
  Trash, 
  Trophy 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ChallengeDetailsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const challengeId = parseInt(id);
  const { toast } = useToast();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('progress');

  // Get challenge with details
  const { data: challenge, loading, error, execute: refreshChallenge } = 
    useWellnessChallengeOperation(
      (service) => service.getChallengeWithDetails(challengeId),
      [challengeId]
    );

  // Delete challenge
  const handleDeleteChallenge = async () => {
    const { data: success } = await useWellnessChallengeOperation(
      (service) => service.deleteChallenge(challengeId),
      []
    );

    if (success) {
      toast({
        title: 'Challenge Deleted',
        description: 'Your wellness challenge has been deleted successfully',
      });
      navigate('/wellness-challenges');
    } else {
      toast({
        title: 'Error Deleting Challenge',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="w-full flex justify-center items-center min-h-[400px]">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading Challenge</CardTitle>
            <CardDescription className="text-red-600">
              We couldn't load the challenge details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error || 'Challenge not found'}</p>
            <div className="flex space-x-4 mt-6">
              <Button 
                variant="outline" 
                className="border-red-300 text-red-600" 
                onClick={() => refreshChallenge()}
              >
                Try Again
              </Button>
              <Button onClick={() => navigate('/wellness-challenges')}>
                Back to Challenges
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const daysTotal = differenceInDays(endDate, startDate) + 1;
  const daysElapsed = Math.min(
    differenceInDays(new Date(), startDate) + 1,
    daysTotal
  );
  const timeProgressPercent = Math.round((daysElapsed / daysTotal) * 100);

  // Calculate completion rate
  const goalValue = challenge.targetValue;
  const completedDays = challenge.progressEntries?.filter(entry => entry.value >= goalValue).length || 0;
  const completionRate = daysElapsed > 0 ? Math.round((completedDays / daysElapsed) * 100) : 0;

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* Back button and action menu */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center p-0 hover:bg-transparent" 
          onClick={() => navigate('/wellness-challenges')}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Challenges</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Challenge Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Challenge</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share Challenge</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete Challenge</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Challenge header card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Badge>{challenge.type}</Badge>
                <Badge variant={
                  challenge.status === 'active' 
                    ? 'default' 
                    : challenge.status === 'completed' 
                      ? 'outline' 
                      : 'destructive'
                }>
                  {challenge.status}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{challenge.title}</CardTitle>
              <CardDescription className="mt-1">
                {challenge.description || 'No description provided'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
              <CalendarDays className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold">{daysTotal} days</p>
              <p className="text-xs text-gray-500">
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
              <Flame className="h-6 w-6 text-orange-500 mb-2" />
              <p className="text-sm text-gray-500">Current Streak</p>
              <p className="font-semibold">{challenge.streak || 0} days</p>
              <p className="text-xs text-gray-500">
                {challenge.streak ? 'Keep it going!' : 'Start your streak today'}
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="font-semibold">{completionRate}%</p>
              <p className="text-xs text-gray-500">
                {completedDays} of {daysElapsed} days completed
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                Time Progress
              </span>
              <span className="font-medium">{timeProgressPercent}%</span>
            </div>
            <Progress value={timeProgressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{format(startDate, 'MMM d')}</span>
              <span>{format(endDate, 'MMM d')}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4 pb-4">
          <div className="w-full flex justify-end">
            <Button variant="outline" className="mr-2">
              <FilePenLine className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Track Today
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="progress" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="mt-0">
          <ChallengeProgressTracker challengeId={challengeId} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Progress History</CardTitle>
              <CardDescription>
                View your completed days and track your progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {challenge.progressEntries && challenge.progressEntries.length > 0 ? (
                <div className="space-y-4">
                  {challenge.progressEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                      <div key={entry.id} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            {entry.value >= challenge.targetValue ? (
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <Trophy className="h-4 w-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <Calendar className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{format(new Date(entry.date), 'MMMM d, yyyy')}</p>
                              <p className="text-sm text-gray-500">
                                {entry.value >= challenge.targetValue 
                                  ? 'Completed' 
                                  : 'Incomplete'}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            Value: {entry.value} / {challenge.targetValue}
                          </div>
                        </div>
                        {entry.notes && (
                          <div className="mt-2 ml-11">
                            <p className="text-sm text-gray-600">{entry.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No progress entries yet</p>
                  <Button className="mt-4" onClick={() => setActiveTab('progress')}>
                    Start Tracking Progress
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Insights</CardTitle>
              <CardDescription>
                Visualize your progress and get personalized insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                  {completionRate >= 80 ? (
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-green-700">Excellent Progress!</h3>
                      <p className="text-green-600 mt-2">
                        You're maintaining an exceptional completion rate of {completionRate}%. 
                        Keep up the great work!
                      </p>
                    </div>
                  ) : completionRate >= 50 ? (
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-blue-700">Good Progress</h3>
                      <p className="text-blue-600 mt-2">
                        You're making steady progress with a completion rate of {completionRate}%.
                        Keep working to boost this even higher!
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-yellow-700">Getting Started</h3>
                      <p className="text-yellow-600 mt-2">
                        You're at {completionRate}% completion rate. 
                        Remember that consistency is key to forming new habits!
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Completion Pattern</h3>
                    <p className="text-sm text-gray-600">
                      {challenge.progressEntries && challenge.progressEntries.length > 0 
                        ? `You've completed this challenge on ${completedDays} days so far. 
                          Your most consistent days appear to be on weekends.`
                        : 'Start tracking to see your completion patterns'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Improvement Areas</h3>
                    <p className="text-sm text-gray-600">
                      {completionRate < 70 
                        ? 'Try setting a specific time each day to complete this challenge.'
                        : "You're doing great! Consider increasing your target or trying a more challenging goal."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              wellness challenge and all associated progress data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChallenge}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};