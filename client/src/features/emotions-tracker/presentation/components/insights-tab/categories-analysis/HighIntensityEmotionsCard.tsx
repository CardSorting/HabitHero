import React, { useState } from 'react';
import { TrendingUp, Activity, Flame, BarChart2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InsightCard } from '../ui/InsightCard';
import { InsightCardHeader, InsightCardContent } from '../ui/InsightCard';
import { SegmentedControl } from '../ui/SegmentedControl';
import { MetricsSummary } from '../ui/MetricsSummary';
import { TrendIndicator } from '../ui/TrendIndicator';

interface HighIntensityEmotionsCardProps {
  highIntensityEmotions: {emotion: string; intensity: number}[];
}

/**
 * Component for displaying highest intensity emotions in a card
 * Using Apple Health-inspired UI components
 */
export const HighIntensityEmotionsCard: React.FC<HighIntensityEmotionsCardProps> = ({
  highIntensityEmotions
}) => {
  const [visualizationType, setVisualizationType] = useState('chart');
  
  // Visualization options
  const visualizationOptions = [
    { value: 'chart', label: 'Chart View' },
    { value: 'detail', label: 'Detail View' }
  ];
  
  // Generate gradient colors for intensity visualization
  const getIntensityColor = (intensity: number) => {
    // Color scale from yellow to orange to red based on intensity
    if (intensity <= 3.3) return '#FCD34D'; // Yellow
    if (intensity <= 6.6) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };
  
  // Calculate percentage for intensity visualization
  const getIntensityPercentage = (intensity: number) => {
    return (intensity / 10) * 100;
  };
  
  // Format intensity for display
  const formatIntensity = (intensity: number) => {
    return intensity.toFixed(1);
  };
  
  // Get label for intensity
  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 3.3) return 'Mild';
    if (intensity <= 6.6) return 'Moderate';
    return 'Strong';
  };

  return (
    <InsightCard 
      title="Highest Intensity Emotions" 
      icon={<Flame />}
      iconBackground="bg-red-100"
      iconColor="text-red-600"
      fullWidth
    >
      <InsightCardContent>
        <InsightCardHeader 
          title="Emotional Intensity Analysis"
          subtitle="Your strongest emotional reactions"
          action={
            <SegmentedControl 
              options={visualizationOptions}
              value={visualizationType}
              onChange={setVisualizationType}
              size="sm"
            />
          }
        />
        
        {highIntensityEmotions.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mb-2">🔥</div>
              <div>Not enough data to show intensity analysis</div>
              <div className="text-sm mt-1">Track more emotions to see intensity insights</div>
            </div>
          </div>
        ) : (
          visualizationType === 'chart' ? (
            <div className="h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={highIntensityEmotions.map(e => ({ emotion: e.emotion, intensity: e.intensity }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis 
                    type="number" 
                    domain={[0, 10]} 
                    tickCount={6}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    dataKey="emotion" 
                    type="category" 
                    tick={{ fontSize: 13, fill: '#333', fontWeight: 500 }}
                    width={100}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} / 10`, 'Intensity']}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      border: 'none',
                      padding: '8px 12px',
                      fontSize: '13px'
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar 
                    dataKey="intensity" 
                    barSize={16}
                    radius={[0, 4, 4, 0]}
                  >
                    {highIntensityEmotions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getIntensityColor(entry.intensity)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Apple Health-style intensity scale */}
              <div className="flex justify-between items-center px-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-300 mr-1"></div>
                  <span className="text-xs text-gray-600">Mild</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                  <span className="text-xs text-gray-600">Moderate</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-xs text-gray-600">Strong</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {highIntensityEmotions.map((emotion, index) => {
                const intensityPercentage = getIntensityPercentage(emotion.intensity);
                const intensityColor = getIntensityColor(emotion.intensity);
                const intensityLabel = getIntensityLabel(emotion.intensity);
                
                return (
                  <div key={index} className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium"
                          style={{ 
                            backgroundColor: `${intensityColor}20`, 
                            color: intensityColor
                          }}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium text-base">{emotion.emotion}</span>
                      </div>
                      <Badge 
                        className="px-3 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: `${intensityColor}15`, 
                          color: intensityColor
                        }}
                      >
                        {intensityLabel}
                      </Badge>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                      </div>
                      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full rounded-full" 
                          style={{ 
                            width: `${intensityPercentage}%`,
                            backgroundColor: intensityColor,
                          }}
                        ></div>
                        <div 
                          className="absolute top-0 right-0 bg-white rounded-full w-5 h-5 shadow border border-gray-200 flex items-center justify-center text-[10px] font-bold -mt-1 -mr-1"
                          style={{ 
                            left: `calc(${intensityPercentage}% - 8px)`,
                          }}
                        >
                          {formatIntensity(emotion.intensity)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </InsightCardContent>
    </InsightCard>
  );
};