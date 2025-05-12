import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Target,
  Heart,
  Brain,
  BookOpen,
  Activity,
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

/**
 * Mobile-first implementation of the Wellness Challenges feature
 */
const WellnessChallenges: React.FC = () => {
  const { user } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [, navigate] = useLocation();
  
  // Categories of wellness challenges
  const challengeTypes = [
    { name: 'Emotions', icon: <Heart className="h-6 w-6 text-red-500" />, color: 'bg-red-100' },
    { name: 'Meditation', icon: <Brain className="h-6 w-6 text-blue-500" />, color: 'bg-blue-100' },
    { name: 'Journaling', icon: <BookOpen className="h-6 w-6 text-green-500" />, color: 'bg-green-100' },
    { name: 'Activity', icon: <Activity className="h-6 w-6 text-orange-500" />, color: 'bg-orange-100' },
  ];
  
  return (
    <PageTransition>
      <div className="pb-16">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-background pt-6 pb-4 px-4">
          <h1 className="text-2xl font-bold">Wellness Challenges</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your wellness goals and build healthy habits
          </p>
        </div>
        
        {/* Main content */}
        <div className="p-4">
          {/* Empty state - No challenges */}
          <Card className="mb-6">
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
                className="mb-2 w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Challenge
              </Button>
            </CardContent>
          </Card>
          
          {/* Challenge categories */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Challenge Categories</h2>
            <div className="grid grid-cols-2 gap-3">
              {challengeTypes.map((type) => (
                <Card 
                  key={type.name} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full ${type.color} mb-2`}>
                      {type.icon}
                    </div>
                    <span className="font-medium">{type.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* How it works section */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">How It Works</h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="font-medium">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Create a Challenge</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a focus area and set a target that feels achievable
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="font-medium">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Track Daily</h3>
                      <p className="text-sm text-muted-foreground">
                        Record your progress consistently to build momentum
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="font-medium">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Review Progress</h3>
                      <p className="text-sm text-muted-foreground">
                        Analyze your patterns weekly to identify what's working
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Floating action button for new challenge */}
        <div className="fixed bottom-20 right-4">
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        
        {/* New challenge dialog */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Challenge</DialogTitle>
              <DialogDescription>
                Set up a new wellness challenge to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="challenge-name" className="text-sm font-medium">
                    Challenge Name
                  </label>
                  <input
                    id="challenge-name"
                    placeholder="Daily Meditation"
                    className="flex h-10 w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Challenge Type</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {challengeTypes.map((type) => (
                      <div 
                        key={type.name}
                        className="border rounded-md p-2 flex items-center cursor-pointer hover:bg-accent"
                      >
                        <div className={`p-1 rounded-full ${type.color} mr-2`}>
                          {React.cloneElement(type.icon, { className: 'h-4 w-4' })}
                        </div>
                        <span className="text-sm">{type.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="target" className="text-sm font-medium">
                    Daily Target
                  </label>
                  <input
                    id="target"
                    type="number"
                    min="1"
                    placeholder="10"
                    className="flex h-10 w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The number of times or minutes per day
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setCreateModalOpen(false)}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default WellnessChallenges;