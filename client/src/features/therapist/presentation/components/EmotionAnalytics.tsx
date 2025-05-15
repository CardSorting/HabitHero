/**
 * Component for displaying emotion analytics for a client
 * Uses direct client emotion endpoints for data access
 */
import React from 'react';
import { useClientEmotionData } from '../hooks/useClientEmotionData';
import { ID } from '../../domain/entities';
import TimeDistributionChart from './TimeDistributionChart';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Recharts components for data visualization
import {
  AreaChart,
  Area,
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

interface EmotionAnalyticsProps {
  clientId: ID;
}

// Colors for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

/**
 * Component for displaying emotion analytics for a client
 * Now uses direct client emotion endpoints
 */
export const EmotionAnalytics: React.FC<EmotionAnalyticsProps> = ({ clientId }) => {
  const {
    isLoading,
    dateRange,
    setLastNDays,
    getEmotionIntensityTrend,
    getTopEmotionsByFrequency,
    getEmotionsByIntensity,
    trends,
    frequentEmotions,
    highIntensityEmotions
  } = useClientEmotionData(clientId);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get emotion intensity trend data
  const emotionIntensityData = getEmotionIntensityTrend()
    .map(item => ({
      date: formatDate(item.date),
      intensity: item.intensity
    }));

  // Get top emotions data
  const topEmotionsData = getTopEmotionsByFrequency();
  
  // Get intensity emotions data
  const intensityEmotionsData = getEmotionsByIntensity();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Emotion Analytics</h3>
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

      {isLoading ? (
        <div className="py-6 text-center text-muted-foreground">
          Loading analytics...
        </div>
      ) : !trends || trends.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground">
          No emotion data available for this client.
        </div>
      ) : (
        <>
          {/* Time Distribution Chart */}
          <div className="mb-6">
            <TimeDistributionChart 
              clientId={clientId} 
              title="When Your Client Records Emotions" 
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Emotion Intensity Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Emotion Intensity Trend</CardTitle>
                <CardDescription>
                  Average emotion intensity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={emotionIntensityData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="intensity"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Emotions */}
            <Card>
              <CardHeader>
                <CardTitle>Most Frequent Emotions</CardTitle>
                <CardDescription>
                  Top 5 emotions experienced most frequently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  {topEmotionsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topEmotionsData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {topEmotionsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No emotion data to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Highest Intensity Emotions */}
            <Card>
              <CardHeader>
                <CardTitle>Highest Intensity Emotions</CardTitle>
                <CardDescription>
                  Emotions experienced with the highest intensity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {intensityEmotionsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={intensityEmotionsData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis type="number" domain={[0, 5]} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" name="Intensity" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No intensity data to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emotion Entry Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Emotion Summary</CardTitle>
                <CardDescription>
                  Overview of recorded emotions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm font-medium">Total Entries</p>
                      <p className="text-2xl font-bold">{topEmotionsData.reduce((sum, item) => sum + item.value, 0)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm font-medium">Unique Emotions</p>
                      <p className="text-2xl font-bold">{frequentEmotions?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Date Range</p>
                    <p className="text-base">{formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};