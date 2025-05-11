import React, { useState } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { useHabits } from "@/lib/useHabits";
import { useAnalytics } from "@/lib/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { isSameDay, format, subMonths, addMonths } from "date-fns";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import HeatmapCalendar from "@/components/HeatmapCalendar";

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { habits, isLoading } = useHabits();
  const { getHeatmapData } = useAnalytics();

  const habitsForSelectedDate = selectedDate
    ? habits.map(habit => {
        const completedOnDate = habit.completionRecords.some(
          record => 
            isSameDay(new Date(record.date), selectedDate) && 
            record.completed
        );
        
        return {
          ...habit,
          completedOnDate
        };
      })
    : [];

  // Calculate dates with completed habits for calendar highlighting
  const getCompletedDates = () => {
    const dates = new Set<number>();
    
    habits.forEach(habit => {
      habit.completionRecords.forEach(record => {
        if (record.completed) {
          const timestamp = new Date(record.date).setHours(0, 0, 0, 0);
          dates.add(timestamp);
        }
      });
    });
    
    return Array.from(dates).map(timestamp => new Date(timestamp));
  };
  
  const completedDates = getCompletedDates();

  if (isLoading) {
    return (
      <>
        <Header title="Calendar" />
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          <Skeleton className="h-[350px] w-full rounded-[12px] mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-[12px]" />
            <Skeleton className="h-16 w-full rounded-[12px]" />
            <Skeleton className="h-16 w-full rounded-[12px]" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Calendar" />
      <motion.main 
        className="flex-1 px-6 py-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-[12px] mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Calendar View</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{
                  completed: completedDates,
                }}
                modifiersStyles={{
                  completed: {
                    backgroundColor: "rgba(91, 95, 246, 0.1)",
                    color: "hsl(var(--primary))",
                    fontWeight: "bold",
                  }
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <HeatmapCalendar 
            data={getHeatmapData()} 
            month={currentMonth}
            title="Habit Completion Heatmap" 
            description="Visual representation of your daily habit activity" 
          />
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-medium mb-4">
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </h2>
          
          {habitsForSelectedDate.length > 0 ? (
            habitsForSelectedDate.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className={`rounded-[12px] border ${habit.completedOnDate ? 'border-success' : 'border-muted'}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{habit.name}</h3>
                      <p className="text-sm text-muted-foreground">{habit.description}</p>
                    </div>
                    {habit.completedOnDate && (
                      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No habits tracked for this day
            </p>
          )}
        </motion.div>
      </motion.main>
    </>
  );
};

export default Calendar;
