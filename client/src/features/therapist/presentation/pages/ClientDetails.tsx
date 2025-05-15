/**
 * Client details page for therapists
 * Implements comprehensive client view with all client data
 * Following SOLID principles, DDD, Clean Architecture, and CQRS pattern
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  useTherapistClients, 
  useTherapistNotes, 
  useClientAnalytics,
  useTherapistService 
} from '../hooks';
import { format } from 'date-fns';
import { ID, DateString } from '../../domain/entities';

// UI Components
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  EmotionAnalytics, 
  CrisisAnalytics, 
  TherapistNotes
} from '../components';

// Icons
import { 
  ChevronLeft, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileEdit,
  ClipboardList,
  Heart,
  Activity,
  Brain,
  FileText
} from 'lucide-react';

/**
 * Comprehensive client details page
 * Shows client information, history, analytics, and allows for note-taking
 */
const ClientDetails: React.FC = () => {
  const params = useParams<{ clientId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const therapistService = useTherapistService();
  
  // Get client ID from URL params and convert to number
  const clientId = parseInt(params.clientId);
  
  // State for loading client details
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [isLoadingClient, setIsLoadingClient] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Get therapist notes for this client
  const { 
    notes,
    isLoadingNotes
  } = useTherapistNotes({ clientId });
  
  // Fetch client details on component mount
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!user?.id || !clientId) return;
      
      try {
        setIsLoadingClient(true);
        setErrorMessage(null);
        
        // Verify authorization for this client
        const isAuthorized = await therapistService.isAuthorizedForClient(user.id, clientId);
        
        if (!isAuthorized) {
          setErrorMessage('You are not authorized to view this client.');
          setIsLoadingClient(false);
          return;
        }
        
        // Fetch client details
        const clientData = await therapistService.getClientById(user.id, clientId);
        
        if (!clientData) {
          setErrorMessage('Client not found.');
          setIsLoadingClient(false);
          return;
        }
        
        setClientDetails(clientData);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setErrorMessage('An error occurred while fetching client details.');
      } finally {
        setIsLoadingClient(false);
      }
    };
    
    fetchClientDetails();
  }, [clientId, user?.id, therapistService]);
  
  // Handle navigation back to dashboard
  const handleBack = () => {
    navigate('/therapist');
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return format(new Date(dateStr), 'MMM d, yyyy');
  };
  
  // Get status badge based on client status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="text-yellow-600">
            <Clock className="mr-1 h-3 w-3" /> Inactive
          </Badge>
        );
      case 'terminated':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Terminated
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={handleBack} 
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
      
      {/* Error message if applicable */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading state */}
      {isLoadingClient ? (
        <Card className="mb-6">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading client details...</p>
          </CardContent>
        </Card>
      ) : clientDetails ? (
        <>
          {/* Client Profile Header */}
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {clientDetails.fullName || clientDetails.username}
                    </CardTitle>
                    <CardDescription>
                      Client since {formatDate(clientDetails.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="mt-2 md:mt-0">
                    {getStatusBadge(clientDetails.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Client ID</p>
                    <p className="font-medium">{clientDetails.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="font-medium">{clientDetails.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{clientDetails.email || 'No email provided'}</p>
                  </div>
                </div>
                
                {clientDetails.relationshipNotes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Relationship Notes</p>
                    <p className="text-sm">{clientDetails.relationshipNotes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <FileEdit className="mr-2 h-4 w-4" /> Edit Relationship
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // Navigate to treatment plans page
                      navigate(`/therapist/clients/${clientId}/treatment-plans`);
                    }}
                  >
                    <ClipboardList className="mr-2 h-4 w-4" /> View Treatment Plans
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Client Activity Summary */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Heart className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emotions Tracked</p>
                    <h3 className="text-2xl font-bold">{clientDetails.emotionsCount || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last entry: {clientDetails.lastEmotionEntryDate 
                        ? formatDate(clientDetails.lastEmotionEntryDate) 
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Activity className="h-6 w-6 text-red-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Crisis Events</p>
                    <h3 className="text-2xl font-bold">{clientDetails.crisisEventsCount || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last event: {clientDetails.lastCrisisEventDate 
                        ? formatDate(clientDetails.lastCrisisEventDate) 
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FileText className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Session Notes</p>
                    <h3 className="text-2xl font-bold">{notes?.length || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notes && notes.length > 0
                        ? `Last note: ${formatDate(notes[0].sessionDate)}`
                        : 'No notes recorded'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for different types of client information */}
          <Tabs defaultValue="notes" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 md:grid-cols-4">
              <TabsTrigger value="notes">
                <FileText className="h-4 w-4 mr-2" /> Session Notes
              </TabsTrigger>
              <TabsTrigger value="emotions">
                <Heart className="h-4 w-4 mr-2" /> Emotions
              </TabsTrigger>
              <TabsTrigger value="crisis">
                <Activity className="h-4 w-4 mr-2" /> Crisis Events
              </TabsTrigger>

            </TabsList>
            
            {/* Session Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <TherapistNotes 
                clientId={clientId} 
                clientName={clientDetails.fullName || clientDetails.username} 
              />
            </TabsContent>
            
            {/* Emotions Tab */}
            <TabsContent value="emotions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emotion Tracking Data</CardTitle>
                  <CardDescription>
                    Analyze emotional patterns and trends for {clientDetails.fullName || clientDetails.username}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmotionAnalytics clientId={clientId} />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Crisis Events Tab */}
            <TabsContent value="crisis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crisis Event Monitoring</CardTitle>
                  <CardDescription>
                    Track and analyze crisis events for {clientDetails.fullName || clientDetails.username}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CrisisAnalytics clientId={clientId} />
                </CardContent>
              </Card>
            </TabsContent>
            

          </Tabs>
        </>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No client found with ID {clientId}.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDetails;