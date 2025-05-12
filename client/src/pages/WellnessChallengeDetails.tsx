import React from 'react';
// import { ChallengeDetailsPage } from '@/features/wellness-challenges';
import { useAuth } from '@/hooks/use-auth';
import { PageTransition } from '@/components/page-transition';
// import { WellnessChallengeProvider } from '@/features/wellness-challenges';

/**
 * Page to view and manage a specific wellness challenge
 */
const WellnessChallengeDetails: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <PageTransition>
      <div className="w-full h-full min-h-screen pb-16">
        <WellnessChallengeProvider userId={user?.id}>
          <ChallengeDetailsPage />
        </WellnessChallengeProvider>
      </div>
    </PageTransition>
  );
};

export default WellnessChallengeDetails;