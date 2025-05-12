import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HighIntensityEmotionsCardProps {
  highIntensityEmotions: {emotion: string; intensity: number}[];
}

/**
 * Component for displaying highest intensity emotions in a card
 */
export const HighIntensityEmotionsCard: React.FC<HighIntensityEmotionsCardProps> = ({
  highIntensityEmotions
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <TrendingUp className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">Highest Intensity Emotions</h3>
        </div>
        
        {highIntensityEmotions.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-muted-foreground">
            Not enough data to show intensity analysis
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart */}
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={highIntensityEmotions.map(e => ({ emotion: e.emotion, intensity: e.intensity }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis 
                    dataKey="emotion" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={90}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="intensity" 
                    fill="#f87171" 
                    name="Average Intensity"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* List View */}
            <div className="p-2">
              {highIntensityEmotions.map((emotion, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-b last:border-0 border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{emotion.emotion}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 mr-2">
                      <Progress 
                        value={emotion.intensity * 10} 
                        className="h-2 bg-red-100" 
                      />
                    </div>
                    <Badge variant="outline">{emotion.intensity.toFixed(1)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};