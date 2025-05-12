import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PageTransition } from '@/components/page-transition';

/**
 * Main entry point for the Wellness Challenges feature
 */
const WellnessChallenges: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <PageTransition>
      <div className="w-full h-full min-h-screen pb-16">
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-4">Wellness Challenges</h1>
          <div className="bg-muted rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground mb-4">
              We're building a powerful wellness challenge system to help you track and achieve your personal wellness goals.
            </p>
            <p className="text-sm text-muted-foreground">
              Check back soon for challenges related to emotions, meditation, journaling, and physical activity.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WellnessChallenges;