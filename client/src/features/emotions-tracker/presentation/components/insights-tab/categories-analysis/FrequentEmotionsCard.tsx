import React, { useState } from 'react';
import { Activity, List, BarChart2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InsightCard } from '../ui/InsightCard';
import { InsightCardHeader, InsightCardContent } from '../ui/InsightCard';
import { SegmentedControl } from '../ui/SegmentedControl';
import { DataBadge } from '../ui/DataBadge';
import { TrendIndicator } from '../ui/TrendIndicator';

interface FrequentEmotionsCardProps {
  frequentEmotions: {emotion: string; count: number}[];
}

/**
 * Component for displaying most frequent emotions in a card
 * Using Apple Health-inspired UI elements
 */
export const FrequentEmotionsCard: React.FC<FrequentEmotionsCardProps> = ({
  frequentEmotions
}) => {
  const [viewType, setViewType] = useState('chart');
  
  // View options
  const viewOptions = [
    { value: 'chart', label: 'Chart' },
    { value: 'list', label: 'List' }
  ];
  
  // Generate colors for different emotions
  const getEmotionColor = (index: number) => {
    const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF'];
    return colors[index % colors.length];
  };
  
  // Calculate the maximum count for scaling
  const maxCount = Math.max(...frequentEmotions.map(e => e.count), 1);

  return (
    <InsightCard 
      title="Most Frequent Emotions" 
      icon={<Activity />}
      iconBackground="bg-blue-100"
      iconColor="text-blue-600"
      fullWidth
    >
      <InsightCardContent className="pb-2">
        <InsightCardHeader 
          title="Emotion Frequency Analysis"
          subtitle="Your most common emotional states"
          action={
            <SegmentedControl 
              options={viewOptions}
              value={viewType}
              onChange={setViewType}
              size="sm"
            />
          }
        />
        
        {frequentEmotions.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mb-2">📊</div>
              <div>Not enough data to show frequent emotions</div>
              <div className="text-sm mt-1">Track more emotions to see insights</div>
            </div>
          </div>
        ) : (
          viewType === 'chart' ? (
            <div className="h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={frequentEmotions.map((e, i) => ({ 
                    emotion: e.emotion, 
                    count: e.count,
                    fill: getEmotionColor(i)
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis 
                    type="number" 
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    tick={{ fill: '#666' }}
                    tickFormatter={(value) => Math.floor(value) === value ? value.toString() : ''}
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
                    formatter={(value) => [`${value} occurrences`, 'Frequency']}
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
                    dataKey="count" 
                    barSize={16}
                    radius={[0, 4, 4, 0]}
                  >
                    {frequentEmotions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getEmotionColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="divide-y">
              {frequentEmotions.map((emotion, index) => {
                // Calculate percentage of maximum (simple implementation)
                const percentage = Math.round((emotion.count / maxCount) * 100);
                
                return (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getEmotionColor(index)}20`, 
                          color: getEmotionColor(index)
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{emotion.emotion}</div>
                        <div className="mt-1 w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getEmotionColor(index)
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className="font-medium rounded-full px-3"
                        style={{ 
                          backgroundColor: `${getEmotionColor(index)}15`, 
                          color: getEmotionColor(index) 
                        }}
                      >
                        {emotion.count} times
                      </Badge>
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