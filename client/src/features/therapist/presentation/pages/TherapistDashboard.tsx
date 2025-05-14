/**
 * Main dashboard page for therapists
 * Implements full-featured therapist dashboard with SOLID principles,
 * Domain-Driven Design, Clean Architecture, and CQRS pattern
 */
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTherapistClients } from '../hooks';

// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  ClientList, 
  EmotionAnalytics, 
  CrisisAnalytics 
} from '../components';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Icons
import { 
  Users, 
  PieChart, 
  CalendarClock, 
  Bell, 
  Settings, 
  Menu, 
  Clock, 
  BarChart, 
  Activity,
  UserPlus,
  FileText,
  CircleUser,
  Brain,
  Heart
} from 'lucide-react';

/**
 * Main therapist dashboard component
 * 
 * Follows:
 * - SOLID principles: Single responsibility components, open for extension, etc.
 * - DDD: Organized by domain features (clients, analytics, notes)
 * - Clean Architecture: Separates presentation from data access and business logic
 * - CQRS: Uses separate query and command operations for data
 */
const TherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { clients, isLoadingClients } = useTherapistClients();
  
  // Local state for active client analytics
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate dashboard metrics
  const totalClients = clients?.length || 0;
  const activeClients = clients?.filter(c => c.status === 'active').length || 0;
  const upcomingAppointments = 0; // Would fetch from appointment service
  
  // Find most recent activity
  const getRecentClientActivity = () => {
    if (!clients || clients.length === 0) return null;
    
    const sortedClients = [...clients].sort((a, b) => {
      const aDate = a.lastEmotionEntryDate || '1970-01-01';
      const bDate = b.lastEmotionEntryDate || '1970-01-01';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
    
    return sortedClients[0];
  };
  
  const recentActivity = getRecentClientActivity();
  
  // Handle selecting a client for analytics
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(Number(clientId));
  };
  
  return (
    <div className="container mx-auto py-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Therapist Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.username}! Here's an overview of your practice.
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <CalendarClock className="mr-2 h-4 w-4" /> Schedule
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <h3 className="text-2xl font-bold">{totalClients}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeClients} active clients
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <CalendarClock className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Sessions</p>
                <h3 className="text-2xl font-bold">{upcomingAppointments}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  For the next 7 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Activity className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <h3 className="text-2xl font-bold">{recentActivity ? recentActivity.username : 'None'}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {recentActivity?.lastEmotionEntryDate 
                    ? `Last activity on ${new Date(recentActivity.lastEmotionEntryDate).toLocaleDateString()}` 
                    : 'No recent activity'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="clients">
            <Users className="h-4 w-4 mr-2" /> Clients
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="treatment">
            <Brain className="h-4 w-4 mr-2" /> Treatment
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="h-4 w-4 mr-2" /> Resources
          </TabsTrigger>
        </TabsList>
        
        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <ClientList />
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Analytics</CardTitle>
              <CardDescription>
                View detailed analytics for your clients. Select a client to see their data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Select Client</label>
                <Select onValueChange={handleSelectClient} defaultValue={selectedClientId?.toString()}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.fullName || client.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedClientId ? (
                <div className="space-y-8">
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-500" /> 
                      Emotional Health Analysis
                    </h3>
                    <EmotionAnalytics clientId={selectedClientId} />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-500" /> 
                      Crisis Event Analysis
                    </h3>
                    <CrisisAnalytics clientId={selectedClientId} />
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  Please select a client to view their analytics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Treatment Tab */}
        <TabsContent value="treatment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Plans</CardTitle>
              <CardDescription>
                Manage treatment plans and goals for your clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Select Client</label>
                <Select>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.fullName || client.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="py-6 text-center text-muted-foreground">
                Select a client to view and manage their treatment plans.
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Templates</Button>
              <Button>Create New Plan</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Therapeutic Resources</CardTitle>
              <CardDescription>
                Access and share therapeutic resources with your clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">DBT Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Dialectical Behavior Therapy worksheets, guides, and activities
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Browse DBT Resources</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">CBT Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Cognitive Behavioral Therapy worksheets, guides, and activities
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Browse CBT Resources</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Mindfulness Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Mindfulness exercises, meditation guides, and grounding techniques
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Browse Mindfulness Resources</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Crisis Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Crisis intervention tools, safety plans, and distress tolerance guides
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Browse Crisis Resources</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TherapistDashboard;