import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, getDay, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface HeatmapCalendarProps {
  data: Record<string, number>;
  month?: Date;
  title?: string;
  description?: string;
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  data,
  month = new Date(),
  title = "Monthly Activity",
  description = "Your habit completion across the month"
}) => {
  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month)
  });
  
  // Get the day of the week (0-6) for the first day of the month
  const firstDayOfMonth = getDay(startOfMonth(month));
  
  // Create array of weekday labels
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Helper to get intensity class based on completion count
  const getIntensityClass = (dateStr: string) => {
    if (!data[dateStr]) return "bg-muted";
    
    const count = data[dateStr];
    if (count === 0) return "bg-muted";
    if (count <= 1) return "bg-primary/20";
    if (count <= 2) return "bg-primary/40";
    if (count <= 3) return "bg-primary/60";
    if (count <= 4) return "bg-primary/80";
    return "bg-primary";
  };
  
  // Calculate max value for the legend
  const maxValue = Object.values(data).reduce((max, val) => Math.max(max, val), 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-[12px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map((day, index) => (
              <div key={index} className="text-xs text-center text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}
            
            {/* Actual days of the month */}
            {daysInMonth.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={dateStr} 
                  className="relative aspect-square"
                >
                  <div 
                    className={cn(
                      "absolute inset-[2px] rounded-[4px] flex items-center justify-center",
                      getIntensityClass(dateStr),
                      isToday && "ring-2 ring-primary"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium",
                      data[dateStr] > 0 ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {format(day, "d")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Less</span>
              {[20, 40, 60, 80, 100].map((intensity, i) => (
                <div 
                  key={intensity} 
                  className={`w-5 h-5 rounded-[4px] bg-primary/${intensity}`}
                  title={`${Math.round((intensity/100) * maxValue)} habits`}
                ></div>
              ))}
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HeatmapCalendar;