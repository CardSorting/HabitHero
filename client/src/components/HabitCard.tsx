import React from "react";
import { Habit, DayRecord } from "@/lib/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { format, subDays, startOfDay, isSameDay } from "date-fns";

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: (habitId: number, completed: boolean) => void;
}

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggleCompletion }) => {
  const { id, name, description, streak, completionRecords } = habit;
  
  const today = startOfDay(new Date());
  const isCompletedToday = completionRecords.some(
    record => isSameDay(new Date(record.date), today) && record.completed
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const record = completionRecords.find(r => isSameDay(new Date(r.date), date));
    return {
      date,
      day: format(date, "E").charAt(0),
      completed: record ? record.completed : false
    };
  });

  const completionPercentage = Math.round(
    (last7Days.filter(day => day.completed).length / 7) * 100
  );

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggleCompletion(id, e.target.checked);
  };

  return (
    <motion.div 
      className={cn(
        "mb-5 habit-wrapper", 
        isCompletedToday && "completed-habit"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div 
        className={cn(
          "habit-card bg-white rounded-[12px] border border-muted p-5 shadow-sm",
          isCompletedToday && "border-success"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4 relative">
              <input 
                type="checkbox" 
                id={`habit-${id}`} 
                checked={isCompletedToday}
                onChange={handleToggle}
                className="habit-checkbox opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" 
              />
              <div className="habit-checkmark w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-primary">
              {streak} day streak
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs text-muted-foreground mb-2">Last 7 days</h4>
            <span className="text-xs text-muted-foreground">{completionPercentage}%</span>
          </div>
          <div className="flex justify-between gap-1">
            {last7Days.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "streak-dot w-6 h-6 rounded-full mb-1 flex items-center justify-center text-white text-xs",
                    day.completed ? "bg-success" : "bg-muted"
                  )}
                >
                  {day.completed && <Check className="h-3 w-3" />}
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
