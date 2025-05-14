/**
 * Component for displaying emotion analytics for a client
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Recharts components for data visualization
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
 */
export const EmotionAnalytics: React.FC<EmotionAnalyticsProps> = ({ clientId }) => {
  const {
    analytics,
    isLoadingAnalytics,
    dateRange,
    setLastNDays,
    getEmotionIntensityTrend
  } = useClientAnalytics({ clientId });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get emotion intensity trend data
  const emotionIntensityData = getEmotionIntensityTrend(analytics)
    .map(item => ({
      date: formatDate(item.date),
      intensity: item.intensity
    }));

  // Get top emotions by frequency
  const getTopEmotions = () => {
    if (!analytics?.emotionTrends) return [];

    // Count emotion occurrences across all dates
    const emotionCounts: Record<string, number> = {};
    analytics.emotionTrends.forEach(day => {
      day.emotions.forEach(emotion => {
        if (!emotionCounts[emotion.name]) {
          emotionCounts[emotion.name] = 0;
        }
        emotionCounts[emotion.name]++;
      });
    });

    // Convert to array and sort by count
    return Object.entries(emotionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

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

      {isLoadingAnalytics ? (
        <div className="py-6 text-center text-muted-foreground">
          Loading analytics...
        </div>
      ) : !analytics ? (
        <div className="py-6 text-center text-muted-foreground">
          No emotion data available for this client.
        </div>
      ) : (
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
                Most frequently recorded emotions in this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTopEmotions()}
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
                      {getTopEmotions().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};