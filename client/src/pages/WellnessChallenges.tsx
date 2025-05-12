import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Target,
  Heart,
  Brain,
  BookOpen,
  Activity,
  ArrowRight,
  Feather,
  Shield,
  Gauge,
  Users
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
// Interface for tracking abandoned challenges
interface AbandonedChallenge {
  id: string;
  timestamp: number;
}

const WellnessChallenges: React.FC = () => {
  const { user } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [, navigate] = useLocation();
  const [abandonedChallenges, setAbandonedChallenges] = useState<string[]>([]);
  
  // Fetch active challenges from API
  const { data: activeChallenges = [], isLoading: isLoadingChallenges } = useQuery<any[]>({
    queryKey: ['/api/wellness-challenges/status/active'],
    enabled: !!user
  });
  
  // Load abandoned challenges from localStorage
  useEffect(() => {
    const storedAbandoned = localStorage.getItem('abandonedChallenges');
    if (storedAbandoned) {
      try {
        const parsed: AbandonedChallenge[] = JSON.parse(storedAbandoned);
        // Only consider challenges abandoned in the last 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const validAbandoned = parsed
          .filter(challenge => challenge.timestamp > thirtyDaysAgo)
          .map(challenge => challenge.id);
        
        setAbandonedChallenges(validAbandoned);
      } catch (e) {
        console.error('Error parsing abandoned challenges', e);
        setAbandonedChallenges([]);
      }
    }
  }, []);
  
  // Categories of wellness challenges
  const challengeTypes = [
    { name: 'emotions', displayName: 'Emotions', icon: <Heart className="h-6 w-6 text-red-500" />, color: 'bg-red-100' },
    { name: 'meditation', displayName: 'Meditation', icon: <Brain className="h-6 w-6 text-blue-500" />, color: 'bg-blue-100' },
    { name: 'journaling', displayName: 'Journaling', icon: <BookOpen className="h-6 w-6 text-green-500" />, color: 'bg-green-100' },
    { name: 'activity', displayName: 'Activity', icon: <Activity className="h-6 w-6 text-orange-500" />, color: 'bg-orange-100' },
    // New DBT categories
    { name: 'mindfulness', displayName: 'Mindfulness', icon: <Feather className="h-6 w-6 text-teal-500" />, color: 'bg-teal-100' },
    { name: 'distress_tolerance', displayName: 'Distress Tolerance', icon: <Shield className="h-6 w-6 text-red-500" />, color: 'bg-red-100' },
    { name: 'emotion_regulation', displayName: 'Emotion Regulation', icon: <Gauge className="h-6 w-6 text-purple-500" />, color: 'bg-purple-100' },
    { name: 'interpersonal_effectiveness', displayName: 'Interpersonal', icon: <Users className="h-6 w-6 text-blue-500" />, color: 'bg-blue-100' },
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
          {/* Active Challenges Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Your Active Challenges</h2>
            
            {/* Challenge Cards */}
            <div className="space-y-3">
              {isLoadingChallenges ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-gray-600">Loading challenges...</p>
                  </CardContent>
                </Card>
              ) : activeChallenges.length > 0 ? (
                activeChallenges.map((challenge: any) => {
                  // Determine the category icon and style
                  let categoryIcon = <Heart className="h-5 w-5 text-red-500" />;
                  let categoryColor = "bg-red-100";
                  let borderColor = "border-l-red-400";
                  let progressColor = "bg-red-400";
                  
                  if (challenge.type === 'meditation') {
                    categoryIcon = <Brain className="h-5 w-5 text-blue-500" />;
                    categoryColor = "bg-blue-100";
                    borderColor = "border-l-blue-400";
                    progressColor = "bg-blue-400";
                  } else if (challenge.type === 'journaling') {
                    categoryIcon = <BookOpen className="h-5 w-5 text-green-500" />;
                    categoryColor = "bg-green-100";
                    borderColor = "border-l-green-400";
                    progressColor = "bg-green-400";
                  } else if (challenge.type === 'activity') {
                    categoryIcon = <Activity className="h-5 w-5 text-orange-500" />;
                    categoryColor = "bg-orange-100";
                    borderColor = "border-l-orange-400";
                    progressColor = "bg-orange-400";
                  } else if (challenge.type === 'mindfulness') {
                    categoryIcon = <Feather className="h-5 w-5 text-teal-500" />;
                    categoryColor = "bg-teal-100";
                    borderColor = "border-l-teal-400";
                    progressColor = "bg-teal-400";
                  } else if (challenge.type === 'distress_tolerance') {
                    categoryIcon = <Shield className="h-5 w-5 text-red-500" />;
                    categoryColor = "bg-red-100";
                    borderColor = "border-l-red-400";
                    progressColor = "bg-red-400";
                  } else if (challenge.type === 'emotion_regulation') {
                    categoryIcon = <Gauge className="h-5 w-5 text-purple-500" />;
                    categoryColor = "bg-purple-100";
                    borderColor = "border-l-purple-400";
                    progressColor = "bg-purple-400";
                  } else if (challenge.type === 'interpersonal_effectiveness') {
                    categoryIcon = <Users className="h-5 w-5 text-blue-500" />;
                    categoryColor = "bg-blue-100";
                    borderColor = "border-l-blue-400";
                    progressColor = "bg-blue-400";
                  }
                  
                  // Calculate progress (hardcoded for now - would be replaced with real progress data)
                  const progressValue = 33;
                  const currentValue = Math.round((challenge.targetValue || 1) * (progressValue / 100));
                  
                  return (
                    <Card key={challenge.id} className={`overflow-hidden border-l-4 ${borderColor}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`${categoryColor} p-2 rounded-full mr-3`}>
                              {categoryIcon}
                            </div>
                            <div>
                              <h3 className="font-semibold">{challenge.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)} • {challenge.frequency}
                              </p>
                            </div>
                          </div>
                          <div className="bg-green-100 text-green-700 text-xs py-1 px-2 rounded-full">
                            Active
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress Today</span>
                            <span className="font-medium">{currentValue}/{challenge.targetValue || 1}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${progressColor} rounded-full`} style={{ width: `${progressValue}%` }}></div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => navigate(`/wellness-challenges/${challenge.id}`)}
                        >
                          View Challenge
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-3">You don't have any active challenges</p>
                    <Button 
                      onClick={() => navigate('/wellness-challenges/categories/emotions')}
                    >
                      Browse Challenges
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Challenge categories */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Browse Challenge Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {challengeTypes.map((type) => (
                <Card 
                  key={type.name} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => navigate(`/wellness-challenges/categories/${type.name}`)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full ${type.color} mb-2`}>
                      {type.icon}
                    </div>
                    <span className="font-medium">{type.displayName}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  <div className="grid grid-cols-2 gap-2 mt-1 max-h-56 overflow-y-auto">
                    {challengeTypes.map((type) => (
                      <div 
                        key={type.name}
                        className="border rounded-md p-2 flex items-center cursor-pointer hover:bg-accent"
                      >
                        <div className={`p-1 rounded-full ${type.color} mr-2`}>
                          {React.cloneElement(type.icon, { className: 'h-4 w-4' })}
                        </div>
                        <span className="text-sm">{type.displayName}</span>
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