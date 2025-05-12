import React from 'react';
import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FrequentEmotionsCardProps {
  frequentEmotions: {emotion: string; count: number}[];
}

/**
 * Component for displaying most frequent emotions in a card
 */
export const FrequentEmotionsCard: React.FC<FrequentEmotionsCardProps> = ({
  frequentEmotions
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold">Most Frequent Emotions</h3>
        </div>
        
        {frequentEmotions.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-muted-foreground">
            Not enough data to show frequent emotions
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart */}
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={frequentEmotions.map(e => ({ emotion: e.emotion, count: e.count }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="emotion" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={90}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="#8884d8" 
                    name="Occurrence Count"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* List View */}
            <div className="p-2">
              {frequentEmotions.map((emotion, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-b last:border-0 border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{emotion.emotion}</span>
                  </div>
                  <Badge variant="secondary">{emotion.count} times</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};