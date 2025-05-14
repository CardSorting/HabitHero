/**
 * Client details page for therapists
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  TherapistProvider, 
  useTherapistClients, 
  useClientAnalytics 
} from '../hooks';
import { 
  EmotionAnalytics, 
  CrisisAnalytics, 
  TherapistNotes 
} from '../components';
import { Client } from '../../domain/entities';

// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, User } from 'lucide-react';

/**
 * Client details wrapper that provides context
 */
const ClientDetailsWrapper: React.FC = () => {
  return (
    <TherapistProvider>
      <ClientDetailsContent />
    </TherapistProvider>
  );
};

/**
 * Client details content component
 */
const ClientDetailsContent: React.FC = () => {
  const params = useParams<{ clientId: string }>();
  const [, navigate] = useLocation();
  const clientId = parseInt(params.clientId);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getClientById } = useTherapistClients();
  
  // Load client data
  useEffect(() => {
    const loadClient = async () => {
      try {
        setIsLoading(true);
        const clientData = await getClientById(clientId);
        if (clientData) {
          setClient(clientData);
        }
      } catch (error) {
        console.error('Error loading client:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (clientId) {
      loadClient();
    }
  }, [clientId, getClientById]);
  
  const handleBack = () => {
    navigate('/therapist');
  };
  
  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        onClick={handleBack} 
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
      
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-[500px] w-full" />
        </div>
      ) : !client ? (
        <div className="py-6 text-center">
          <h2 className="text-2xl font-bold">Client Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The client you're looking for doesn't exist or you don't have access.
          </p>
          <Button onClick={handleBack} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{client.fullName || client.username}</h1>
              <p className="text-muted-foreground">{client.email || `@${client.username}`}</p>
            </div>
          </div>
          
          <Tabs defaultValue="notes" className="space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="notes">Session Notes</TabsTrigger>
              <TabsTrigger value="emotions">Emotion Analytics</TabsTrigger>
              <TabsTrigger value="crisis">Crisis Analytics</TabsTrigger>
              <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes" className="space-y-6">
              <TherapistNotes clientId={clientId} clientName={client.fullName || client.username} />
            </TabsContent>
            
            <TabsContent value="emotions" className="space-y-6">
              <EmotionAnalytics clientId={clientId} />
            </TabsContent>
            
            <TabsContent value="crisis" className="space-y-6">
              <CrisisAnalytics clientId={clientId} />
            </TabsContent>
            
            <TabsContent value="treatment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Plans</CardTitle>
                  <CardDescription>
                    View and manage treatment plans for {client.fullName || client.username}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Treatment plan management will be implemented in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ClientDetailsWrapper;