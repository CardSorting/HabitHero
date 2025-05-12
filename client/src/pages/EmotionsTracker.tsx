import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EmotionsTrackerContainer } from '../features/emotions-tracker/presentation/components/EmotionsTrackerContainer';
import { ApiEmotionsRepository } from '../features/emotions-tracker/infrastructure/ApiEmotionsRepository';
import { EmotionsService } from '../features/emotions-tracker/application/EmotionsService';
import { EmotionsProvider } from '../features/emotions-tracker/presentation/context/EmotionsContext';

const EmotionsTrackerPage: React.FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  // Error handling for authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="mb-4">You need to be logged in to access the Emotions Tracker.</p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Repository and service setup for dependency injection
  const emotionsRepository = new ApiEmotionsRepository();
  const emotionsService = new EmotionsService(emotionsRepository, emotionsRepository);
  
  return (
    <div className="container mx-auto py-8">
      <EmotionsProvider>
        <EmotionsTrackerContainer />
      </EmotionsProvider>
    </div>
  );
};

export default EmotionsTrackerPage;