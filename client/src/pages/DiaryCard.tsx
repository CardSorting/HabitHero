import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DBTDiaryCardTracker from "@/components/DBTDiaryCardTracker";
import { startOfWeek, endOfWeek, format, addDays, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";

const DiaryCard: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 6 }));
  
  // Generate dates for the week (Saturday to Friday)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    return addDays(currentWeekStart, i);
  });
  
  const today = new Date();
  const weekRangeText = `${format(weekDates[0], "MMM d")} - ${format(weekDates[6], "MMM d, yyyy")}`;
  
  // Calculate completion rate for week based on localStorage data
  const calculateWeekCompletion = () => {
    const weekKey = format(currentWeekStart, "yyyy-MM-dd");
    const savedData = localStorage.getItem(`dbt-diary-${weekKey}`);
    
    if (!savedData) return 0;
    
    try {
      const data = JSON.parse(savedData);
      // Count fields that have been filled in
      const totalFields = 5 * 7; // 5 categories (sleep, medication, emotions, urges, events) * 7 days
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
        if (Object.values(data.urges[date]).some(urge => 
          Object.values(urge).some(val => val)
        )) {
          filledFields++;
        }
      }
      
      // Count event entries
      for (const date in data.events) {
        if (data.events[date]) {
          filledFields++;
        }
      }
      
      return Math.round((filledFields / totalFields) * 100);
    } catch (e) {
      return 0;
    }
  };
  
  const completionRate = calculateWeekCompletion();
  
  const handlePreviousWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, -7));
  };
  
  const handleNextWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, 7));
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
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-medium">Week of {format(weekDates[0], "MMMM d")}</h2>
                  </div>
                  
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
                  
                  <div className="flex mt-4 space-x-1">
                    {weekDates.map((date, index) => {
                      const isToday = isSameDay(date, today);
                      return (
                        <div 
                          key={index} 
                          className={cn(
                            "flex-1 text-center py-2 relative",
                            isToday && "bg-primary/10 rounded-md"
                          )}
                        >
                          <div className="text-xs font-medium">{format(date, "EEE")}</div>
                          <div className={cn(
                            "text-sm mt-1",
                            isToday ? "font-medium text-primary" : ""
                          )}>
                            {format(date, "d")}
                          </div>
                          {isToday && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-4 bg-primary rounded-full"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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