import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DBTDiaryCardTracker from "../components/DBTDiaryCardTracker";
import { startOfWeek, endOfWeek, format, addDays, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const DiaryCard: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 6 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  
  // Generate dates for the week (Saturday to Friday)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    return addDays(currentWeekStart, i);
  });
  
  const today = new Date();
  const weekRangeText = `${format(weekDates[0], "MMM d")} - ${format(weekDates[6], "MMM d, yyyy")}`;
  
  // Calculate completion rate for selected day or week
  const calculateCompletion = () => {
    const weekKey = format(currentWeekStart, "yyyy-MM-dd");
    const savedData = localStorage.getItem(`dbt-diary-${weekKey}`);
    
    if (!savedData) return 0;
    
    try {
      const data = JSON.parse(savedData);
      
      if (viewMode === 'day') {
        // Focus on completion for selected day only
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const totalFields = 5; // 5 categories for a single day
        let filledFields = 0;
        
        // Check sleep entry
        if (data.sleep[dateStr] && Object.values(data.sleep[dateStr]).some(val => val)) {
          filledFields++;
        }
        
        // Check medication entry
        if (data.medication[dateStr]) {
          filledFields++;
        }
        
        // Check emotion entries
        if (data.emotions[dateStr] && Object.values(data.emotions[dateStr]).some(val => val)) {
          filledFields++;
        }
        
        // Check urge entries
        if (data.urges[dateStr] && Object.keys(data.urges[dateStr]).length > 0) {
          const urgeValues = Object.values(data.urges[dateStr]);
          if (urgeValues.some(urge => {
            if (urge && typeof urge === 'object') {
              return Object.values(urge as any).some(val => val);
            }
            return false;
          })) {
            filledFields++;
          }
        }
        
        // Check event entry
        if (data.events[dateStr]) {
          filledFields++;
        }
        
        return Math.round((filledFields / totalFields) * 100);
      } else {
        // Week view - count all fields for the week
        const totalFields = 5 * 7; // 5 categories * 7 days
        let filledFields = 0;
        
        // Count sleep entries
        for (const date in data.sleep) {
          if (Object.values(data.sleep[date]).some(val => val)) {
            filledFields++;
          }
        }
        
        // Count medication entries
        for (const date in data.medication) {
          if (data.medication[date]) {
            filledFields++;
          }
        }
        
        // Count emotion entries
        for (const date in data.emotions) {
          if (Object.values(data.emotions[date]).some(val => val)) {
            filledFields++;
          }
        }
        
        // Count urge entries
        for (const date in data.urges) {
          if (data.urges[date] && Object.keys(data.urges[date]).length > 0) {
            const urgeValues = Object.values(data.urges[date]);
            if (urgeValues.some(urge => {
              if (urge && typeof urge === 'object') {
                return Object.values(urge as any).some(val => val);
              }
              return false;
            })) {
              filledFields++;
            }
          }
        }
        
        // Count event entries
        for (const date in data.events) {
          if (data.events[date]) {
            filledFields++;
          }
        }
        
        return Math.round((filledFields / totalFields) * 100);
      }
    } catch (e) {
      return 0;
    }
  };
  
  const completionRate = calculateCompletion();
  
  const handlePreviousWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, -7));
  };
  
  const handleNextWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, 7));
  };
  
  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };
  
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'day' ? 'week' : 'day');
  };
  
  return (
    <>
      <Header title="DBT Diary Card" />
      <motion.main 
        className="flex-1 px-4 py-4 overflow-y-auto pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Card className="rounded-[12px] overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 justify-between">
                    <div className="flex items-center">
                      <CalendarDays className="h-5 w-5 text-primary mr-2" />
                      {viewMode === 'day' ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className={cn(
                                "justify-start text-left font-normal hover:bg-transparent",
                                isToday(selectedDate) && "border-primary text-primary"
                              )}
                            >
                              <span className="text-base font-medium">
                                {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE, MMMM d")}
                              </span>
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => date && handleDaySelect(date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <h2 className="text-lg font-medium">Week of {format(weekDates[0], "MMMM d")}</h2>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleViewMode}
                      className="text-xs px-2"
                    >
                      {viewMode === 'day' ? 'View Week' : 'View Day'}
                    </Button>
                  </div>
                  
                  {viewMode === 'week' && (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handlePreviousWeek}
                          className="h-6 w-6 rounded-full"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span>{weekRangeText}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleNextWeek}
                          className="h-6 w-6 rounded-full"
                          disabled={weekDates[6] > new Date()}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {viewMode === 'week' ? (
                    <div className="flex mt-4 space-x-1">
                      {weekDates.map((date, index) => {
                        const isCurrentDay = isSameDay(date, selectedDate);
                        return (
                          <div 
                            key={index} 
                            className={cn(
                              "flex-1 text-center py-2 relative cursor-pointer transition-colors",
                              isCurrentDay ? "bg-primary/10 rounded-md" : "hover:bg-muted/50 rounded-md"
                            )}
                            onClick={() => handleDaySelect(date)}
                          >
                            <div className="text-xs font-medium">{format(date, "EEE")}</div>
                            <div className={cn(
                              "text-sm mt-1",
                              isCurrentDay ? "font-medium text-primary" : ""
                            )}>
                              {format(date, "d")}
                            </div>
                            {isCurrentDay && (
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-4 bg-primary rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Badge variant="outline" className={cn(
                        "text-sm py-1 px-2", 
                        isToday(selectedDate) ? "bg-primary/10 text-primary border-primary" : "bg-muted"
                      )}>
                        {isToday(selectedDate) ? "Today's entries" : "Entries for " + format(selectedDate, "MMMM d")}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <ProgressRing 
                    value={completionRate} 
                    size={80} 
                    strokeWidth={8}
                    fgColor={getColorByCompletion(completionRate)}
                    showLabel={true}
                    animate={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <Tabs defaultValue="sleep" className="mb-6">
          <TabsList className="grid grid-cols-5 mb-4 rounded-xl">
            <TabsTrigger value="sleep" className="rounded-l-xl">Sleep</TabsTrigger>
            <TabsTrigger value="emotions">Emotions</TabsTrigger>
            <TabsTrigger value="urges">Urges</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="events" className="rounded-r-xl">Events</TabsTrigger>
          </TabsList>
          
          <DBTDiaryCardTracker 
            weekDates={weekDates}
            currentWeekStart={currentWeekStart}
            selectedDate={selectedDate}
            viewMode={viewMode}
          />
        </Tabs>
      </motion.main>
    </>
  );
};

// Helper function to get color based on completion rate
function getColorByCompletion(rate: number): string {
  if (rate >= 80) return "hsl(var(--success))";
  if (rate >= 60) return "hsl(var(--primary))";
  if (rate >= 40) return "hsl(var(--warning, 38 92% 50%))";
  if (rate >= 20) return "hsl(var(--amber-500, 25 95% 53%))";
  return "hsl(var(--muted-foreground))";
}

export default DiaryCard;