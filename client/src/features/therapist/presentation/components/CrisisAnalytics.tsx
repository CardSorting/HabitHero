/**
 * Component for displaying crisis event analytics for a client
 */
import React, { useState } from 'react';
import { useClientAnalytics } from '../hooks';
import { ID } from '../../domain/entities';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

// Recharts components for data visualization
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Icons
import {
  AlertCircle,
  Activity,
  Calendar,
  Clock,
  AlertTriangle,
  ChevronRight,
  FileText,
  CheckCircle,
  Info,
  Tag,
  X
} from 'lucide-react';

interface CrisisAnalyticsProps {
  clientId: ID;
}

// Colors for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

// Map crisis type enum values to readable labels
const crisisTypeLabels: Record<string, string> = {
  'panic_attack': 'Panic Attack',
  'emotional_crisis': 'Emotional Crisis',
  'suicidal_thoughts': 'Suicidal Thoughts',
  'self_harm_urge': 'Self-Harm Urge',
  'substance_urge': 'Substance Urge',
  'other': 'Other'
};

// Map crisis intensity enum values to readable labels
const crisisIntensityLabels: Record<string, string> = {
  'mild': 'Mild',
  'moderate': 'Moderate',
  'severe': 'Severe', 
  'extreme': 'Extreme'
};

// Helper function to format crisis type for display
const formatCrisisType = (type: string): string => {
  return crisisTypeLabels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// Helper function to get color class based on crisis type
const getCrisisTypeColor = (type: string): string => {
  switch (type) {
    case 'panic_attack':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'emotional_crisis':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'suicidal_thoughts':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'self_harm_urge':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'substance_urge':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

// Helper function to get color class based on intensity
const getIntensityColor = (intensity: string): string => {
  switch (intensity) {
    case 'mild':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'severe':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'extreme':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

/**
 * Component for displaying crisis event analytics for a client
 */
export const CrisisAnalytics: React.FC<CrisisAnalyticsProps> = ({ clientId }) => {
  const {
    analytics,
    isLoadingAnalytics,
    dateRange,
    setLastNDays,
    getCrisisEventsByType
  } = useClientAnalytics({ clientId });

  // State for detail view modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Get crisis events by type data
  const getCrisisTypeData = () => {
    if (!analytics?.crisisEvents?.byType) return [];
    
    return Object.entries(analytics.crisisEvents.byType).map(([type, count]) => ({
      name: crisisTypeLabels[type] || type,
      value: count
    }));
  };

  // Get crisis events by intensity data
  const getCrisisIntensityData = () => {
    if (!analytics?.crisisEvents?.byIntensity) return [];
    
    return Object.entries(analytics.crisisEvents.byIntensity).map(([intensity, count]) => ({
      name: crisisIntensityLabels[intensity] || intensity,
      value: count
    }));
  };

  // Get trend badge based on trend direction
  const getTrendBadge = () => {
    if (!analytics?.crisisEvents?.trend) return null;
    
    switch (analytics.crisisEvents.trend) {
      case 'increasing':
        return <Badge className="bg-red-500 hover:bg-red-600">Increasing</Badge>;
      case 'decreasing':
        return <Badge className="bg-green-500 hover:bg-green-600">Decreasing</Badge>;
      case 'stable':
        return <Badge variant="outline">Stable</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="analytics">
            <Activity className="h-4 w-4 mr-2" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="events">
            <AlertCircle className="h-4 w-4 mr-2" /> Event List
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Crisis Event Analytics</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLastNDays(7)}
              >
                Last 7 Days
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLastNDays(30)}
              >
                Last 30 Days
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLastNDays(90)}
              >
                Last 90 Days
              </Button>
            </div>
          </div>

          {isLoadingAnalytics ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading analytics...
            </div>
          ) : !analytics || !analytics.crisisEvents || analytics.crisisEvents.count === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No crisis event data available for this client.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Crisis Event Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Crisis Event Summary</CardTitle>
                  <CardDescription>
                    Overview of crisis events in the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        Total Events
                      </div>
                      <div className="mt-1 text-2xl font-bold">
                        {analytics.crisisEvents.count}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        Trend
                      </div>
                      <div className="mt-2">
                        {getTrendBadge()}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        Date Range
                      </div>
                      <div className="mt-1 text-sm">
                        {dateRange.startDate} to {dateRange.endDate}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Crisis Events by Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Crisis Events by Type</CardTitle>
                    <CardDescription>
                      Distribution of crisis events by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getCrisisTypeData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value, percent }) => 
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {getCrisisTypeData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Crisis Events by Intensity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Crisis Events by Intensity</CardTitle>
                    <CardDescription>
                      Distribution of crisis events by intensity level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getCrisisIntensityData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartTooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Event List Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Crisis Event History</CardTitle>
              <CardDescription>
                All recorded crisis events for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className="py-6 text-center text-muted-foreground">
                  Loading crisis events...
                </div>
              ) : !analytics || !analytics.crisisEvents || !Array.isArray(analytics.crisisEvents.events) || analytics.crisisEvents.events.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  No crisis events have been recorded for this client.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Intensity</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(analytics.crisisEvents.events as any[]).map((event: any) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {format(new Date(event.date), 'MMM d, yyyy')}
                            </span>
                            {event.time && (
                              <span className="text-xs text-muted-foreground">
                                {event.time}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(getCrisisTypeColor(event.type))}>
                            {formatCrisisType(event.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(getIntensityColor(event.intensity))}>
                            {event.intensity.charAt(0).toUpperCase() + event.intensity.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {event.duration ? `${event.duration} min` : 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {event.notes ? (
                            <span className="text-sm text-muted-foreground truncate">{event.notes}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">No notes</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Crisis Event Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
              Crisis Event Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected crisis event.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 opacity-70" />
                  <span className="font-medium">
                    {format(new Date(selectedEvent.date), 'MMMM d, yyyy')}
                  </span>
                  {selectedEvent.time && (
                    <span className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {selectedEvent.time}
                    </span>
                  )}
                </div>
                <Badge className={cn(getIntensityColor(selectedEvent.intensity))}>
                  {selectedEvent.intensity.charAt(0).toUpperCase() + selectedEvent.intensity.slice(1)} Intensity
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Activity className="h-4 w-4 mr-1 opacity-70" />
                    Crisis Type
                  </h4>
                  <Badge className={cn(getCrisisTypeColor(selectedEvent.type))}>
                    {formatCrisisType(selectedEvent.type)}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Clock className="h-4 w-4 mr-1 opacity-70" />
                    Duration
                  </h4>
                  <p>{selectedEvent.duration ? `${selectedEvent.duration} minutes` : 'Not recorded'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <FileText className="h-4 w-4 mr-1 opacity-70" />
                  Notes
                </h4>
                <p className="text-sm rounded-md bg-secondary p-3">
                  {selectedEvent.notes || 'No notes recorded for this event.'}
                </p>
              </div>
              
              {selectedEvent.symptoms && Array.isArray(selectedEvent.symptoms) && selectedEvent.symptoms.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 mr-1 opacity-70" />
                    Symptoms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.symptoms.map((symptom: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-red-50">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.triggers && Array.isArray(selectedEvent.triggers) && selectedEvent.triggers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <Tag className="h-4 w-4 mr-1 opacity-70" />
                    Triggers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.triggers.map((trigger: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-yellow-50">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.copingStrategiesUsed && Array.isArray(selectedEvent.copingStrategiesUsed) && selectedEvent.copingStrategiesUsed.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 mr-1 opacity-70" />
                    Coping Strategies Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.copingStrategiesUsed.map((strategy: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-green-50">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Info className="h-4 w-4 mr-1 opacity-70" />
                    Professional Help
                  </h4>
                  <p>{selectedEvent.helpSought ? 'Yes' : 'No'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <AlertCircle className="h-4 w-4 mr-1 opacity-70" />
                    Medication Used
                  </h4>
                  <p>{selectedEvent.medication ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};