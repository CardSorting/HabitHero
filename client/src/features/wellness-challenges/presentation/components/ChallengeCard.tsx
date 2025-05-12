/**
 * ChallengeCard component displays a single wellness challenge in a card format
 */
import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Medal,
  ArrowRight,
  Heart,
  Brain,
  BookOpen,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WellnessChallenge, ChallengeStatus, ChallengeType } from '../../../domain/models';

interface ChallengeCardProps {
  challenge: WellnessChallenge;
  onStatusChange?: (id: number, status: ChallengeStatus) => void;
}

/**
 * Returns appropriate badge for challenge status
 */
const getStatusBadge = (status: ChallengeStatus) => {
  switch (status) {
    case ChallengeStatus.ACTIVE:
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    case ChallengeStatus.COMPLETED:
      return <Badge variant="default" className="bg-blue-500">Completed</Badge>;
    case ChallengeStatus.ABANDONED:
      return <Badge variant="default" className="bg-gray-500">Abandoned</Badge>;
    default:
      return null;
  }
};

/**
 * Returns appropriate icon for challenge type
 */
const getTypeIcon = (type: ChallengeType) => {
  switch (type) {
    case ChallengeType.EMOTIONS:
      return <Heart className="h-4 w-4 mr-1" />;
    case ChallengeType.MEDITATION:
      return <Brain className="h-4 w-4 mr-1" />;
    case ChallengeType.JOURNALING:
      return <BookOpen className="h-4 w-4 mr-1" />;
    case ChallengeType.ACTIVITY:
      return <Activity className="h-4 w-4 mr-1" />;
    case ChallengeType.CUSTOM:
      return <BarChart3 className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge,
  onStatusChange 
}) => {
  const [, navigate] = useLocation();
  
  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(challenge.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  // Assume we have a progress percentage (this would come from the service)
  // For now, let's generate a random value between 0-100 for demonstration
  const progressPercentage = Math.min(Math.ceil(Math.random() * 100), 100);
  
  // Handle status change
  const handleStatusChange = (status: ChallengeStatus) => {
    if (onStatusChange) {
      onStatusChange(challenge.id, status);
    }
  };
  
  // Handle card click to navigate to details
  const handleCardClick = () => {
    navigate(`/wellness-challenges/${challenge.id}`);
  };
  
  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{challenge.title}</CardTitle>
          {getStatusBadge(challenge.status)}
        </div>
        <CardDescription className="flex items-center text-xs">
          <div className="flex items-center mr-2">
            {getTypeIcon(challenge.challengeType)}
            <span className="capitalize">{challenge.challengeType}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{format(new Date(challenge.startDate), 'MMM d')} - {format(new Date(challenge.endDate), 'MMM d, yyyy')}</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {challenge.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {challenge.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-xs">
            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
            {daysRemaining > 0 ? (
              <span className="text-muted-foreground">{daysRemaining} days left</span>
            ) : (
              <span className="text-red-500">Ended {formatDistanceToNow(endDate, { addSuffix: true })}</span>
            )}
          </div>
          
          {challenge.status === ChallengeStatus.ACTIVE && (
            <div className="flex items-center text-xs">
              <Medal className="h-3 w-3 mr-1 text-yellow-500" />
              <span className="text-muted-foreground">Streak: {challenge.streak || 0} days</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {challenge.status === ChallengeStatus.ACTIVE ? (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => handleStatusChange(ChallengeStatus.COMPLETED)}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </Button>
            <Button 
              variant="outline"
              size="sm" 
              className="flex-1 text-xs text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => handleStatusChange(ChallengeStatus.ABANDONED)}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Abandon
            </Button>
          </div>
        ) : (
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full text-xs"
            onClick={handleCardClick}
          >
            View Details
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};