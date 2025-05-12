import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PageTransition } from '@/components/page-transition';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Heart, 
  Brain, 
  BookOpen, 
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  PlusCircle,
  Target,
  Trophy
} from 'lucide-react';

/**
 * Page to view and manage a specific wellness challenge
 */
const WellnessChallengeDetails: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute('/wellness-challenges/:id');
  const challengeId = params?.id;
  
  // Mock data for the challenge based on the ID
  const getChallengeData = (id: string) => {
    const typeMap = {
      '1': { type: 'emotions', icon: <Heart className="h-6 w-6 text-red-500" />, color: 'bg-red-100', borderColor: 'border-red-400', title: 'Daily Gratitude Practice', target: 3, progress: 1 },
      '2': { type: 'emotions', icon: <Heart className="h-6 w-6 text-red-500" />, color: 'bg-red-100', borderColor: 'border-red-400', title: 'Emotion Tracking', target: 5, progress: 2 },
      '3': { type: 'meditation', icon: <Brain className="h-6 w-6 text-blue-500" />, color: 'bg-blue-100', borderColor: 'border-blue-400', title: 'Morning Mindfulness', target: 10, progress: 0 },
      '4': { type: 'meditation', icon: <Brain className="h-6 w-6 text-blue-500" />, color: 'bg-blue-100', borderColor: 'border-blue-400', title: 'Breath Awareness', target: 5, progress: 3 },
      '5': { type: 'journaling', icon: <BookOpen className="h-6 w-6 text-green-500" />, color: 'bg-green-100', borderColor: 'border-green-400', title: 'Evening Reflection', target: 1, progress: 0 },
      '6': { type: 'journaling', icon: <BookOpen className="h-6 w-6 text-green-500" />, color: 'bg-green-100', borderColor: 'border-green-400', title: 'Thought Reframing', target: 3, progress: 1 },
      '7': { type: 'activity', icon: <Activity className="h-6 w-6 text-orange-500" />, color: 'bg-orange-100', borderColor: 'border-orange-400', title: 'Daily Movement', target: 30, progress: 15 },
      '8': { type: 'activity', icon: <Activity className="h-6 w-6 text-orange-500" />, color: 'bg-orange-100', borderColor: 'border-orange-400', title: 'Hydration Habit', target: 8, progress: 4 },
    };
    
    return typeMap[id as keyof typeof typeMap] || typeMap['1'];
  };
  
  const challenge = getChallengeData(challengeId || '1');
  const progressPercent = (challenge.progress / challenge.target) * 100;
  
  // State to track if recording progress
  const [showRecordProgress, setShowRecordProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(challenge.progress);
  
  // Mock goals for the challenge
  const goals = [
    { id: 1, description: challenge.type === 'emotions' ? 'Write at least three items daily' : 
                          challenge.type === 'meditation' ? 'Meditate for 10 minutes each morning' :
                          challenge.type === 'journaling' ? 'Write at least 200 words each evening' :
                          'Move for at least 30 minutes daily', 
      completed: progressPercent >= 100 },
    { id: 2, description: challenge.type === 'emotions' ? 'Include at least one new item each day' : 
                          challenge.type === 'meditation' ? 'Practice before checking your phone' :
                          challenge.type === 'journaling' ? 'Include both challenges and wins' :
                          'Include variety in your activities', 
      completed: false },
    { id: 3, description: challenge.type === 'emotions' ? 'Reflect on why you\'re grateful for these things' : 
                          challenge.type === 'meditation' ? 'Notice improvements in morning energy' :
                          challenge.type === 'journaling' ? 'Note one lesson learned each day' :
                          'Note your energy levels after activity', 
      completed: false },
  ];
  
  // Mock streak data
  const streak = 2;
  const longestStreak = 5;
  
  // Handle record progress
  const handleSaveProgress = () => {
    setShowRecordProgress(false);
    // Here we would normally save to the API
  };
  
  return (
    <PageTransition>
      <div className="pb-16">
        {/* Header with gradient background */}
        <div className={`${challenge.color} pt-6 pb-16 px-4 relative`}>
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 mb-1 text-foreground" 
            onClick={() => navigate('/wellness-challenges')}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          
          <div className="flex items-center mt-2">
            <div className="bg-white/80 p-3 rounded-full mr-3">
              {challenge.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{challenge.title}</h1>
              <p className="text-foreground/70 text-sm">
                {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)} • Daily • Active
              </p>
            </div>
          </div>
          
          {/* Progress card that overlaps the header */}
          <Card className="absolute -bottom-14 left-4 right-4 shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold">Today's Progress</h3>
                <span className="font-medium">{challenge.progress}/{challenge.target}</span>
              </div>
              
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full rounded-full ${
                    challenge.type === 'emotions' ? 'bg-red-400' :
                    challenge.type === 'meditation' ? 'bg-blue-400' :
                    challenge.type === 'journaling' ? 'bg-green-400' :
                    'bg-orange-400'
                  }`} 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              
              {showRecordProgress ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">Progress:</span>
                    <input 
                      type="range" 
                      min="0" 
                      max={challenge.target}
                      value={progressValue}
                      onChange={(e) => setProgressValue(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="ml-2 font-medium">{progressValue}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowRecordProgress(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleSaveProgress}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => setShowRecordProgress(true)}
                >
                  Record Progress
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="mt-16 p-4 space-y-6">
          {/* Goals section */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Challenge Goals</h2>
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {goals.map((goal) => (
                    <li key={goal.id} className="flex items-start">
                      <div className={`p-1 rounded-full mt-0.5 mr-3 ${goal.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {goal.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <PlusCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <span className={goal.completed ? 'line-through text-muted-foreground' : ''}>
                        {goal.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Stats section */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Challenge Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold">{streak}</span>
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold">{longestStreak}</span>
                  <span className="text-sm text-muted-foreground">Longest Streak</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold">75%</span>
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold">12</span>
                  <span className="text-sm text-muted-foreground">Days Active</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WellnessChallengeDetails;