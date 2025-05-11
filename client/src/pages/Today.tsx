import React, { useState } from "react";
import Header from "@/components/Header";
import FloatingActionButton from "@/components/FloatingActionButton";
import AddHabitModal from "@/components/AddHabitModal";
import DailySummary from "@/components/DailySummary";
import WeeklyOverview from "@/components/WeeklyOverview";
import TrendMicroCard from "@/components/TrendMicroCard";
import HabitDetailModal from "@/components/HabitDetailModal";
import DailyGoalTracker from "@/components/DailyGoalTracker";
import { useHabits } from "@/lib/useHabits";
import { Habit } from "@/lib/types";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";

const Today: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showHabitDetail, setShowHabitDetail] = useState(false);
  
  // Get habits data
  const { 
    habits, 
    isLoading, 
    toggleHabitCompletion, 
    addHabit
  } = useHabits();

  const handleToggleHabit = async (habitId: number, completed: boolean) => {
    try {
      await toggleHabitCompletion(habitId, completed);
      
      if (completed) {
        toast({
          title: "Habit completed!",
          description: "Keep up the good work!",
          variant: "default",
          className: "bg-success text-white",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update habit status",
        variant: "destructive",
      });
    }
  };

  const handleAddHabit = async (data: any) => {
    try {
      await addHabit(data);
      toast({
        title: "Habit created",
        description: "Your new habit has been added",
        variant: "default",
        className: "bg-success text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      });
    }
  };
  
  const handleHabitClick = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowHabitDetail(true);
  };
  
  const handleUpdateHabit = (habit: Habit) => {
    // Just close the modal for now
    setShowHabitDetail(false);
  };

  return (
    <>
      <Header />
      <motion.main 
        className="flex-1 px-6 pb-20 pt-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Apple Health inspired daily summary card */}
        <DailySummary />
        
        {/* Daily goal tracker with DBT skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <DailyGoalTracker />
        </motion.div>
        
        {/* Weekly progress overview with activity rings */}
        <WeeklyOverview />
        
        {/* Habit trends section */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Your Habits
              </h2>
              <span className="text-sm text-muted-foreground">
                {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {habits.map((habit, index) => (
                <TrendMicroCard 
                  key={habit.id}
                  habit={habit}
                  index={index} 
                  onClick={() => handleHabitClick(habit)}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Empty state */}
        {habits.length === 0 && !isLoading && (
          <motion.div 
            className="flex flex-col items-center justify-center py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-full bg-muted p-3 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No habits yet</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-[250px]">
              Create your first habit to start tracking your progress and building better routines
            </p>
          </motion.div>
        )}
      </motion.main>
      
      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />
      
      <AddHabitModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
        onAddHabit={handleAddHabit}
      />
      
      <HabitDetailModal
        habit={selectedHabit}
        open={showHabitDetail}
        onOpenChange={setShowHabitDetail}
        onEditHabit={handleUpdateHabit}
      />
    </>
  );
};

export default Today;
