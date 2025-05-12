// EmotionsTracker - Main page component for the Emotions Tracker feature

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import EmotionsTrackerContainer from '../features/emotions-tracker/presentation/components/EmotionsTrackerContainer';
import { apiRequest } from '../lib/queryClient';

const EmotionsTracker: React.FC = () => {
  const { data: user, isLoading } = useQuery({ 
    queryKey: ['/api/user'],
    queryFn: () => apiRequest('/api/user')
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p>You need to be signed in to access the Emotions Tracker.</p>
        </div>
      </div>
    );
  }

  return <EmotionsTrackerContainer userId={user.id} />;
};

export default EmotionsTracker;