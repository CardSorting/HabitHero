import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DBTDiaryCardTracker from "@/components/DBTDiaryCardTracker";
import { startOfWeek, endOfWeek, format, addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DiaryCard: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 6 }));
  
  // Generate dates for the week (Saturday to Friday)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    return addDays(currentWeekStart, i);
  });
  
  const weekRangeText = `${format(weekDates[0], "MMM d")} - ${format(weekDates[6], "MMM d, yyyy")}`;
  
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
        <Card className="rounded-[12px] mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePreviousWeek}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-lg font-medium">Week of</h2>
                <p className="text-sm text-muted-foreground">{weekRangeText}</p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNextWeek}
                className="h-8 w-8"
                disabled={weekDates[6] > new Date()}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="sleep" className="mb-6">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="emotions">Emotions</TabsTrigger>
            <TabsTrigger value="urges">Urges</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
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

export default DiaryCard;