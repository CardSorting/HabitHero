import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Habit } from "@/lib/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { subDays, format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import HabitInsights from "./HabitInsights";
import { CalendarIcon, Clock, Edit, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface HabitDetailModalProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditHabit?: (habit: Habit) => void;
}

const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  habit,
  open,
  onOpenChange,
  onEditHabit
}) => {
  if (!habit) return null;
  
  const today = new Date();
  
  // Get data for trends over time
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i);
    const completed = habit.completionRecords.some(
      record => isSameDay(new Date(record.date), date) && record.completed
    );
    
    return {
      date,
      label: format(date, "MMM d"),
      shortLabel: format(date, "d"),
      value: completed ? 1 : 0
    };
  });
  
  // Weekly pattern data
  const startDay = startOfWeek(today, { weekStartsOn: 1 });
  const endDay = endOfWeek(today, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: startDay, end: endDay });
  
  const weekdayPatternData = Array.from({ length: 7 }, (_, i) => {
    const dayName = format(daysOfWeek[i], "EEE");
    const dayRecords = habit.completionRecords.filter(record => {
      const recordDate = new Date(record.date);
      return format(recordDate, "EEE") === dayName && record.completed;
    });
    
    return {
      day: dayName,
      fullDay: format(daysOfWeek[i], "EEEE"),
      count: dayRecords.length,
      value: dayRecords.length > 0 ? (dayRecords.length / Math.max(1, habit.completionRecords.length / 7)) * 100 : 0
    };
  });
  
  // Calculate streak and completion statistics
  const totalDays = 30;
  const completedDays = habit.completionRecords.filter(r => r.completed).length;
  const completionRate = Math.round((completedDays / totalDays) * 100);
  
  // Find best day of week
  const bestDay = [...weekdayPatternData].sort((a, b) => b.count - a.count)[0];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-xl rounded-[12px] p-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="p-6 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl font-semibold">{habit.name}</DialogTitle>
                    <DialogDescription className="mt-1">{habit.description}</DialogDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full mt-[-4px]"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="px-6 mt-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-primary/10 border-primary flex items-center gap-1.5">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{habit.frequency}</span>
                  </Badge>
                  
                  {habit.reminder && (
                    <Badge variant="outline" className="bg-secondary/10 border-secondary flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      <span>Reminder: {habit.reminder}</span>
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="bg-success/10 border-success">
                    {habit.streak} day streak
                  </Badge>
                </div>
                
                <Tabs defaultValue="trends" className="mb-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="patterns">Patterns</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="trends" className="pt-4">
                    <h3 className="text-sm font-medium mb-2">30-Day History</h3>
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trendData}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="shortLabel" 
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            domain={[0, 1]} 
                            ticks={[0, 1]} 
                            tickFormatter={(value) => value === 1 ? "Yes" : "No"}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            formatter={(value) => [value === 1 ? "Completed" : "Missed", "Status"]}
                            labelFormatter={(label, payload) => {
                              if (payload && payload.length > 0) {
                                const index = payload[0].payload.label;
                                return index;
                              }
                              return label;
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            dot={{ stroke: "hsl(var(--primary))", fill: "white", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "hsl(var(--primary))", fill: "hsl(var(--primary))" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex justify-between mt-4 text-sm">
                      <div>
                        <p className="font-medium">Completion Rate</p>
                        <p className="text-muted-foreground">{completionRate}% in the last 30 days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Current Streak</p>
                        <p className="text-muted-foreground">{habit.streak} days</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="patterns" className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Day of Week Pattern</h3>
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={weekdayPatternData}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="day" 
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} completions`, "Count"]}
                            labelFormatter={(label, payload) => {
                              if (payload && payload.length > 0) {
                                return payload[0].payload.fullDay;
                              }
                              return label;
                            }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="hsl(var(--primary))" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 text-sm">
                      {bestDay.count > 0 ? (
                        <div className="bg-muted px-4 py-3 rounded-lg">
                          <p className="font-medium">Pattern Insight</p>
                          <p className="text-muted-foreground">
                            You're most consistent with this habit on <span className="font-medium text-primary">{bestDay.fullDay}</span>. 
                            Consider scheduling important habits on your most productive days.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-muted px-4 py-3 rounded-lg">
                          <p className="font-medium">Pattern Insight</p>
                          <p className="text-muted-foreground">
                            Not enough data yet to identify patterns. Continue tracking this habit
                            to reveal your natural tendencies.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="insights" className="pt-4">
                    <HabitInsights habitId={habit.id} />
                  </TabsContent>
                </Tabs>
              </div>
              
              <DialogFooter className="px-6 py-4 border-t">
                <Button
                  onClick={() => onEditHabit?.(habit)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Habit
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default HabitDetailModal;