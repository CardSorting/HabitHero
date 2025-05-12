import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PageTransition } from '@/components/page-transition';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Page to view and manage a specific wellness challenge
 */
const WellnessChallengeDetails: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  return (
    <PageTransition>
      <div className="w-full h-full min-h-screen pb-16">
        <div className="container py-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 mb-4" 
            onClick={() => navigate('/wellness-challenges')}
          >
            <ArrowLeft size={16} />
            Back to Challenges
          </Button>
          
          <h1 className="text-2xl font-bold mb-4">Challenge Details</h1>
          
          <div className="bg-muted rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Challenge Details Coming Soon</h2>
            <p className="text-muted-foreground mb-4">
              We're building a detailed view for your wellness challenges, including progress tracking, goals, and analytics.
            </p>
            <p className="text-sm text-muted-foreground">
              Soon you'll be able to track your progress, set goals, and receive insights on your wellness journey.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WellnessChallengeDetails;