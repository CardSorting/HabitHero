import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Plus,
  Trophy,
  Target,
  Calendar,
  Clock,
  Heart,
  Moon,
  BookOpen,
  Activity,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Import from our wellness-challenges feature
import { 
  WellnessChallengeProvider, 
  useWellnessChallenge,
  ChallengeType, 
  ChallengeStatus, 
  ChallengeFrequency 
} from '../features/wellness-challenges';

/**
 * Main entry point for the Wellness Challenges feature
 */
const WellnessChallenges: React.FC = () => {
  const { user } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // CreateChallengeForm component
  const CreateChallengeForm: React.FC<{
    onSuccess: () => void;
    onCancel: () => void;
  }> = ({ onSuccess, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ChallengeType>(ChallengeType.EMOTIONS);
    const [frequency, setFrequency] = useState<ChallengeFrequency>(ChallengeFrequency.DAILY);
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [targetValue, setTargetValue] = useState<number>(1);
    
    // Form submission handler would use the wellness challenge context to create
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real implementation, we would call createChallenge from the context
      console.log('Creating challenge:', { title, description, type, frequency, startDate, endDate, targetValue });
      onSuccess();
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              placeholder="Daily Meditation"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              placeholder="Take 10 minutes each day to focus on mindful breathing"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">Type</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as ChallengeType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value={ChallengeType.EMOTIONS}>Emotions</option>
                <option value={ChallengeType.MEDITATION}>Meditation</option>
                <option value={ChallengeType.JOURNALING}>Journaling</option>
                <option value={ChallengeType.ACTIVITY}>Activity</option>
                <option value={ChallengeType.CUSTOM}>Custom</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="frequency" className="text-sm font-medium">Frequency</label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ChallengeFrequency)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value={ChallengeFrequency.DAILY}>Daily</option>
                <option value={ChallengeFrequency.WEEKLY}>Weekly</option>
                <option value={ChallengeFrequency.MONTHLY}>Monthly</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="targetValue" className="text-sm font-medium">Target Value</label>
            <input
              id="targetValue"
              type="number"
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(parseInt(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              required
            />
            <p className="text-xs text-muted-foreground">The amount you aim to achieve (times, minutes, etc.)</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Create Challenge</Button>
        </div>
      </form>
    );
  };
  
  // WellnessChallengesList component - uses the context
  const WellnessChallengesList: React.FC<{
    status?: ChallengeStatus;
  }> = ({ status }) => {
    // Use the wellness challenge context
    const { challenges, loading, error, refreshChallenges } = useWellnessChallenge();
    const [, navigate] = useLocation();
    
    // Filter challenges by status if provided
    const filteredChallenges = status 
      ? challenges.filter(challenge => challenge.status === status)
      : challenges;
      
    // Effect to load challenges on mount
    useEffect(() => {
      refreshChallenges();
    }, [refreshChallenges]);
    
    // Handle loading state
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    // Handle error state
    if (error) {
      return (
        <Card className="col-span-full bg-red-50">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Error loading challenges</h3>
            <p className="text-sm text-red-600 mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>
            <Button 
              onClick={() => refreshChallenges()}
              variant="outline"
              className="mx-auto"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Empty state when no challenges exist
    if (filteredChallenges.length === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">No challenges yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first wellness challenge to start tracking your progress
              </p>
              <Button 
                onClick={() => setCreateModalOpen(true)}
                className="mx-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Challenge
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Function to get the appropriate icon for challenge type
    const getTypeIcon = (type: ChallengeType) => {
      switch (type) {
        case ChallengeType.EMOTIONS:
          return <Heart className="h-5 w-5 text-red-500" />;
        case ChallengeType.MEDITATION:
          return <Moon className="h-5 w-5 text-blue-500" />;
        case ChallengeType.JOURNALING:
          return <BookOpen className="h-5 w-5 text-green-500" />;
        case ChallengeType.ACTIVITY:
          return <Activity className="h-5 w-5 text-orange-500" />;
        default:
          return <Target className="h-5 w-5 text-purple-500" />;
      }
    };
    
    // Function to get the appropriate status badge
    const getStatusBadge = (status: ChallengeStatus) => {
      switch (status) {
        case ChallengeStatus.ACTIVE:
          return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
        case ChallengeStatus.COMPLETED:
          return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
        case ChallengeStatus.ABANDONED:
          return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Abandoned</Badge>;
        default:
          return null;
      }
    };
    
    // Display the list of challenges
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges.map(challenge => (
          <Card key={challenge.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {getTypeIcon(challenge.challengeType as ChallengeType)}
                  <CardTitle className="ml-2 text-lg">{challenge.title}</CardTitle>
                </div>
                {getStatusBadge(challenge.status as ChallengeStatus)}
              </div>
              {challenge.description && (
                <CardDescription className="mt-2">
                  {challenge.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                  <span className="font-medium flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Target: {challenge.targetValue}
                  </span>
                </div>
                
                <Progress value={40} className="h-2" />
                
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">40%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pb-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/wellness-challenges/${challenge.id}`)}
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <PageTransition>
      <WellnessChallengeProvider userId={user?.id}>
        <div className="w-full h-full min-h-screen pb-16">
          <div className="container py-6 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Wellness Challenges</h1>
                <p className="text-gray-500 mt-1">
                  Track your wellness goals and build healthy habits
                </p>
              </div>
              
              <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4 md:mt-0">
                    <Plus className="mr-2 h-4 w-4" />
                    New Challenge
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Wellness Challenge</DialogTitle>
                    <DialogDescription>
                      Set up your new wellness challenge and start tracking your progress
                    </DialogDescription>
                  </DialogHeader>
                  <CreateChallengeForm 
                    onSuccess={() => setCreateModalOpen(false)}
                    onCancel={() => setCreateModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="mb-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Challenges</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  <WellnessChallengesList />
                </TabsContent>
                
                <TabsContent value="active" className="mt-0">
                  <WellnessChallengesList />
                </TabsContent>
                
                <TabsContent value="completed" className="mt-0">
                  <WellnessChallengesList />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Insights Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                    Challenge Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm font-medium">Highest Streak</span>
                        </div>
                        <span className="text-sm font-bold">0 days</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                        <span className="text-sm font-bold">0</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-purple-500 mr-2" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                        <span className="text-sm font-bold">0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* How It Works Card */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    How Wellness Challenges Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-medium text-sm">Create a Challenge</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Choose a focus area and set a target that feels achievable
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">Track Daily</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Record your progress consistently to build momentum
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">Review Progress</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Analyze your patterns weekly to identify what's working
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </WellnessChallengeProvider>
    </PageTransition>
  );
};

export default WellnessChallenges;