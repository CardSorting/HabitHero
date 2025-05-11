import React, { useState } from "react";
import Header from "@/components/Header";
import DailyProgressSummary from "@/components/DailyProgressSummary";
import HabitsList from "@/components/HabitsList";
import FloatingActionButton from "@/components/FloatingActionButton";
import AddHabitModal from "@/components/AddHabitModal";
import HabitInsights from "@/components/HabitInsights";
import { useHabits } from "@/lib/useHabits";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const Today: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { 
    habits, 
    isLoading, 
    toggleHabitCompletion, 
    addHabit
  } = useHabits();

  const completedHabitsCount = habits.filter(habit => {
    const today = new Date();
    return habit.completionRecords.some(
      record => 
        new Date(record.date).setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0) && 
        record.completed
    );
  }).length;

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

  return (
    <>
      <Header />
      <motion.main 
        className="flex-1 px-6 py-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <DailyProgressSummary 
          completedHabits={completedHabitsCount} 
          totalHabits={habits.length} 
        />
        
        {/* Only show insights if there are habits */}
        {habits.length > 0 && (
          <div className="mb-8">
            <HabitInsights compact={true} />
          </div>
        )}
        
        <HabitsList 
          habits={habits}
          onToggleHabit={handleToggleHabit}
          isLoading={isLoading}
        />
      </motion.main>
      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />
      <AddHabitModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
        onAddHabit={handleAddHabit}
      />
    </>
  );
};

export default Today;
