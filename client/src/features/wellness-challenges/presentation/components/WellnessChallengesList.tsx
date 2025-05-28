import React from 'react';
import { useWellnessChallengeOperation } from '../context/WellnessChallengeContext';
import { ChallengeType, WellnessChallenge } from '../../domain/models';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  CheckCircle,
  CircleX,
  Hourglass,
  PieChart,
  ArrowRightCircle,
  Activity,
  BookOpen,
  HeartPulse,
  Smile,
  PencilLine
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const WellnessChallengesList: React.FC = () => {
  const { data: challenges, loading, error, execute: refreshChallenges } = 
    useWellnessChallengeOperation(
      (service) => service.getMyChallenges(),
      []
    );

  // Function to get type icon
  const getTypeIcon = (type: ChallengeType) => {
    switch (type) {
      case 'emotions':
        return <Smile className="h-4 w-4 mr-1" />;
      case 'meditation':
        return <HeartPulse className="h-4 w-4 mr-1" />;
      case 'journaling':
        return <PencilLine className="h-4 w-4 mr-1" />;
      case 'activity':
        return <Activity className="h-4 w-4 mr-1" />;
      case 'custom':
        return <BookOpen className="h-4 w-4 mr-1" />;
      default:
        return <BookOpen className="h-4 w-4 mr-1" />;
    }
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-500">Completed</Badge>;
      case 'abandoned':
        return <Badge variant="default" className="bg-red-500">Abandoned</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-8 px-4">
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700">Error Loading Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 border-red-300 text-red-600" 
              onClick={() => refreshChallenges()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <div className="w-full py-8 px-4">
        <Card className="border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle>No Wellness Challenges</CardTitle>
            <CardDescription>Get started on your wellness journey by creating your first challenge!</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-2">
            <Button>Create Challenge</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">Your Wellness Challenges</h2>
        <Button size="sm" className="w-full sm:w-auto">
          New Challenge
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
};

interface ChallengeCardProps {
  challenge: WellnessChallenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  // Calculate progress color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const completionPercentage = challenge.completionPercentage || 0;
  const progressColor = getProgressColor(completionPercentage);

  return (
    <Card className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <CardTitle className="text-base sm:text-lg flex-1 leading-tight">{challenge.title}</CardTitle>
          {getStatusBadge(challenge.status)}
        </div>
        <CardDescription className="flex flex-wrap items-center text-xs sm:text-sm gap-1">
          {getTypeIcon(challenge.type)}
          <span className="capitalize">{challenge.type}</span>
          <span className="mx-1">•</span>
          <CalendarDays className="h-3 w-3" />
          <span className="capitalize">{challenge.frequency}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3 space-y-3">
        {challenge.description && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="flex items-center">
              <PieChart className="h-3 w-3 mr-1 text-gray-500" />
              Progress
            </span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2"
            indicatorClassName={progressColor}
          />
          
          <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs">
            <div className="flex items-center">
              <Hourglass className="h-3 w-3 mr-1 text-gray-500" />
              <span>{challenge.daysRemaining} days left</span>
            </div>
            
            <div className="flex items-center">
              {challenge.streak > 0 ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-600 font-medium">{challenge.streak} day streak</span>
                </>
              ) : (
                <>
                  <CircleX className="h-3 w-3 mr-1 text-gray-400" />
                  <span className="text-gray-500">No streak</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full" size="sm">
          <ArrowRightCircle className="mr-2 h-3 w-3" />
          <span className="text-xs sm:text-sm">View Details</span>
        </Button>
      </CardFooter>
    </Card>
  );
};