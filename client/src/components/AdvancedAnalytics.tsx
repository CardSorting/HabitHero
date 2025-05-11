import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAnalytics } from "@/lib/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Calendar, PieChart as PieChartIcon } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

// Custom colors for charts
const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

interface AdvancedAnalyticsProps {
  timeframe: "week" | "month" | "year";
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ timeframe }) => {
  const { analyticsData, isLoading, getTrendData, getHabitPerformance } = useAnalytics();
  
  const trendData = getTrendData(timeframe);
  const habitPerformance = getHabitPerformance();
  
  // Generate pattern data for day of week analysis
  const getDayOfWeekData = () => {
    // Get the current week's days
    const today = new Date();
    const weekDays = eachDayOfInterval({
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 })
    });
    
    // Create an array to hold day of week data
    const dayData = weekDays.map(day => ({
      name: format(day, "EEE"),
      fullName: format(day, "EEEE"),
      value: 0,
      count: 0
    }));
    
    // Process the analytics data to get completion rates by day of week
    if (analyticsData && analyticsData.habitPerformance) {
      trendData.forEach(day => {
        const dayOfWeek = format(parseISO(day.date), "EEE");
        const dayIndex = dayData.findIndex(d => d.name === dayOfWeek);
        
        if (dayIndex >= 0) {
          dayData[dayIndex].value += day.value;
          dayData[dayIndex].count += 1;
        }
      });
      
      // Calculate averages
      dayData.forEach(day => {
        if (day.count > 0) {
          day.value = Math.round(day.value / day.count);
        }
      });
    }
    
    return dayData;
  };
  
  // Get frequency distribution data
  const getFrequencyData = () => {
    const frequencies: Record<string, number> = {};
    
    // Count habits by frequency
    if (analyticsData && analyticsData.habitPerformance) {
      analyticsData.habitPerformance.forEach(habit => {
        // Get frequency from habit data
        // This is a simplification; in a real app you would have the frequency in the habit data
        const frequency = "daily"; // placeholder
        
        if (!frequencies[frequency]) {
          frequencies[frequency] = 0;
        }
        frequencies[frequency] += 1;
      });
    }
    
    return Object.entries(frequencies).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-[12px]" />
        <Skeleton className="h-64 w-full rounded-[12px]" />
      </div>
    );
  }
  
  // Format data for display
  const dayOfWeekData = getDayOfWeekData();
  const frequencyData = getFrequencyData();
  
  return (
    <div className="space-y-6">
      {/* Trend Over Time */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="rounded-[12px]">
          <CardHeader>
            <CardTitle>
              {timeframe === 'week' ? 'Weekly' : timeframe === 'month' ? 'Monthly' : 'Yearly'} Trend
            </CardTitle>
            <CardDescription>
              Habit completion trend over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0 && payload[0].payload.fullDate) {
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Completion Rate"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Day of Week Analysis */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="rounded-[12px]">
          <CardHeader>
            <CardTitle>Day of Week Analysis</CardTitle>
            <CardDescription>
              Which days you perform best
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dayOfWeekData}
                  margin={{ top: 10, right: 30, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0 && payload[0].payload.fullName) {
                        return payload[0].payload.fullName;
                      }
                      return label;
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Average Completion"
                    fill="hsl(var(--secondary))" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Display the best and worst day */}
            {dayOfWeekData.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-success/10 text-success border-success">
                    Best Day
                  </Badge>
                  <span className="text-sm">
                    {dayOfWeekData.sort((a, b) => b.value - a.value)[0]?.fullName || "N/A"}
                    {" "}
                    ({dayOfWeekData.sort((a, b) => b.value - a.value)[0]?.value || 0}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-destructive/10 text-destructive border-destructive">
                    Needs Improvement
                  </Badge>
                  <span className="text-sm">
                    {dayOfWeekData.sort((a, b) => a.value - b.value)[0]?.fullName || "N/A"}
                    {" "}
                    ({dayOfWeekData.sort((a, b) => a.value - b.value)[0]?.value || 0}%)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Habit Frequency Distribution */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="rounded-[12px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Habit Distribution</span>
            </CardTitle>
            <CardDescription>
              Breakdown of habit frequencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={frequencyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {frequencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'Habits']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Insights and Recommendations */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <Card className="rounded-[12px]">
          <CardHeader>
            <CardTitle>Advanced Insights</CardTitle>
            <CardDescription>
              Data-driven recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData && (
              <>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Performance Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Your overall completion rate is <span className="font-medium">{analyticsData.completionRate}%</span>.
                    {analyticsData.completionRate > 80 
                      ? " This is excellent! You're consistently completing your habits." 
                      : analyticsData.completionRate > 50 
                        ? " This is good, but there's room for improvement." 
                        : " This suggests you might be tracking too many habits or need to simplify."}
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Streak Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Your longest streak is <span className="font-medium">{analyticsData.longestStreak} days</span>.
                    {analyticsData.longestStreak > 20 
                      ? " Impressive consistency! Your habit is becoming automatic." 
                      : analyticsData.longestStreak > 10 
                        ? " Good progress! After 21 days, habits become more automatic." 
                        : " Keep going! It takes about 21 days for a habit to form."}
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Optimization Tips</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {dayOfWeekData.length > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Consider scheduling your most challenging habits on 
                        {dayOfWeekData.sort((a, b) => b.value - a.value)[0]?.fullName || "Monday"}, 
                        when you're most likely to complete them.
                      </li>
                    )}
                    
                    {analyticsData.worstHabit && (
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Your habit "{analyticsData.worstHabit.name}" needs attention. 
                        Try making it easier or combining it with an existing habit.
                      </li>
                    )}
                    
                    {analyticsData.completionRate < 70 && (
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Consider reducing the number of habits you're tracking to improve focus and consistency.
                      </li>
                    )}
                    
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Set specific times for your habits and use visual cues to remind yourself.
                    </li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalytics;