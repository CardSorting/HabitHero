/**
 * Main dashboard page for therapists
 */
import React from 'react';
import { ClientList } from '../components';
import { TherapistProvider } from '../hooks';

// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

/**
 * Main dashboard page for therapists
 */
const TherapistDashboard: React.FC = () => {
  return (
    <TherapistProvider>
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Therapist Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your clients and view analytics
          </p>
        </div>
        
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients" className="space-y-6">
            <ClientList />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-4">Therapist Analytics</h2>
              <p className="text-muted-foreground">
                Overall therapist analytics will appear here. For now, you can view individual client analytics by selecting a client from the Clients tab.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TherapistProvider>
  );
};

export default TherapistDashboard;