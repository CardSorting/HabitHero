/**
 * Component for displaying crisis event analytics for a client
 */
import React from 'react';
import { useClientAnalytics } from '../hooks';
import { ID } from '../../domain/entities';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Recharts components for data visualization
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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
                      <Tooltip />
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
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};