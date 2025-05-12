import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  Plus,
  Trophy,
  Target,
  Calendar,
  Clock,
  Heart
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Main entry point for the Wellness Challenges feature
 */
const WellnessChallenges: React.FC = () => {
  const { user } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // SimpleChallengesList component without context for stability
  const SimpleChallengesList = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empty state when no challenges exist */}
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
  };
  
  return (
    <PageTransition>
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
                <div className="space-y-4 py-4">
                  <p>Challenge form will go here with proper validation</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => setCreateModalOpen(false)}>Create Challenge</Button>
                  </div>
                </div>
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
                <SimpleChallengesList />
              </TabsContent>
              
              <TabsContent value="active" className="mt-0">
                <SimpleChallengesList />
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <SimpleChallengesList />
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
    </PageTransition>
  );
};

export default WellnessChallenges;