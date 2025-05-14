/**
 * Minimal client details page for debugging
 */
import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

/**
 * Simplified client details page
 */
const ClientDetails: React.FC = () => {
  const params = useParams<{ clientId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const clientId = params.clientId;
  
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
      
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Client ID: {clientId}</p>
          <p>This is a placeholder page for client details.</p>
          <p>The therapist dashboard is being updated to fix the role-based routing issues.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetails;