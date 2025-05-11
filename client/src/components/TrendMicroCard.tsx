import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Habit } from "@/lib/types";
import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";
import { format, subDays, isSameDay } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendMicroCardProps {
  habit: Habit;
  index: number;
  onClick?: () => void;
}

const TrendMicroCard: React.FC<TrendMicroCardProps> = ({ 
  habit, 
  index,
  onClick
}) => {
  const { name, streak, completionRecords } = habit;
  
  // Get data for the past 14 days
  const today = new Date();
  const trendData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(today, 13 - i);
    const completed = completionRecords.some(
      record => isSameDay(new Date(record.date), date) && record.completed
    );
    
    return {
      date,
      value: completed ? 1 : 0
    };
  });
  
  // Calculate trend (positive, negative, or neutral)
  const firstWeek = trendData.slice(0, 7).filter(d => d.value === 1).length;
  const secondWeek = trendData.slice(7).filter(d => d.value === 1).length;
  const trend = secondWeek - firstWeek;
  
  // Check if completed today
  const completedToday = completionRecords.some(
    record => isSameDay(new Date(record.date), today) && record.completed
  );
  
  // Get completion rate for past 2 weeks
  const completionRate = Math.round((trendData.filter(d => d.value === 1).length / 14) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <Card 
        className={cn(
          "rounded-[12px] cursor-pointer overflow-hidden border",
          completedToday ? "border-success" : "border-muted"
        )}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-medium text-base truncate" style={{ maxWidth: '120px' }}>{name}</h3>
              <div className="flex items-center mt-1">
                <span className="text-xs text-muted-foreground mr-2">
                  {streak} day streak
                </span>
                <span className={cn(
                  "flex items-center text-xs rounded-full px-1.5 py-0.5",
                  trend > 0 
                    ? "bg-success/10 text-success" 
                    : trend < 0 
                      ? "bg-destructive/10 text-destructive" 
                      : "bg-muted text-muted-foreground"
                )}>
                  {trend > 0 ? (
                    <><TrendingUp className="h-3 w-3 mr-0.5" /> +{trend}</>
                  ) : trend < 0 ? (
                    <><TrendingDown className="h-3 w-3 mr-0.5" /> {trend}</>
                  ) : (
                    <><Minus className="h-3 w-3 mr-0.5" /> 0</>
                  )}
                </span>
              </div>
            </div>
            
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              completedToday ? "bg-success" : "bg-muted"
            )}>
              {completedToday && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
          </div>
          
          <div className="h-[40px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <YAxis 
                  domain={[0, 1]} 
                  hide={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={trend > 0 ? "hsl(var(--success))" : trend < 0 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between text-xs mt-2">
            <span className="text-muted-foreground">
              {format(subDays(today, 13), "MMM d")}
            </span>
            <span className="font-medium">
              {completionRate}%
            </span>
            <span className="text-muted-foreground">
              {format(today, "MMM d")}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TrendMicroCard;